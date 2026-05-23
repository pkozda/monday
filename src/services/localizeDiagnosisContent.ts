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

type TFunction = Composer['t']

const CERTAINTY_KEYS: Record<DiagnosisCertainty, string> = {
  high: 'diagnosis.certaintyReportHigh',
  moderate: 'diagnosis.certaintyReportModerate',
  low: 'diagnosis.certaintyReportLow',
}

export function localizeDiagnosisCertaintyLabel(
  certainty: DiagnosisCertainty,
  t: TFunction
): string {
  return String(t(CERTAINTY_KEYS[certainty]))
}

export function localizeDiagnosisRationale(
  variant: Pick<
    DiagnosisVariant,
    | 'precisionScore'
    | 'primaryJournalCount'
    | 'crossBodyJournalCount'
    | 'confirmCriteria'
    | 'excludeCriteria'
    | 'conditionArea'
  >,
  t: TFunction
): string {
  const confirmMet = variant.confirmCriteria.filter((c) => c.status === 'met')
    .length
  const confirmTotal = variant.confirmCriteria.length
  const exclusions = variant.excludeCriteria.filter(
    (c) => c.status === 'exclusion_present'
  ).length

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

  let criteriaNote = ''
  if (confirmTotal > 0) {
    criteriaNote = String(
      t('diagnosis.rationale.criteriaMet', { met: confirmMet, total: confirmTotal })
    )
  }
  if (exclusions > 0) {
    criteriaNote += String(
      t('diagnosis.rationale.exclusions', {
        count: exclusions,
        factors: t(
          exclusions === 1
            ? 'diagnosis.rationale.factor'
            : 'diagnosis.rationale.factors'
        ),
      })
    )
  }

  return String(
    t('diagnosis.rationale.body', {
      score: variant.precisionScore,
      scope,
      criteriaNote,
    })
  )
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
