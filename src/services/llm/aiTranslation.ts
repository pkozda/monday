import type { AppLocale } from '@/i18n'
import { chatCompletion, chatCompletionJson } from '@/services/llm/llmClient'
import { isLlmProxyConfigured } from '@/services/llm/config'
import { runLlmTranslation } from '@/services/llm/llmTranslationGate'
import type { HealthEntryInput } from '@/models/types'

const RU_EN_SYSTEM = `You translate patient health journal text from Russian into English for storage and clinical analysis.
- Infer the intended meaning when there are typos, missing letters, or informal wording.
- Use clear clinical English; keep medical terms accurate.
- Do not add symptoms, diagnoses, tests, or facts that are not in the source.
- Return only the translation — no quotes, labels, or commentary.`

const EN_LOCALE_NAMES: Record<Exclude<AppLocale, 'en'>, string> = {
  de: 'German',
  ru: 'Russian',
}

export function isAiTranslationAvailable(): boolean {
  return isLlmProxyConfigured()
}

export async function translateRussianToEnglish(text: string): Promise<string> {
  return runLlmTranslation(async () => {
    const trimmed = text.trim()
    if (!trimmed) return trimmed

    const result = await chatCompletion(
      [
        { role: 'system', content: RU_EN_SYSTEM },
        { role: 'user', content: trimmed },
      ],
      { temperature: 0.15, maxTokens: 2000 }
    )

    const english = result.trim()
    if (!english) {
      throw new Error('AI translation returned an empty result')
    }
    return english
  })
}

export type JournalTranslationField = keyof Pick<
  HealthEntryInput,
  'conditionArea' | 'title' | 'description' | 'medications'
>

export async function translateRussianJournalFields(
  input: HealthEntryInput,
  fields: JournalTranslationField[]
): Promise<HealthEntryInput> {
  return runLlmTranslation(async () => {
    const payload: Record<string, string> = {}
    for (const field of fields) {
      const value = input[field]?.trim()
      if (value) payload[field] = value
    }

    if (Object.keys(payload).length === 0) return input

    const response = await chatCompletionJson<{
      translations: Partial<Record<JournalTranslationField, string>>
    }>(
      [
        { role: 'system', content: RU_EN_SYSTEM },
        {
          role: 'user',
          content: `Translate each field value to English. Handle typos and colloquial Russian; keep medical meaning faithful to the source.

Return JSON only:
{
  "translations": {
    ${fields.map((f) => `"${f}": string`).join(',\n    ')}
  }
}

Russian fields:
${JSON.stringify(payload, null, 2)}`,
        },
      ],
      { temperature: 0.15, maxTokens: 3000 }
    )

    const next = { ...input }
    for (const field of fields) {
      const translated = response.translations?.[field]?.trim()
      if (translated) next[field] = translated
    }

    const missing = fields.filter((f) => {
      const source = input[f]?.trim()
      return source && !next[f]?.trim()
    })
    if (missing.length > 0) {
      throw new Error(`AI translation missing fields: ${missing.join(', ')}`)
    }

    return next
  })
}

export async function translateEnglishToLocale(
  text: string,
  locale: Exclude<AppLocale, 'en'>
): Promise<string> {
  return runLlmTranslation(async () => {
    const trimmed = text.trim()
    if (!trimmed) return trimmed

    const result = await chatCompletion(
      [
        {
          role: 'system',
          content: `Translate English health-app text into ${EN_LOCALE_NAMES[locale]} for patient-facing UI.
Use natural, clear language. Return only the translation.`,
        },
        { role: 'user', content: trimmed },
      ],
      { temperature: 0.15, maxTokens: 1500 }
    )

    const translated = result.trim()
    if (!translated) {
      throw new Error('AI UI translation returned an empty result')
    }
    return translated
  })
}
