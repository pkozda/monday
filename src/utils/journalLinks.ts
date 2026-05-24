import type { HealthEntry, RecommendationJournalLink } from '@/models/types'
import { isAttentionUrgency } from '@/utils/journalRoutes'

export function journalLinkFromEntry(entry: HealthEntry): RecommendationJournalLink {
  return {
    entryId: entry.id,
    title: entry.title.trim(),
    eventDate: entry.eventDate,
    conditionArea: entry.conditionArea.trim(),
    urgency: entry.analysis.urgency,
  }
}

export function attentionJournalLinks(entries: HealthEntry[]): RecommendationJournalLink[] {
  return entries
    .filter((e) => isAttentionUrgency(e.analysis.urgency))
    .map(journalLinkFromEntry)
}
