/** Parse optional positive number from profile form input (string or number from <input type="number">). */
export function parseOptionalPositiveNumber(
  value: string | number | null | undefined
): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const trimmed = String(value).trim().replace(',', '.')
  if (!trimmed) return undefined
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return n
}

export function formatProfileWeightKg(kg: number): string {
  const rounded = Math.round(kg * 10) / 10
  return Number.isInteger(rounded) ? `${rounded} kg` : `${rounded.toFixed(1)} kg`
}

export function formatProfileHeightCm(cm: number): string {
  const rounded = Math.round(cm)
  return `${rounded} cm`
}

export function formatProfileBmi(weightKg: number, heightCm: number): number | null {
  if (heightCm <= 0 || weightKg <= 0) return null
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  if (!Number.isFinite(bmi)) return null
  return Math.round(bmi * 10) / 10
}

export type BmiCategoryId = 'underweight' | 'normal' | 'overweight' | 'obese'

export interface BmiCategory {
  id: BmiCategoryId
  min: number
  max: number
}

/** WHO adult BMI bands (commonly used screening ranges). */
export const BMI_CATEGORIES: readonly BmiCategory[] = [
  { id: 'underweight', min: 0, max: 18.5 },
  { id: 'normal', min: 18.5, max: 25 },
  { id: 'overweight', min: 25, max: 30 },
  { id: 'obese', min: 30, max: 100 },
] as const

/** Visual scale range shown on the profile BMI bar. */
export const BMI_SCALE_MIN = 15
export const BMI_SCALE_MAX = 40

export function getBmiCategory(bmi: number): BmiCategory {
  for (const category of BMI_CATEGORIES) {
    if (bmi < category.max) return category
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
}

/** 0–100 position on the profile BMI scale bar. */
export function bmiScalePositionPercent(bmi: number): number {
  const clamped = Math.min(BMI_SCALE_MAX, Math.max(BMI_SCALE_MIN, bmi))
  const span = BMI_SCALE_MAX - BMI_SCALE_MIN
  return ((clamped - BMI_SCALE_MIN) / span) * 100
}
