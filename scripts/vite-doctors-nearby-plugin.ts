import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import {
  DEFAULT_SPECIALTY_SEARCH_QUERY,
  distanceKm,
  OSM_SPECIALTY_FRAGMENTS,
  resolveSearchQuery,
  type DoctorSpecialtyId,
  type NearbyDoctorResult,
} from './doctors-nearby-shared'

const ROUTE_NEARBY = '/api/doctors/nearby'
const ROUTE_STATUS = '/api/doctors/status'
const ROUTE_REVERSE = '/api/doctors/reverse'
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'

/** Mirrors tried in order — requires a custom User-Agent (406 otherwise). */
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
] as const

const OVERPASS_USER_AGENT =
  'MondaySHI/1.0 (nearby-doctor-search; local dev; https://github.com/)'

const GOOGLE_SEARCH_TEXT = 'https://places.googleapis.com/v1/places:searchText'

const GOOGLE_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.location',
  'places.googleMapsUri',
  'places.primaryType',
  'places.types',
].join(',')

function readBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(
  res: import('http').ServerResponse,
  status: number,
  payload: unknown
): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function isSpecialtyId(value: string): value is DoctorSpecialtyId {
  return value in DEFAULT_SPECIALTY_SEARCH_QUERY
}

interface SearchBody {
  lat?: number
  lng?: number
  radiusKm?: number
  specialtyId?: string
  searchQuery?: string
}

function parseSearchBody(raw: string): SearchBody | null {
  try {
    return JSON.parse(raw) as SearchBody
  } catch {
    return null
  }
}

function validateRequest(body: SearchBody): {
  lat: number
  lng: number
  radiusKm: number
  specialtyId: DoctorSpecialtyId
  searchQuery: string
} | { error: string } {
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  const radiusKm = Number(body.radiusKm)
  const specialtyId = String(body.specialtyId ?? '')

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: 'Invalid coordinates.' }
  }
  if (!Number.isFinite(radiusKm) || radiusKm < 1 || radiusKm > 150) {
    return { error: 'Radius must be between 1 and 150 km.' }
  }
  if (!isSpecialtyId(specialtyId)) {
    return { error: 'Invalid specialty.' }
  }

  return {
    lat,
    lng,
    radiusKm,
    specialtyId,
    searchQuery: resolveSearchQuery(specialtyId, body.searchQuery),
  }
}

