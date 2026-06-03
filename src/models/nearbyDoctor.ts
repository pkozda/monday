import type { DoctorSpecialtyId } from '@/services/doctorSpecialty'

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

export interface NearbyDoctorSearchRequest {
  lat: number
  lng: number
  radiusKm: number
  specialtyId: DoctorSpecialtyId
  /** Localized text for Google Places searchText (from i18n). */
  searchQuery: string
}

export interface NearbyDoctorSearchResponse {
  results: NearbyDoctorResult[]
  source: NearbyDoctorSource | 'mixed'
  googleAttempted: boolean
  message?: string
}

export const NEARBY_DOCTOR_RADIUS_KM_OPTIONS = [
  1, 2, 5, 10, 25, 50, 75, 100, 150,
] as const

export type NearbyDoctorRadiusKm = (typeof NEARBY_DOCTOR_RADIUS_KM_OPTIONS)[number]
