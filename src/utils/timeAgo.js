export function timeAgo(dateString) {
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now - past
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ${diffMin % 60}m ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

export function minutesBetween(start, end) {
  return Math.round((new Date(end) - new Date(start)) / 60000)
}
