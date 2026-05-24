/** Query value for HealthLog — show urgent/emergency entries only. */
export const JOURNAL_ATTENTION_FILTER = 'attention'

export function journalAttentionListRoute() {
  return {
    path: '/journal',
    query: { filter: JOURNAL_ATTENTION_FILTER },
  } as const
}

export function journalEntryRoute(entryId: string) {
  return {
    path: '/journal',
    query: { entry: entryId },
  } as const
}

export function journalAllEntriesRoute() {
  return { path: '/journal' } as const
}

export function isAttentionUrgency(urgency: string): boolean {
  return urgency === 'urgent' || urgency === 'emergency'
}
