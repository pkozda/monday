/**
 * Turn a day count into readable text (years, months, weeks, days).
 * Uses approximate month = 30 days for stable display from totals.
 */
export function formatFriendlyDayCount(totalDays: number): string {
  const days = Math.max(1, Math.round(totalDays))

  if (days === 1) return '1 day'
  if (days < 14) return `${days} days`

  const years = Math.floor(days / 365)
  let remainder = days % 365
  const months = Math.floor(remainder / 30)
  remainder = remainder % 30

  const parts: string[] = []

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)
  }

  if (parts.length > 0) {
    return parts.join(' · ')
  }

  const weeks = Math.floor(days / 7)
  if (weeks >= 2) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  }

  return `${days} days`
}
