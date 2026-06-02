import { db } from '@/db/database'
import type { HypothesisAssistantMessage } from '@/models/types'

const CHAT_ID = 'current'
const MAX_STORED_MESSAGES = 100

/** IndexedDB cannot store Vue reactive proxies — copy to plain objects at the DB boundary. */
function plainMessages(messages: HypothesisAssistantMessage[]): HypothesisAssistantMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
  }))
}

function trimMessages(messages: HypothesisAssistantMessage[]): HypothesisAssistantMessage[] {
  if (messages.length <= MAX_STORED_MESSAGES) return messages
  return messages.slice(-MAX_STORED_MESSAGES)
}

export async function getHypothesisAssistantMessages(): Promise<HypothesisAssistantMessage[]> {
  const row = await db.hypothesisAssistantChats.get(CHAT_ID)
  return row?.messages ?? []
}

export async function countHypothesisAssistantMessages(): Promise<number> {
  const messages = await getHypothesisAssistantMessages()
  return messages.length
}

export async function saveHypothesisAssistantMessages(
  messages: HypothesisAssistantMessage[]
): Promise<void> {
  const trimmed = trimMessages(plainMessages(messages))
  await db.hypothesisAssistantChats.put({
    id: CHAT_ID,
    messages: trimmed,
    updatedAt: new Date().toISOString(),
  })
}

export async function clearHypothesisAssistantMessages(): Promise<void> {
  await db.hypothesisAssistantChats.delete(CHAT_ID)
}