async function searchGooglePlaces(
  apiKey: string,
  lat: number,
  lng: number,
  radiusKm: number,
  searchQuery: string
): Promise<NearbyDoctorResult[]> {
  const radiusMeters = Math.min(radiusKm * 1000, 50_000)

  const response = await fetch(GOOGLE_SEARCH_TEXT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': GOOGLE_FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: searchQuery,
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters,
        },
      },
      rankPreference: 'DISTANCE',
      languageCode: 'en',
    }),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Google Places error (${response.status}): ${text.slice(0, 200)}`)
  }

  const data = JSON.parse(text) as {
    places?: Array<{
      id?: string
      displayName?: { text?: string }
      formattedAddress?: string
      rating?: number
      userRatingCount?: number
      nationalPhoneNumber?: string
      internationalPhoneNumber?: string
      websiteUri?: string
      googleMapsUri?: string
      location?: { latitude?: number; longitude?: number }
      primaryType?: string
      types?: string[]
    }>
  }

  const places = data.places ?? []

  return places
    .map((place) => {
      const name = place.displayName?.text?.trim() || 'Unknown'
      const plat = place.location?.latitude
      const plng = place.location?.longitude
      const dist =
        plat != null && plng != null ? distanceKm(lat, lng, plat, plng) : null

      return {
        id: `google:${place.id ?? name}`,
        name,
        practiceName: null,
        rating: typeof place.rating === 'number' ? place.rating : null,
        ratingCount:
          typeof place.userRatingCount === 'number' ? place.userRatingCount : null,
        phone:
          place.nationalPhoneNumber?.trim() ||
          place.internationalPhoneNumber?.trim() ||
          null,
        email: null,
        address: place.formattedAddress?.trim() || null,
        lat: plat ?? null,
        lng: plng ?? null,
        distanceKm: dist,
        source: 'google' as const,
        mapsUrl: place.googleMapsUri?.trim() || null,
      }
    })
    .filter((r) => r.lat != null && r.lng != null)
    .filter((r) => r.distanceKm == null || r.distanceKm <= radiusKm)
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
}

function parseOsmCoord(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function osmElementCoords(el: Record<string, unknown>): { lat: number; lng: number } | null {
  const lat = parseOsmCoord(el.lat)
  const lon = parseOsmCoord(el.lon)
  if (lat != null && lon != null) {
    return { lat, lng: lon }
  }
  const center = el.center as { lat?: unknown; lon?: unknown } | undefined
  if (center) {
    const cLat = parseOsmCoord(center.lat)
    const cLon = parseOsmCoord(center.lon)
    if (cLat != null && cLon != null) {
      return { lat: cLat, lng: cLon }
    }
  }
  return null
}

function osmTags(el: Record<string, unknown>): Record<string, string> {
  const tags = el.tags as Record<string, string> | undefined
  return tags ?? {}
}

function matchesOsmSpecialty(
  tags: Record<string, string>,
  specialtyId: DoctorSpecialtyId
): boolean {
  const fragments = OSM_SPECIALTY_FRAGMENTS[specialtyId] ?? []
  const haystack = [
    tags['healthcare:speciality'],
    tags.healthcare,
    tags.name,
    tags.operator,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (!haystack) return true
  return fragments.some((f) => haystack.includes(f))
}

function buildOsmAddress(tags: Record<string, string>): string | null {
  if (tags['addr:full']?.trim()) return tags['addr:full'].trim()

  const streetName =
    tags['addr:street']?.trim() ||
    tags.street?.trim() ||
    tags['addr:road']?.trim() ||
    tags['addr:place']?.trim()
  const house = tags['addr:housenumber']?.trim() || tags['addr:housename']?.trim()
  const street = [house, streetName].filter(Boolean).join(' ').trim()

  const city =
    tags['addr:city']?.trim() ||
    tags['addr:town']?.trim() ||
    tags['addr:village']?.trim() ||
    tags['addr:suburb']?.trim() ||
    tags['addr:hamlet']?.trim() ||
    tags['is_in:city']?.trim() ||
    tags.is_in?.trim()

  const postcode = tags['addr:postcode']?.trim()
  const cityLine = [postcode, city].filter(Boolean).join(' ')
  const country = tags['addr:country']?.trim()

  const parts = [street, cityLine, country].filter(
    (part): part is string => typeof part === 'string' && part.length > 0
  )
  return parts.length ? parts.join(', ') : null
}

function formatAddressFromNominatim(address: Record<string, string> | undefined): string {
  if (!address) return ''

  const street = [
    address.house_number,
    address.road || address.street,
    address.pedestrian,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.suburb ||
    address.municipality ||
    address.county

  const country = address.country?.trim()

  return [street, city, country].filter((part) => part && String(part).trim()).join(', ')
}

async function reverseGeocodeLabel(lat: number, lng: number): Promise<string> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
    zoom: '18',
  })

  const response = await fetch(`${NOMINATIM_REVERSE}?${params}`, {
    headers: {
      'User-Agent': OVERPASS_USER_AGENT,
      Accept: 'application/json',
    },
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Reverse geocode failed (${response.status})`)
  }

  const data = JSON.parse(text) as {
    display_name?: string
    address?: Record<string, string>
  }

  return (
    formatAddressFromNominatim(data.address) ||
    data.display_name?.trim() ||
    ''
  )
}

async function fetchOverpassJson(query: string): Promise<{ elements?: Array<Record<string, unknown>> }> {
  const body = `data=${encodeURIComponent(query)}`
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': OVERPASS_USER_AGENT,
    Accept: 'application/json, */*',
    'Accept-Encoding': 'gzip, deflate',
  }

  let lastStatus = 0
  let lastDetail = ''

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, { method: 'POST', headers, body })
      const text = await response.text()
      lastStatus = response.status

      if (!response.ok) {
        lastDetail = text.slice(0, 120).replace(/\s+/g, ' ')
        console.warn(
          `[Monday doctors nearby] Overpass ${endpoint} → ${response.status}: ${lastDetail}`
        )
        if (response.status === 429 || response.status === 504) {
          await new Promise((r) => setTimeout(r, 800))
        }
        continue
      }

      const data = JSON.parse(text) as { elements?: Array<Record<string, unknown>> }
      if (data.elements) {
        return data
      }
      lastDetail = 'empty response'
    } catch (err) {
      lastDetail = err instanceof Error ? err.message : String(err)
      console.warn(`[Monday doctors nearby] Overpass ${endpoint} failed:`, lastDetail)
    }
  }

  throw new Error(
    lastStatus
      ? `OpenStreetMap unavailable (HTTP ${lastStatus}${lastDetail ? `: ${lastDetail}` : ''})`
      : 'OpenStreetMap unavailable (all mirrors failed)'
  )
}

