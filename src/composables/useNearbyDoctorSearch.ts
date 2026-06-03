import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getNearbyDoctorsStatus,
  reverseGeocodeNearbyLocation,
  searchNearbyDoctors,
} from '@/api/nearbyDoctorsApi'
import {
  NEARBY_DOCTOR_RADIUS_KM_OPTIONS,
  type NearbyDoctorRadiusKm,
  type NearbyDoctorResult,
} from '@/models/nearbyDoctor'
import {
  DOCTOR_SPECIALTY_IDS,
  type DoctorSpecialtyId,
} from '@/services/doctorSpecialty'

const GEOLOCATION_GRANTED_KEY = 'monday-geolocation-granted'

export function useNearbyDoctorSearch() {
  const { t } = useI18n()

  const specialtyId = ref<DoctorSpecialtyId>('primary_care')
  const radiusKm = ref<NearbyDoctorRadiusKm>(10)
  const results = ref<NearbyDoctorResult[]>([])
  const loading = ref(false)
  const error = ref('')
  const infoMessage = ref('')
  const googleConfigured = ref(false)
  const lastSource = ref<'google' | 'osm' | 'mixed' | null>(null)
  const hasSearched = ref(false)
  const selectedDoctorId = ref<string | null>(null)

  const locationLabel = ref('')
  const coords = ref<{ lat: number; lng: number } | null>(null)
  const locating = ref(false)
  const locationError = ref('')

  const radiusOptions = NEARBY_DOCTOR_RADIUS_KM_OPTIONS
  const specialtyOptions = DOCTOR_SPECIALTY_IDS

  const hasLocation = computed(() => coords.value != null)

  const showLocateButton = computed(
    () => !coords.value && !locating.value
  )

  const canSearch = computed(
    () => coords.value != null && !loading.value && !locating.value
  )

  function specialtyLabel(id: DoctorSpecialtyId): string {
    return t(`doctorSpecialty.${id}`)
  }

  function searchQueryForSpecialty(id: DoctorSpecialtyId): string {
    const key = `nearbyDoctors.searchQuery.${id}`
    const translated = t(key)
    return translated !== key ? translated : t('nearbyDoctors.searchQuery.default')
  }

  function selectDoctor(id: string) {
    selectedDoctorId.value = id
  }

  async function loadStatus() {
    try {
      const status = await getNearbyDoctorsStatus()
      googleConfigured.value = status.googleConfigured
    } catch {
      googleConfigured.value = false
    }
  }

  async function requestLocation(): Promise<boolean> {
    locationError.value = ''
    if (!navigator.geolocation) {
      locationError.value = t('nearbyDoctors.errors.geolocationUnsupported')
      return false
    }

    locating.value = true
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20_000,
          maximumAge: 300_000,
        })
      })
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      coords.value = { lat, lng }
      localStorage.setItem(GEOLOCATION_GRANTED_KEY, '1')
      locationLabel.value = t('nearbyDoctors.resolvingAddress')

      try {
        const label = await reverseGeocodeNearbyLocation(lat, lng)
        locationLabel.value = label || t('nearbyDoctors.locationUnknown')
      } catch {
        locationLabel.value = t('nearbyDoctors.locationUnknown')
      }
      return true
    } catch {
      locationError.value = t('nearbyDoctors.errors.geolocationDenied')
      coords.value = null
      locationLabel.value = ''
      return false
    } finally {
      locating.value = false
    }
  }

  async function initLocationFromPermission() {
    if (!navigator.geolocation) return

    const remembered = localStorage.getItem(GEOLOCATION_GRANTED_KEY) === '1'
    let shouldRequest = remembered

    if (navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' })
        shouldRequest = shouldRequest || status.state === 'granted'
        status.onchange = () => {
          if (status.state === 'granted') {
            void requestLocation()
          }
        }
      } catch {
        /* Permissions API not fully supported (e.g. Safari) */
      }
    }

    if (shouldRequest) {
      await requestLocation()
    }
  }

  async function runSearch() {
    if (!coords.value) {
      error.value = t('nearbyDoctors.errors.needLocation')
      return
    }

    loading.value = true
    error.value = ''
    infoMessage.value = ''
    results.value = []
    selectedDoctorId.value = null
    hasSearched.value = true

    try {
      const response = await searchNearbyDoctors({
        lat: coords.value.lat,
        lng: coords.value.lng,
        radiusKm: radiusKm.value,
        specialtyId: specialtyId.value,
        searchQuery: searchQueryForSpecialty(specialtyId.value),
      })
      results.value = response.results
      lastSource.value = response.source

      const firstWithCoords = response.results.find(
        (r) => r.lat != null && r.lng != null
      )
      if (firstWithCoords) {
        selectedDoctorId.value = firstWithCoords.id
      }

      if (response.results.length === 0) {
        infoMessage.value =
          response.message?.trim() || t('nearbyDoctors.noResults')
      } else if (response.message?.trim()) {
        infoMessage.value = response.message.trim()
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : t('nearbyDoctors.errors.searchFailed')
    } finally {
      loading.value = false
    }
  }

  return {
    specialtyId,
    radiusKm,
    radiusOptions,
    specialtyOptions,
    results,
    loading,
    error,
    infoMessage,
    googleConfigured,
    lastSource,
    hasSearched,
    selectedDoctorId,
    coords,
    locationLabel,
    locating,
    locationError,
    hasLocation,
    showLocateButton,
    canSearch,
    specialtyLabel,
    selectDoctor,
    loadStatus,
    initLocationFromPermission,
    requestLocation,
    runSearch,
  }
}
