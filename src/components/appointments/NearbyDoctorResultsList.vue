<template>
  <div class="nearby-results-list">
    <p class="nearby-results-list__count">
      {{ t('nearbyDoctors.resultsCount', { count: results.length }) }}
    </p>
    <ul class="nearby-results-list__items" role="listbox" :aria-label="t('nearbyDoctors.resultsListLabel')">
      <li
        v-for="(doctor, index) in results"
        :key="doctor.id"
        role="option"
        :aria-selected="doctor.id === selectedId"
      >
        <button
          type="button"
          class="nearby-results-list__item"
          :class="{ 'nearby-results-list__item--selected': doctor.id === selectedId }"
          @click="emit('select', doctor.id)"
        >
          <span class="nearby-results-list__index" aria-hidden="true">{{ index + 1 }}</span>
          <span class="nearby-results-list__body">
            <span class="nearby-results-list__name">{{ doctor.name }}</span>
            <span v-if="doctor.practiceName" class="nearby-results-list__practice">
              {{ doctor.practiceName }}
            </span>
            <span class="nearby-results-list__meta">
              <template v-if="doctor.rating != null">
                <span class="nearby-results-list__rating">{{ doctor.rating.toFixed(1) }} ★</span>
                <span v-if="doctor.ratingCount != null" class="nearby-results-list__reviews">
                  ({{ doctor.ratingCount }})
                </span>
              </template>
              <span v-else class="nearby-results-list__rating-na">
                {{ t('nearbyDoctors.noRating') }}
              </span>
              <span v-if="doctor.distanceKm != null" class="nearby-results-list__dot">·</span>
              <span v-if="doctor.distanceKm != null">
                {{ t('nearbyDoctors.distanceKm', { km: doctor.distanceKm }) }}
              </span>
            </span>
            <span v-if="doctor.address" class="nearby-results-list__address">
              {{ doctor.address }}
            </span>
            <span class="nearby-results-list__contacts">
              <a
                v-if="doctor.phone"
                class="nearby-results-list__link"
                :href="`tel:${sanitizeTel(doctor.phone)}`"
                @click.stop
              >
                {{ doctor.phone }}
              </a>
              <a
                v-if="doctor.email"
                class="nearby-results-list__link"
                :href="`mailto:${doctor.email}`"
                @click.stop
              >
                {{ doctor.email }}
              </a>
            </span>
          </span>
          <a
            v-if="doctor.mapsUrl"
            class="nearby-results-list__external"
            :href="doctor.mapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="t('nearbyDoctors.openInMaps')"
            @click.stop
          >
            ↗
          </a>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { NearbyDoctorResult } from '@/models/nearbyDoctor'

const props = defineProps<{
  results: NearbyDoctorResult[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t } = useI18n()

function sanitizeTel(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

watch(
  () => props.selectedId,
  async (id) => {
    if (!id) return
    await nextTick()
    document
      .querySelector('.nearby-results-list__item--selected')
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
)
</script>

<style scoped>
.nearby-results-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.nearby-results-list__count {
  margin: 0;
  padding: 0.65rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.nearby-results-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.nearby-results-list__item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: none;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;
}

.nearby-results-list__item:hover {
  background: color-mix(in srgb, var(--bg-muted) 70%, transparent);
}

.nearby-results-list__item--selected {
  background: color-mix(in srgb, var(--accent-strong) 10%, var(--bg-surface));
  box-shadow: inset 3px 0 0 var(--accent-strong);
}

.nearby-results-list__index {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
}

.nearby-results-list__item--selected .nearby-results-list__index {
  background: var(--accent-strong);
  color: #fff;
}

.nearby-results-list__body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
}

.nearby-results-list__name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.nearby-results-list__practice {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.nearby-results-list__meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.nearby-results-list__rating {
  font-weight: 600;
  color: var(--text-primary);
}

.nearby-results-list__dot {
  margin: 0 0.2rem;
}

.nearby-results-list__address {
  font-size: 0.74rem;
  line-height: 1.35;
  color: var(--text-faint);
}

.nearby-results-list__contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.65rem;
  margin-top: 0.15rem;
}

.nearby-results-list__link {
  font-size: 0.74rem;
  color: var(--accent);
  text-decoration: none;
}

.nearby-results-list__link:hover {
  text-decoration: underline;
}

.nearby-results-list__external {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 6px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
}

.nearby-results-list__external:hover {
  background: var(--bg-muted);
  color: var(--accent-strong);
}
</style>
