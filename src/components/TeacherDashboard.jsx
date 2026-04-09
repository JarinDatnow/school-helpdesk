import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import TicketCard from './TicketCard'

const FILTERS = ['all', 'open', 'attending', 'resolved']
const FILTER_LABELS = { all: 'All', open: 'Open', attending: 'Attending', resolved: 'Resolved' }

export default function TeacherDashboard({ teacher, goBack, goAdmin }) {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({}) // { [id]: 'attending'|'resolving' }

  const fetchTickets = useCallback(async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setTickets(data || [])
    }
    setLoading(false)
  }, [])

  // Initial load + auto-refresh every 3 seconds
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTickets()
    const interval = setInterval(fetchTickets, 3000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  async function handleAttend(id) {
    setActionLoading(prev => ({ ...prev, [id]: 'attending' }))
    await supabase
      .from('tickets')
      .update({ status: 'attending', attended_by: teacher })
      .eq('id', id)
    await fetchTickets()
    setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  async function handleResolve(id) {
    setActionLoading(prev => ({ ...prev, [id]: 'resolving' }))
    await supabase
      .from('tickets')
      .update({ status: 'resolved', attended_by: teacher, resolved_at: new Date().toISOString() })
      .eq('id', id)
    await fetchTickets()
    setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  const counts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    attending: tickets.filter(t => t.status === 'attending').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-amber-500 font-medium uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-semibold text-amber-900 truncate">{teacher}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={goAdmin}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Admin
            </button>
            <button
              onClick={goBack}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-1.5 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                filter === f
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              {FILTER_LABELS[f]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filter === f ? 'bg-amber-400 text-white' : 'bg-amber-200 text-amber-700'
              }`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-16 text-amber-400">
            <div className="w-8 h-8 border-4 border-amber-300 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading tickets…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-amber-600 font-medium">No {filter === 'all' ? '' : filter} tickets yet</p>
            <p className="text-amber-400 text-sm mt-1">They'll appear here automatically</p>
          </div>
        ) : (
          filtered.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              currentTeacher={teacher}
              onAttend={handleAttend}
              onResolve={handleResolve}
              attending={actionLoading[ticket.id] === 'attending'}
              resolving={actionLoading[ticket.id] === 'resolving'}
            />
          ))
        )}
      </div>

      {/* Live indicator */}
      {!loading && (
        <div className="fixed bottom-4 right-4 flex items-center gap-1.5 bg-white border border-amber-200 rounded-full px-3 py-1.5 shadow-sm text-xs text-amber-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>
      )}
    </div>
  )
}
