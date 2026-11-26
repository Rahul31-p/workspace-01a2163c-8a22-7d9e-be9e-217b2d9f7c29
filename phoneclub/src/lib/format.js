const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('en-IN')

export function formatCurrency(value) {
  return inr.format(value ?? 0)
}

export function formatNumber(value) {
  return number.format(value ?? 0)
}

/** Short axis labels: 125000 -> ₹1.25L, 1200 -> ₹1.2K */
export function formatCompactCurrency(value) {
  const amount = Number(value) || 0

  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount >= 1000000 ? 1 : 2)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

export function formatShortDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export function formatSignedPercent(value) {
  const rounded = Number(value) || 0
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}%`
}

export function formatRelativeTime(timestamp, reference = new Date()) {
  const time = new Date(timestamp).getTime()
  const diffMinutes = Math.max(0, Math.round((new Date(reference).getTime() - time) / 60000))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const hours = Math.floor(diffMinutes / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`

  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
