const elevationFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatElevationFeet(meters?: number | null) {
  if (meters === null || meters === undefined) return null
  const feet = Math.round(meters * 3.28084)
  return `${elevationFormatter.format(feet)} ft`
}

export function formatLocalDateTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return timeFormatter.format(parsed)
}