async function searchOsmOverpass(
  lat: number,
  lng: number,
  radiusKm: number,
  specialtyId: DoctorSpecialtyId
): Promise<NearbyDoctorResult[]> {
  const radiusM = Math.round(radiusKm * 1000)
  const query = `[out:json][timeout:25];(node["amenity"="doctors"](around:${radiusM},${lat},${lng});node["healthcare"="doctor"](around:${radiusM},${lat},${lng});way["amenity"="doctors"](around:${radiusM},${lat},${lng});way["healthcare"="doctor"](around:${radiusM},${lat},${lng}););out center 40;`

  const data = await fetchOverpassJson(query)
  const elements = Array.isArray(data.elements) ? data.elements : []
  const seen = new Set<string>()
  const results: NearbyDoctorResult[] = []

  for (const el of elements) {
    const coords = osmElementCoords(el)
    if (!coords) continue
    const tags = osmTags(el)
    if (!matchesOsmSpecialty(tags, specialtyId)) continue

    const name =
      tags.name?.trim() ||
      tags['name:en']?.trim() ||
      tags.operator?.trim() ||
      tags.brand?.trim()
    if (!name) continue

    const key = `${name}|${coords.lat.toFixed(4)}|${coords.lng.toFixed(4)}`
    if (seen.has(key)) continue
    seen.add(key)

    const dist = distanceKm(lat, lng, coords.lat, coords.lng)
    if (dist > radiusKm) continue

    const phone =
      tags['contact:phone']?.trim() ||
      tags.phone?.trim() ||
      tags['contact:mobile']?.trim() ||
      null
    const email =
      tags['contact:email']?.trim() || tags.email?.trim() || null
    const osmId = String(el.id ?? key)
    const osmType = String(el.type ?? 'node')

    results.push({
      id: `osm:${osmType}/${osmId}`,
      name,
      practiceName: tags.operator?.trim() && tags.operator !== name ? tags.operator.trim() : null,
      rating: null,
      ratingCount: null,
      phone,
      email,
      address: buildOsmAddress(tags),
      lat: coords.lat,
      lng: coords.lng,
      distanceKm: dist,
      source: 'osm',
      mapsUrl: `https://www.openstreetmap.org/${osmType}/${osmId}`,
    })
  }

  return results.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999)).slice(0, 25)
}

async function runNearbySearch(
  apiKey: string | undefined,
  params: ReturnType<typeof validateRequest> & { error?: undefined }
): Promise<{
  results: NearbyDoctorResult[]
  source: 'google' | 'osm' | 'mixed'
  googleAttempted: boolean
  message?: string
}> {
  let googleAttempted = false
  let results: NearbyDoctorResult[] = []

  if (apiKey) {
    googleAttempted = true
    try {
      results = await searchGooglePlaces(
        apiKey,
        params.lat,
        params.lng,
        params.radiusKm,
        params.searchQuery
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn('[Monday doctors nearby] Google Places failed:', message)
    }
  }

  if (results.length === 0) {
    try {
      results = await searchOsmOverpass(
        params.lat,
        params.lng,
        params.radiusKm,
        params.specialtyId
      )
      return {
        results,
        source: 'osm',
        googleAttempted,
        message:
          results.length > 0 && googleAttempted
            ? 'Google returned no results; showing OpenStreetMap data.'
            : undefined,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        results: [],
        source: 'osm',
        googleAttempted,
        message,
      }
    }
  }

  return {
    results,
    source: 'google',
    googleAttempted,
    message: undefined,
  }
}

/**
 * Dev proxy: nearby doctor search via Google Places (optional) with OSM Overpass fallback.
 * GOOGLE_PLACES_API_KEY stays in .env.local — never bundled into the client.
 */
export function mondayDoctorsNearbyPlugin(): Plugin {
  return {
    name: 'monday-doctors-nearby',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      const googleKey = env.GOOGLE_PLACES_API_KEY?.trim()

      if (googleKey) {
        console.info('[Monday doctors nearby] Google Places API enabled (OSM fallback active)')
      } else {
        console.info(
          '[Monday doctors nearby] GOOGLE_PLACES_API_KEY not set — using OpenStreetMap only'
        )
      }

      server.middlewares.use(async (req, res, next) => {
        const [pathname, queryString = ''] = (req.url ?? '').split('?')

        if (pathname === ROUTE_STATUS && req.method === 'GET') {
          sendJson(res, 200, { googleConfigured: Boolean(googleKey) })
          return
        }

        if (pathname === ROUTE_REVERSE && req.method === 'GET') {
          try {
            const params = new URLSearchParams(queryString)
            const lat = Number(params.get('lat'))
            const lng = Number(params.get('lng'))
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              sendJson(res, 400, { error: 'Invalid coordinates.' })
              return
            }
            const label = await reverseGeocodeLabel(lat, lng)
            sendJson(res, 200, { label })
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            sendJson(res, 502, { error: message })
          }
          return
        }

        if (pathname !== ROUTE_NEARBY || req.method !== 'POST') {
          next()
          return
        }

        try {
          const raw = await readBody(req)
          const body = parseSearchBody(raw)
          if (!body) {
            sendJson(res, 400, { error: 'Invalid JSON body.' })
            return
          }

          const validated = validateRequest(body)
          if ('error' in validated) {
            sendJson(res, 400, { error: validated.error })
            return
          }

          const payload = await runNearbySearch(googleKey, validated)
          sendJson(res, 200, payload)
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          sendJson(res, 502, { error: message })
        }
      })
    },
  }
}
