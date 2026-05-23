import type { Composer } from 'vue-i18n'
import type { HealthRecommendation } from '@/models/types'

const KNOWN_IDS = new Set([
  'profile-dob',
  'wellness-visit',
  'annual-blood-panel',
  'bp-monitoring',
  'vision-exam',
  'colorectal-screening',
  'cardiovascular-risk',
  'senior-wellness',
  'cervical-screening',
  'mammography',
  'bone-density',
  'prostate-screening',
  'dental-annual',
  'flu-vaccine',
  'physical-activity',
  'journal-attention',
  'start-journaling',
  'journal-recent',
  'condition-followup',
])

export function localizeRecommendation(
  rec: HealthRecommendation,
  t: Composer['t']
): { title: string; detail: string } {
  if (!KNOWN_IDS.has(rec.id)) {
    return { title: rec.title, detail: rec.detail }
  }

  const base = `recommendations.items.${rec.id}`

  if (rec.id === 'journal-attention') {
    const match = rec.detail.match(/You have (\d+) journal/)
    const count = match ? Number(match[1]) : 1
    return {
      title: t(`${base}.title`),
      detail: t(`${base}.detail`, {
        count,
        entries: t(count === 1 ? 'dashboard.entryOne' : 'dashboard.entryMany'),
      }),
    }
  }

  if (rec.id === 'condition-followup') {
    const match = rec.detail.match(/tracking (\d+) condition/)
    const count = match ? Number(match[1]) : 1
    return {
      title: t(`${base}.title`),
      detail: t(`${base}.detail`, { count }),
    }
  }

  return {
    title: t(`${base}.title`),
    detail: t(`${base}.detail`),
  }
}
