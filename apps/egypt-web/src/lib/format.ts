export function formatAge(timestamp?: string | null) {
  if (!timestamp) return '-'
  const diffMs = Date.now() - Date.parse(timestamp)
  if (Number.isNaN(diffMs) || diffMs < 0) return '-'
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  return `${months}mo`
}

export function formatNumber(value: number) {
  return value.toLocaleString('en-US')
}
