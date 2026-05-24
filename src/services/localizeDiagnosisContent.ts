import type { Composer } from 'vue-i18n'
import type {
  DiagnosisCertainty,
  DiagnosisCriterion,
  DiagnosisReport,
  DiagnosisVariant,
} from '@/models/types'
import { translateUiText } from '@/services/uiTranslation'
import type { AppLocale } from '@/i18n'
import { localizeHypothesisConfidence } from '@/services/localizeClinical'
import {
  getDiagnosisMatchProfile,
  resolveVariantDiseaseId,
} from '@/services/diagnosisUserCopy'

export { getDiagnosisMatchProfile } from '@/services/diagnosisUserCopy'
export type { JournalAlignment } from '@/services/diagnosisUserCopy'

type TFunction = Composer['t']

const CERTAINTY_KEYS: Record<DiagnosisCertainty, string> = {
  high: 'diagnosis.certaintyReportHigh',
  moderate: 'diagnosis.certaintyReportModerate',
  low: 'diagnosis.certaintyReportLow',
}

function normalizeDiagnosisCertainty(
  certainty: DiagnosisCertainty | 'medium'
): DiagnosisCertainty {
  if (certainty === 'medium') return 'moderate'
  if (certainty === 'high' || certainty === 'moderate' || certainty === 'low') {
    return certainty
  }
  return 'low'
}

export function localizeDiagnosisCertaintyLabel(
  certainty: DiagnosisCertainty,
  t: TFunction
): string {
  const normalized = normalizeDiagnosisCertainty(
    certainty as DiagnosisCertainty | 'medium'
  )
  const key = CERTAINTY_KEYS[normalized]
  return String(t(key))
}

export function localizeJournalAlignment(
  variant: Pick<
    DiagnosisVariant,
    'id' | 'diseaseId' | 'percentage' | 'confirmCriteria' | 'excludeCriteria'
  >,
  t: TFunction
): string {
  const exclusions = variant.excludeCriteria.filter(
    (c) => c.status === 'exclusion_present'
  ).length

  const profile = getDiagnosisMatchProfile({
    percentage: variant.percentage,
    diseaseId: resolveVariantDiseaseId(variant),
    confirmCriteria: variant.confirmCriteria,
    exclusions,
  })

  return String(t(`diagnosis.journalMatch.${profile.alignment}`))
}

export function localizeDiagnosisRationale(
  variant: Pick<
    DiagnosisVariant,
    | 'id'
    | 'diseaseId'
    | 'percentage'
    | 'primaryJournalCount'
    | 'crossBodyJournalCount'
    | 'confirmCriteria'
    | 'excludeCriteria'
    | 'conditionArea'
  >,
  t: TFunction
): string {
  const exclusions = variant.excludeCriteria.filter(
    (c) => c.status === 'exclusion_present'
  ).length

  const profile = getDiagnosisMatchProfile({
    percentage: variant.percentage,
    diseaseId: resolveVariantDiseaseId(variant),
    confirmCriteria: variant.confirmCriteria,
    exclusions,
  })

  const confirmMet = profile.confirmMet
  const confirmTotal = profile.confirmTotal

  const scopeParts: string[] = []
  if (variant.primaryJournalCount > 0) {
    scopeParts.push(
      String(
        t('diagnosis.rationale.primaryScope', {
          count: variant.primaryJournalCount,
          entries: t(
            variant.primaryJournalCount === 1
              ? 'hypothesisCard.entry'
              : 'hypothesisCard.entries'
          ),
          area: variant.conditionArea,
        })
      )
    )
  }
  if (variant.crossBodyJournalCount > 0) {
    scopeParts.push(
      String(
        t('diagnosis.rationale.crossScope', {
          count: variant.crossBodyJournalCount,
          entries: t(
            variant.crossBodyJournalCount === 1
              ? 'hypothesisCard.entry'
              : 'hypothesisCard.entries'
          ),
        })
      )
    )
  }

  const scope =
    scopeParts.length > 0
      ? scopeParts.join(` ${String(t('diagnosis.rationale.scopeAnd'))} `)
      : String(t('diagnosis.rationale.fullHistory'))

  const sentences: string[] = [
    String(t('diagnosis.rationale.intro', { scope })),
  ]

  if (profile.symptomsMatch !== 'skip') {
    sentences.push(
      String(
        t(`diagnosis.rationale.symptoms_${profile.symptomsMatch}`, {
          met: confirmMet,
          total: confirmTotal,
          typicalMet: profile.typicalMatched,
          typicalTotal: profile.typicalTotal,
        })
      )
    )
  }

  if (exclusions > 0) {
    sentences.push(
      String(
        t('diagnosis.rationale.exclusions', {
          count: exclusions,
        })
      )
    )
  }

  sentences.push(String(t('diagnosis.rationale.disclaimer')))

  return sentences.join(' ')
}

async function localizeCriterion(
  item: DiagnosisCriterion,
  locale: AppLocale
): Promise<DiagnosisCriterion> {
  if (locale === 'en') return item
  const [text, detail] = await Promise.all([
    translateUiText(item.text, locale),
    item.detail ? translateUiText(item.detail, locale) : Promise.resolve(undefined),
  ])
  return { ...item, text, detail }
}

export async function localizeDiagnosisVariant(
  variant: DiagnosisVariant,
  t: TFunction,
  locale: AppLocale
): Promise<DiagnosisVariant> {
  const rationale = localizeDiagnosisRationale(variant, t)
  const [diseaseName, ...workup] = await Promise.all([
    translateUiText(variant.diseaseName, locale),
    ...variant.suggestedWorkup.map((s) => translateUiText(s, locale)),
  ])
  const [confirmCriteria, excludeCriteria, matchFlags] = await Promise.all([
    Promise.all(variant.confirmCriteria.map((c) => localizeCriterion(c, locale))),
    Promise.all(variant.excludeCriteria.map((c) => localizeCriterion(c, locale))),
    Promise.all(
      variant.matchFlags.map(async (f) => ({
        ...f,
        label: await translateUiText(f.label, locale),
        detail: await translateUiText(f.detail, locale),
      }))
    ),
  ])

  return {
    ...variant,
    diseaseName,
    label: diseaseName,
    rationale,
    suggestedWorkup: workup,
    confirmCriteria,
    excludeCriteria,
    matchFlags,
  }
}

function localizeDiagnosisVariantSync(
  variant: DiagnosisVariant,
  t: TFunction
): DiagnosisVariant {
  return {
    ...variant,
    rationale: localizeDiagnosisRationale(variant, t),
  }
}

/** Immediate display: i18n strings only (no network). */
export function localizeDiagnosisReportSync(
  report: DiagnosisReport,
  t: TFunction
): DiagnosisReport {
  return {
    ...report,
    certaintyLabel: localizeDiagnosisCertaintyLabel(report.certainty, t),
    variants: report.variants.map((v) => localizeDiagnosisVariantSync(v, t)),
  }
}

export async function localizeDiagnosisReport(
  report: DiagnosisReport,
  t: TFunction,
  locale: AppLocale
): Promise<DiagnosisReport> {
  const variants = await Promise.all(
    report.variants.map((v) => localizeDiagnosisVariant(v, t, locale))
  )
  return {
    ...report,
    certaintyLabel: localizeDiagnosisCertaintyLabel(report.certainty, t),
    variants,
  }
}
