import type {
  NearbyDoctorSearchRequest,
  NearbyDoctorSearchResponse,
} from '@/models/nearbyDoctor'

export async function reverseGeocodeNearbyLocation(
  lat: number,
  lng: number
): Promise<string> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  })
  const response = await fetch(`/api/doctors/reverse?${params}`)
  const data = (await response.json()) as { label?: string; error?: string }
  if (!response.ok) {
    throw new Error(data.error ?? `Reverse geocode failed (${response.status})`)
  }
  return data.label?.trim() ?? ''
}

export async function getNearbyDoctorsStatus(): Promise<{ googleConfigured: boolean }> {
  const response = await fetch('/api/doctors/status')
  if (!response.ok) {
    return { googleConfigured: false }
  }
  return (await response.json()) as { googleConfigured: boolean }
}

export async function searchNearbyDoctors(
  request: NearbyDoctorSearchRequest
): Promise<NearbyDoctorSearchResponse> {
  const response = await fetch('/api/doctors/nearby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  const data = (await response.json()) as NearbyDoctorSearchResponse & { error?: string }

  if (!response.ok) {
    throw new Error(data.error ?? `Search failed (${response.status})`)
  }

  return data
}
