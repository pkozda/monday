/** Shared between Vite proxy and optional tests — keep free of Vue imports. */

export type DoctorSpecialtyId =
  | 'primary_care'
  | 'orthopedics'
  | 'dermatology'
  | 'cardiology'
  | 'gastroenterology'
  | 'neurology'
  | 'endocrinology'
  | 'pulmonology'
  | 'urology'
  | 'gynecology'
  | 'ophthalmology'
  | 'ent'
  | 'psychiatry'
  | 'rheumatology'

export type NearbyDoctorSource = 'google' | 'osm'

export interface NearbyDoctorResult {
  id: string
  name: string
  practiceName: string | null
  rating: number | null
  ratingCount: number | null
  phone: string | null
  email: string | null
  address: string | null
  lat: number | null
  lng: number | null
  distanceKm: number | null
  source: NearbyDoctorSource
  mapsUrl: string | null
}

export const DEFAULT_SPECIALTY_SEARCH_QUERY: Record<DoctorSpecialtyId, string> = {
  primary_care: 'family doctor general practitioner',
  orthopedics: 'orthopedic surgeon doctor',
  dermatology: 'dermatologist skin doctor',
  cardiology: 'cardiologist heart doctor',
  gastroenterology: 'gastroenterologist digestive doctor',
  neurology: 'neurologist doctor',
  endocrinology: 'endocrinologist hormone doctor',
  pulmonology: 'pulmonologist lung doctor',
  urology: 'urologist doctor',
  gynecology: 'gynecologist women health doctor',
  ophthalmology: 'ophthalmologist eye doctor',
  ent: 'ENT otolaryngologist doctor',
  psychiatry: 'psychiatrist mental health doctor',
  rheumatology: 'rheumatologist arthritis doctor',
}

/** OSM `healthcare:speciality` tag fragments for post-filtering. */
export const OSM_SPECIALTY_FRAGMENTS: Record<DoctorSpecialtyId, string[]> = {
  primary_care: ['general', 'family', 'gp', 'primary'],
  orthopedics: ['orthop', 'trauma', 'bone'],
  dermatology: ['dermat', 'skin'],
  cardiology: ['cardio', 'heart'],
  gastroenterology: ['gastro', 'digest'],
  neurology: ['neuro'],
  endocrinology: ['endocrin', 'diabet', 'thyroid'],
  pulmonology: ['pulmon', 'respir', 'lung'],
  urology: ['urolog'],
  gynecology: ['gynec', 'obstet', 'women'],
  ophthalmology: ['ophthalm', 'eye'],
  ent: ['ent', 'otorhin', 'ear_nose'],
  psychiatry: ['psych'],
  rheumatology: ['rheumat', 'arthritis'],
}

export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const r = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(r * c * 10) / 10
}

export function resolveSearchQuery(
  specialtyId: DoctorSpecialtyId,
  searchQuery?: string
): string {
  const trimmed = searchQuery?.trim()
  if (trimmed) return trimmed
  return DEFAULT_SPECIALTY_SEARCH_QUERY[specialtyId] ?? 'doctor'
}
