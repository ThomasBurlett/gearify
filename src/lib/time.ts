export function toLocalHourInput(date: Date) {
  const copy = new Date(date)
  copy.setMinutes(0, 0, 0)
  const tzOffset = copy.getTimezoneOffset() * 60000
  const localISO = new Date(copy.getTime() - tzOffset).toISOString().slice(0, 16)
  return localISO
}

export function setHourForDate(base: Date, hour: number) {
  const copy = new Date(base)
  copy.setHours(hour, 0, 0, 0)
  return copy
}

export function formatDistanceToNow(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 120) return '1m'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 7200) return '1h'
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}
