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
