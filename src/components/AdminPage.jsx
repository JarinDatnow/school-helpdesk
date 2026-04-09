import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { minutesBetween } from '../utils/timeAgo'

function topN(arr, n = 5) {
  if (!arr.length) return []
  const counts = {}
  arr.forEach(v => { if (v) counts[v] = (counts[v] || 0) + 1 })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }))
}

function formatMinutes(mins) {
  if (mins == null || isNaN(mins)) return 'N/A'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function exportToCSV(tickets) {
  const headers = ['Date', 'Parent Name', 'Teacher', 'Grade', 'Subject', 'Query', 'Attended By', 'Resolution Time', 'Status']
  const rows = tickets.map(t => {
    const resTime = t.resolved_at
      ? formatMinutes(minutesBetween(t.created_at, t.resolved_at))
      : ''
    return [
      new Date(t.created_at).toLocaleString(),
      t.parent_name,
      t.teacher,
      t.grade || '',
      t.subject || '',
      t.message,
      t.attended_by || '',
      resTime,
      t.status,
    ]
  })
  const escape = v => `"${String(v).replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `resolved-tickets-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function AdminPage({ goBack }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [purging, setPurging] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error', text }

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
      setTickets(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const resolved = tickets.filter(t => t.status === 'resolved')
  const open = tickets.filter(t => t.status === 'open')
  const attending = tickets.filter(t => t.status === 'attending')

  // Average resolution time (only for resolved tickets that have resolved_at)
  const resolvedWithTime = resolved.filter(t => t.resolved_at)
  const avgResolutionMins = resolvedWithTime.length
    ? Math.round(
        resolvedWithTime.reduce((sum, t) => sum + minutesBetween(t.created_at, t.resolved_at), 0) /
          resolvedWithTime.length
      )
    : null

  const topTeachers = topN(tickets.map(t => t.teacher), 5)
  const busiestGrade = topN(tickets.map(t => t.grade).filter(Boolean), 1)[0]
  const topSubjects = topN(tickets.map(t => t.subject).filter(Boolean), 5)

  async function handlePurge() {
    const confirmed = window.confirm(
      `This will permanently delete all ${resolved.length} resolved ticket(s) from the database.\n\nMake sure you have exported the CSV first.\n\nContinue?`
    )
    if (!confirmed) return

    setPurging(true)
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('status', 'resolved')

    setPurging(false)
    if (error) {
      setMessage({ type: 'error', text: 'Purge failed: ' + error.message })
    } else {
      const count = resolved.length
      setTickets(prev => prev.filter(t => t.status !== 'resolved'))
      setMessage({ type: 'success', text: `${count} resolved ticket(s) deleted successfully.` })
    }
  }

  const statCard = (label, value, sub) => (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
      <p className="text-2xl font-bold text-amber-900">{value}</p>
      <p className="text-sm font-medium text-amber-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-amber-400 mt-1">{sub}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">Admin Panel</p>
            <p className="text-sm font-semibold text-amber-900">End-of-session tools</p>
          </div>
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-amber-700 hover:text-amber-900 text-sm font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Notification */}
        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-3 opacity-60 hover:opacity-100 text-xs">✕</button>
          </div>
        )}

        {/* Stats */}
        <section>
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">Session Statistics</h2>
          {loading ? (
            <div className="text-center py-8 text-amber-400 text-sm">Loading…</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {statCard('Total Tickets', tickets.length, 'All time this session')}
              {statCard('Open', open.length, 'Awaiting attention')}
              {statCard('Attending', attending.length, 'Currently being seen')}
              {statCard('Resolved', resolved.length, 'Completed')}
              {statCard('Avg Resolution Time', formatMinutes(avgResolutionMins),
                resolvedWithTime.length ? `Based on ${resolvedWithTime.length} ticket(s)` : 'No resolved tickets yet'
              )}
              {statCard('Busiest Grade', busiestGrade ? busiestGrade.name : 'N/A',
                busiestGrade ? `${busiestGrade.count} ticket(s)` : ''
              )}

              {/* Top 5 most queried teachers */}
              <div className="col-span-2 bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
                <p className="text-sm font-medium text-amber-700 mb-3">Most Queried Teachers</p>
                {topTeachers.length === 0 ? (
                  <p className="text-sm text-amber-400">No data yet</p>
                ) : (
                  <ol className="space-y-1.5">
                    {topTeachers.map(({ name, count }, i) => (
                      <li key={name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-amber-400 w-4 flex-shrink-0">{i + 1}.</span>
                          <span className="text-sm text-amber-900 truncate">{name}</span>
                        </div>
                        <span className="text-xs font-semibold text-amber-500 flex-shrink-0">{count} ticket{count !== 1 ? 's' : ''}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Top subjects */}
              <div className="col-span-2 bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
                <p className="text-sm font-medium text-amber-700 mb-3">Most Common Subjects</p>
                {topSubjects.length === 0 ? (
                  <p className="text-sm text-amber-400">No data yet</p>
                ) : (
                  <ol className="space-y-1.5">
                    {topSubjects.map(({ name, count }, i) => (
                      <li key={name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-amber-400 w-4 flex-shrink-0">{i + 1}.</span>
                          <span className="text-sm text-amber-900 truncate">{name}</span>
                        </div>
                        <span className="text-xs font-semibold text-amber-500 flex-shrink-0">{count} ticket{count !== 1 ? 's' : ''}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Export & Cleanup */}
        <section>
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">Export & Cleanup</h2>
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Export Resolved to CSV</p>
                  <p className="text-xs text-amber-500 mt-0.5">
                    {resolved.length} resolved ticket(s) · date, parent, teacher, grade, subject, query, attended by, resolution time.
                  </p>
                </div>
                <button
                  onClick={() => exportToCSV(resolved)}
                  disabled={resolved.length === 0}
                  className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download CSV
                </button>
              </div>
            </div>

            <div className="border-t border-amber-100 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-red-700 text-sm">Purge Resolved Tickets</p>
                  <p className="text-xs text-red-400 mt-0.5">
                    Permanently deletes all {resolved.length} resolved ticket(s). Export first — this cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handlePurge}
                  disabled={purging || resolved.length === 0}
                  className="flex-shrink-0 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  {purging ? 'Purging…' : 'Purge Resolved'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-amber-300 pb-4">
          Run this at the end of each Parent–Teacher Week to keep your database clean.
        </p>
      </div>
    </div>
  )
}
