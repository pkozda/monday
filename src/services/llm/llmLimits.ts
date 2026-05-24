/** Groq / OpenAI-compatible request sizing (tunable via .env). */

export const DEFAULT_LLM_MAX_OUTPUT_TOKENS = 512

const DEFAULT_MAX_INPUT_TOKENS = 8_000
const DEFAULT_CHUNK_TARGET_INPUT_TOKENS = 3_200
const DEFAULT_SAFETY_MARGIN_TOKENS = 256
/** Groq free-tier llama-3.1-8b-instant TPM (tune in .env.local). */
const DEFAULT_TPM_LIMIT = 6_000
const DEFAULT_TPM_SAFETY_RATIO = 0.85
const DEFAULT_MIN_REQUEST_GAP_MS = 350

function readPositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(String(raw ?? '').trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function readRatio(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(String(raw ?? '').trim())
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1) return fallback
  return parsed
}

export function getLlmMaxInputTokensPerRequest(): number {
  return readPositiveInt(
    import.meta.env.VITE_LLM_MAX_INPUT_TOKENS as string | undefined,
    DEFAULT_MAX_INPUT_TOKENS
  )
}

export function getLlmChunkTargetInputTokens(): number {
  return readPositiveInt(
    import.meta.env.VITE_LLM_CHUNK_TARGET_TOKENS as string | undefined,
    DEFAULT_CHUNK_TARGET_INPUT_TOKENS
  )
}

export function getInputTokenBudget(maxOutputTokens: number): number {
  const margin = readPositiveInt(
    import.meta.env.VITE_LLM_SAFETY_MARGIN_TOKENS as string | undefined,
    DEFAULT_SAFETY_MARGIN_TOKENS
  )
  return Math.max(
    512,
    getLlmMaxInputTokensPerRequest() - maxOutputTokens - margin
  )
}

export function getLlmTpmLimit(): number {
  return readPositiveInt(
    import.meta.env.VITE_LLM_TPM_LIMIT as string | undefined,
    DEFAULT_TPM_LIMIT
  )
}

export function getLlmTpmSafetyRatio(): number {
  return readRatio(
    import.meta.env.VITE_LLM_TPM_SAFETY_RATIO as string | undefined,
    DEFAULT_TPM_SAFETY_RATIO
  )
}

export function getLlmMinRequestGapMs(): number {
  return readPositiveInt(
    import.meta.env.VITE_LLM_MIN_REQUEST_GAP_MS as string | undefined,
    DEFAULT_MIN_REQUEST_GAP_MS
  )
}
