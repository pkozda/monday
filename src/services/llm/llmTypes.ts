export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmChatOptions {
  temperature?: number
  jsonMode?: boolean
  /** Output tokens; defaults to 512 for Groq-friendly limits. */
  maxTokens?: number
  /** Skip map-reduce even when over budget (use with care). */
  skipChunking?: boolean
}
