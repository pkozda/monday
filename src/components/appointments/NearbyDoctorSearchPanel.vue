<template>
  <section
    class="nearby-doctors page-panel"
    :aria-label="t('nearbyDoctors.title')"
  >
    <header class="nearby-doctors__header">
      <div>
        <h2 class="nearby-doctors__title">{{ t('nearbyDoctors.title') }}</h2>
        <p class="nearby-doctors__subtitle">{{ t('nearbyDoctors.subtitle') }}</p>
      </div>
      <p v-if="googleConfigured" class="nearby-doctors__provider nearby-doctors__provider--google">
        {{ t('nearbyDoctors.providerGoogle') }}
      </p>
      <p v-else class="nearby-doctors__provider">
        {{ t('nearbyDoctors.providerOsm') }}
      </p>
    </header>

    <div class="nearby-doctors__controls">
      <div class="nearby-doctors__field">
        <label class="nearby-doctors__label" for="nearby-radius">
          {{ t('nearbyDoctors.radiusLabel') }}
        </label>
        <select id="nearby-radius" v-model.number="radiusKm" class="nearby-doctors__select">
          <option v-for="km in radiusOptions" :key="km" :value="km">
            {{ t('nearbyDoctors.radiusKm', { km }) }}
          </option>
        </select>
      </div>

      <div class="nearby-doctors__field nearby-doctors__field--grow">
        <label class="nearby-doctors__label" for="nearby-specialty">
          {{ t('nearbyDoctors.specialtyLabel') }}
        </label>
        <select id="nearby-specialty" v-model="specialtyId" class="nearby-doctors__select">
          <option v-for="id in specialtyOptions" :key="id" :value="id">
            {{ specialtyLabel(id) }}
          </option>
        </select>
      </div>

      <div class="nearby-doctors__field nearby-doctors__field--location">
        <span class="nearby-doctors__label">{{ t('nearbyDoctors.locationLabel') }}</span>
        <p v-if="hasLocation && locationLabel" class="nearby-doctors__location-text">
          {{ locationLabel }}
        </p>
        <p v-else-if="locating" class="nearby-doctors__location-text nearby-doctors__location-text--muted">
          {{ t('nearbyDoctors.locating') }}
        </p>
        <button
          v-else-if="showLocateButton"
          type="button"
          class="nearby-doctors__locate"
          @click="requestLocation"
        >
          {{ t('nearbyDoctors.useMyLocation') }}
        </button>
        <p v-if="locationError" class="nearby-doctors__hint nearby-doctors__hint--error">
          {{ locationError }}
        </p>
      </div>

      <button
        type="button"
        class="nearby-doctors__search"
        :disabled="!canSearch"
        @click="runSearch"
      >
        {{ loading ? t('nearbyDoctors.searching') : t('nearbyDoctors.search') }}
      </button>
    </div>

    <p v-if="infoMessage && !loading" class="nearby-doctors__info" role="status">
      {{ infoMessage }}
    </p>
    <p v-if="error" class="nearby-doctors__error" role="alert">
      {{ error }}
    </p>

    <div v-if="showExplore" class="nearby-doctors__explore">
      <div class="nearby-doctors__map-pane">
        <NearbyDoctorsMap
          v-if="coords"
          :center="coords"
          :radius-km="radiusKm"
          :results="results"
          :selected-id="selectedDoctorId"
          :loading="loading"
          @select="selectDoctor"
        />
      </div>

      <div class="nearby-doctors__list-pane">
        <div v-if="loading" class="nearby-doctors__list-loading">
          {{ t('nearbyDoctors.searching') }}
        </div>
        <NearbyDoctorResultsList
          v-else-if="results.length"
          :results="results"
          :selected-id="selectedDoctorId"
          @select="selectDoctor"
        />
        <p v-else class="nearby-doctors__list-empty">
          {{ t('nearbyDoctors.noResults') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import NearbyDoctorsMap from '@/components/appointments/NearbyDoctorsMap.vue'
import NearbyDoctorResultsList from '@/components/appointments/NearbyDoctorResultsList.vue'
import { useNearbyDoctorSearch } from '@/composables/useNearbyDoctorSearch'

const { t } = useI18n()

const {
  specialtyId,
  radiusKm,
  radiusOptions,
  specialtyOptions,
  results,
  loading,
  error,
  infoMessage,
  googleConfigured,
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
} = useNearbyDoctorSearch()

const showExplore = computed(
  () => hasSearched.value && coords.value != null
)

onMounted(() => {
  void (async () => {
    await loadStatus()
    await initLocationFromPermission()
  })()
})
</script>

<style scoped>
.nearby-doctors {
  margin-bottom: 1rem;
  padding: 1rem 1.15rem;
}

.nearby-doctors__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.nearby-doctors__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
}

.nearby-doctors__subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--text-muted);
  max-width: 42rem;
}

.nearby-doctors__provider {
  margin: 0;
  font-size: 0.72rem;
  color: var(--text-faint);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--bg-muted) 80%, transparent);
}

.nearby-doctors__provider--google {
  color: var(--accent-strong);
}

.nearby-doctors__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem 1rem;
}

.nearby-doctors__field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 8rem;
}

.nearby-doctors__field--grow {
  flex: 1 1 12rem;
  min-width: 10rem;
}

.nearby-doctors__field--location {
  flex: 1 1 10rem;
  min-width: 8rem;
  max-width: 16rem;
}

.nearby-doctors__location-text {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--text-primary);
  font-weight: 500;
}

.nearby-doctors__location-text--muted {
  color: var(--text-muted);
  font-weight: 400;
}

.nearby-doctors__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.nearby-doctors__select {
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: inherit;
}

.nearby-doctors__locate {
  display: block;
  width: 100%;
  max-width: 11.5rem;
  padding: 0.32rem 0.5rem;
  border: 1px solid var(--border-strong);
  border-radius: 5px;
  background: var(--bg-muted);
  color: var(--text-primary);
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.nearby-doctors__locate-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nearby-doctors__locate:hover:not(:disabled) {
  border-color: var(--accent-strong);
}

.nearby-doctors__locate:disabled {
  opacity: 0.65;
  cursor: wait;
}

.nearby-doctors__search {
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: 6px;
  background: var(--accent-strong);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.nearby-doctors__search:hover:not(:disabled) {
  background: var(--accent-hover);
}

.nearby-doctors__search:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.nearby-doctors__hint {
  margin: 0;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.nearby-doctors__hint--error {
  color: var(--error-text, #c62828);
}

.nearby-doctors__info {
  margin: 0.85rem 0 0;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.nearby-doctors__error {
  margin: 0.85rem 0 0;
  font-size: 0.82rem;
  color: var(--error-text, #c62828);
}

.nearby-doctors__explore {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  margin-top: 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  min-height: 400px;
  max-height: min(520px, 70vh);
  background: var(--bg-surface);
}

.nearby-doctors__map-pane {
  position: relative;
  min-height: 360px;
  min-width: 0;
}

.nearby-doctors__list-pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: 1px solid var(--border);
  background: var(--bg-surface);
}

.nearby-doctors__list-loading,
.nearby-doctors__list-empty {
  margin: 0;
  padding: 1.25rem 0.85rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .nearby-doctors__explore {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(280px, 40vh) auto;
    max-height: none;
  }

  .nearby-doctors__list-pane {
    border-left: none;
    border-top: 1px solid var(--border);
    max-height: 22rem;
  }

  .nearby-doctors__map-pane {
    min-height: 280px;
  }
}

@media (max-width: 640px) {
  .nearby-doctors__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .nearby-doctors__search {
    width: 100%;
  }
}
</style>
