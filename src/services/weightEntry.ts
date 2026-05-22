/** Detect and parse body-weight notes (EN/RU) for journal import and classification. */

const WEIGHT_TEXT =
  /\b(weight|weigh|weighed|body\s+weight|вес|масса\s+тела)\b/i

const WEIGHT_KG =
  /\b(\d{2,3})\s*(?:[–—-]\s*(\d{2,3}))?\s*(?:kg|кг)\b/i

export function isWeightRelatedText(text: string): boolean {
  return WEIGHT_TEXT.test(text) && WEIGHT_KG.test(text)
}

/** Normalized kg value for deduping, e.g. "95-96" or "82". */
export function extractWeightKg(text: string): string {
  const match = text.match(WEIGHT_KG)
  if (!match) return 'unknown'
  if (match[2]) return `${match[1]}-${match[2]}`
  return match[1]
}

export function weightEntryFingerprint(
  eventDate: string,
  text: string
): string {
  const month = eventDate.slice(0, 7)
  return `weight|${month}|${extractWeightKg(text)}`
}

export function buildWeightTitle(text: string, eventDate: string): string {
  const kg = extractWeightKg(text)
  const month = eventDate.slice(0, 7)
  return `Weight ~${kg} kg (${month})`
}
