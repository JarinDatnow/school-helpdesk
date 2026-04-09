import { timeAgo } from '../utils/timeAgo'

const STATUS_STYLES = {
  open: 'bg-amber-100 text-amber-800',
  attending: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
}

const STATUS_LABELS = {
  open: 'Open',
  attending: 'Attending',
  resolved: 'Resolved',
}

export default function TicketCard({ ticket, onAttend, onResolve, attending, resolving }) {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-amber-900 text-sm leading-tight">{ticket.parent_name}</p>
          <p className="text-xs text-amber-500 mt-0.5">→ {ticket.teacher}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[ticket.status] || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[ticket.status] || ticket.status}
        </span>
      </div>

      {/* Grade / Subject */}
      {(ticket.grade || ticket.subject) && (
        <div className="flex flex-wrap gap-2">
          {ticket.grade && (
            <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {ticket.grade}
            </span>
          )}
          {ticket.subject && (
            <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {ticket.subject}
            </span>
          )}
        </div>
      )}

      {/* Message */}
      <p className="text-sm text-gray-700 leading-relaxed">{ticket.message}</p>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="text-xs text-amber-400 space-y-0.5">
          <p>{timeAgo(ticket.created_at)}</p>
          {ticket.attended_by && (
            <p className="text-blue-400">Attended by {ticket.attended_by}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {ticket.status === 'open' && (
            <button
              onClick={() => onAttend(ticket.id)}
              disabled={attending}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {attending ? '…' : 'Attend'}
            </button>
          )}
          {(ticket.status === 'open' || ticket.status === 'attending') && (
            <button
              onClick={() => onResolve(ticket.id)}
              disabled={resolving}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {resolving ? '…' : 'Resolve'}
            </button>
          )}
          {ticket.status === 'resolved' && (
            <span className="text-xs text-green-500 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Done
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
