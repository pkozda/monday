<template>
  <div class="nearby-map" :aria-label="t('nearbyDoctors.mapLabel')">
    <div ref="mapEl" class="nearby-map__canvas" />
    <div v-if="loading" class="nearby-map__overlay" aria-hidden="true">
      <span class="nearby-map__spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { NearbyDoctorResult } from '@/models/nearbyDoctor'

const props = defineProps<{
  center: { lat: number; lng: number }
  radiusKm: number
  results: NearbyDoctorResult[]
  selectedId: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t } = useI18n()

const mapEl = ref<HTMLElement | null>(null)
const map = shallowRef<L.Map | null>(null)
const markersLayer = shallowRef<L.LayerGroup | null>(null)
const userMarker = shallowRef<L.CircleMarker | null>(null)
const radiusCircle = shallowRef<L.Circle | null>(null)
const markerById = new Map<string, L.Marker>()

function zoomForRadius(km: number): number {
  if (km <= 2) return 14
  if (km <= 5) return 13
  if (km <= 10) return 12
  if (km <= 25) return 11
  if (km <= 50) return 10
  return 9
}

function numberedIcon(index: number, active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'nearby-map-pin',
    html: `<span class="nearby-map-pin__badge${active ? ' nearby-map-pin__badge--active' : ''}"><span class="nearby-map-pin__number">${index}</span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function initMap() {
  if (!mapEl.value || map.value) return

  map.value = L.map(mapEl.value, {
    zoomControl: true,
    attributionControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map.value)

  markersLayer.value = L.layerGroup().addTo(map.value)
}

function syncUserAndRadius() {
  if (!map.value) return

  userMarker.value?.remove()
  radiusCircle.value?.remove()

  const center: L.LatLngExpression = [props.center.lat, props.center.lng]

  userMarker.value = L.circleMarker(center, {
    radius: 8,
    color: '#fff',
    weight: 2,
    fillColor: '#2563eb',
    fillOpacity: 1,
  }).addTo(map.value)

  radiusCircle.value = L.circle(center, {
    radius: props.radiusKm * 1000,
    color: '#0d9488',
    weight: 1.5,
    fillColor: '#0d9488',
    fillOpacity: 0.07,
    dashArray: '4 6',
  }).addTo(map.value)
}

function syncMarkers() {
  if (!markersLayer.value) return

  markersLayer.value.clearLayers()
  markerById.clear()

  const mappable = props.results.filter((r) => r.lat != null && r.lng != null)

  mappable.forEach((doctor, index) => {
    const lat = doctor.lat!
    const lng = doctor.lng!
    const active = doctor.id === props.selectedId
    const marker = L.marker([lat, lng], {
      icon: numberedIcon(index + 1, active),
      zIndexOffset: active ? 1000 : index,
    })
    marker.on('click', () => emit('select', doctor.id))
    marker.addTo(markersLayer.value!)
    markerById.set(doctor.id, marker)
  })
}

function fitView() {
  if (!map.value) return

  const points: L.LatLngTuple[] = [[props.center.lat, props.center.lng]]
  for (const doctor of props.results) {
    if (doctor.lat != null && doctor.lng != null) {
      points.push([doctor.lat, doctor.lng])
    }
  }

  if (points.length <= 1) {
    map.value.setView(points[0], zoomForRadius(props.radiusKm))
    return
  }

  map.value.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 })
}

function panToSelected() {
  if (!map.value || !props.selectedId) return
  const doctor = props.results.find((r) => r.id === props.selectedId)
  if (doctor?.lat == null || doctor?.lng == null) return
  map.value.panTo([doctor.lat, doctor.lng], { animate: true })
}

function refreshMap() {
  if (!map.value) return
  syncUserAndRadius()
  syncMarkers()
  fitView()
  void nextTick(() => map.value?.invalidateSize())
}

watch(
  () => [props.center.lat, props.center.lng, props.radiusKm] as const,
  () => {
    syncUserAndRadius()
    fitView()
  }
)

watch(
  () => props.results,
  () => {
    syncMarkers()
    fitView()
  },
  { deep: true }
)

watch(
  () => props.selectedId,
  () => {
    syncMarkers()
    panToSelected()
  }
)

watch(
  mapEl,
  async (el) => {
    if (!el) return
    await nextTick()
    initMap()
    refreshMap()
  },
  { immediate: true }
)

onUnmounted(() => {
  markerById.clear()
  map.value?.remove()
  map.value = null
})
</script>

<style scoped>
.nearby-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 360px;
}

.nearby-map__canvas {
  width: 100%;
  height: 100%;
  min-height: 360px;
  z-index: 0;
}

.nearby-map__overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--bg-page) 35%, transparent);
  pointer-events: none;
}

.nearby-map__spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border);
  border-top-color: var(--accent-strong);
  border-radius: 50%;
  animation: nearby-map-spin 0.7s linear infinite;
}

@keyframes nearby-map-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
.nearby-map-pin {
  background: transparent;
  border: none;
}

.nearby-map-pin__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: #1e293b;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
  border: 2px solid #fff;
  font-family: inherit;
}

.nearby-map-pin__badge--active {
  background: var(--accent-strong, #0d9488);
  transform: rotate(-45deg) scale(1.12);
}

.nearby-map-pin__number {
  display: block;
  transform: rotate(45deg);
}

.nearby-map .leaflet-container {
  font-family: inherit;
  background: color-mix(in srgb, var(--bg-muted) 60%, #dde4ea);
}
</style>
