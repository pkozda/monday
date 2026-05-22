<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="rec-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recommendations-modal-title"
      @click.self="close"
    >
      <div class="rec-modal-dialog">
        <button
          type="button"
          class="rec-modal-close"
          aria-label="Close"
          @click="close"
        >
          ×
        </button>

        <div class="rec-modal-content">
          <p class="rec-modal-eyebrow">Recommendations for you</p>
          <h2 id="recommendations-modal-title" class="rec-modal-title">
            {{ headline }}
          </h2>

          <div class="rec-modal-summary">
            <p class="rec-modal-summary__text">
              Preventive care suggestions based on your age, profile, and journal
            </p>
          </div>

          <p class="rec-modal-disclaimer">
            General guidance—not a substitute for advice from your clinician.
          </p>

          <ul v-if="recommendations.length" class="rec-modal-list">
            <li
              v-for="rec in recommendations"
              :key="rec.id"
              class="rec-card"
              :class="[
                `rec-card--${rec.category}`,
                `rec-card--priority-${rec.priority}`,
              ]"
            >
              <div class="rec-card__top">
                <span class="rec-card__badge">{{ categoryLabel(rec.category) }}</span>
                <span
                  v-if="rec.priority === 'high'"
                  class="rec-card__priority"
                >
                  Priority
                </span>
              </div>
              <h3 class="rec-card__title">{{ rec.title }}</h3>
              <p class="rec-card__detail">{{ rec.detail }}</p>
            </li>
          </ul>

          <div v-else class="rec-modal-empty">
            <p>
              Add your date of birth in your profile to unlock personalized
              screening suggestions.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HealthRecommendation, HealthRecommendationCategory } from '@/models/types'

const props = defineProps<{
  open: boolean
  recommendations: HealthRecommendation[]
}>()

const emit = defineEmits<{
  close: []
}>()

const CATEGORY_LABELS: Record<HealthRecommendationCategory, string> = {
  screening: 'Screening',
  preventive: 'Preventive',
  lifestyle: 'Lifestyle',
  profile: 'Profile',
  journal: 'Your data',
}

const headline = computed(() => {
  const n = props.recommendations.length
  if (n === 0) return 'No suggestions yet'
  if (n === 1) return '1 suggestion'
  return `${n} suggestions`
})

function categoryLabel(category: HealthRecommendationCategory): string {
  return CATEGORY_LABELS[category]
}

function close() {
  emit('close')
}
</script>

<style scoped>
.rec-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
}

.rec-modal-dialog {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: min(90vh, 720px);
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 0 0 1.5rem;
  box-shadow: 0 20px 56px var(--shadow);
}

.rec-modal-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 2;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 2rem;
  height: 2rem;
  font-size: 1.35rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rec-modal-close:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.rec-modal-content {
  padding: 2.75rem 1.5rem 0;
  text-align: center;
}

.rec-modal-eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2e7d32;
}

[data-theme='dark'] .rec-modal-eyebrow {
  color: #81c784;
}

.rec-modal-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.rec-modal-summary {
  margin: 1rem 0 0.85rem;
  padding: 0.85rem 1rem;
  background: color-mix(in srgb, #2e7d32 10%, var(--bg-muted));
  border: 1px solid color-mix(in srgb, #2e7d32 28%, var(--border));
  border-radius: 10px;
}

[data-theme='dark'] .rec-modal-summary {
  background: color-mix(in srgb, #81c784 12%, var(--bg-muted));
  border-color: color-mix(in srgb, #81c784 30%, var(--border));
}

.rec-modal-summary__text {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--text-secondary);
}

.rec-modal-disclaimer {
  margin: 0 0 1.15rem;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--text-faint);
}

.rec-modal-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  text-align: left;
}

.rec-card {
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: var(--bg-muted);
  border: 1px solid var(--border);
}

.rec-card--priority-high {
  border-color: color-mix(in srgb, var(--urgency-urgent-text) 55%, var(--border));
  background: color-mix(in srgb, var(--urgency-urgent-bg) 70%, var(--bg-muted));
}

.rec-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
}

.rec-card__badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.rec-card--screening .rec-card__badge {
  color: var(--accent-strong);
  border-color: color-mix(in srgb, var(--accent-strong) 50%, var(--border));
}

.rec-card--preventive .rec-card__badge,
.rec-card--lifestyle .rec-card__badge {
  color: #2e7d32;
  border-color: color-mix(in srgb, #2e7d32 45%, var(--border));
}

[data-theme='dark'] .rec-card--preventive .rec-card__badge,
[data-theme='dark'] .rec-card--lifestyle .rec-card__badge {
  color: #81c784;
  border-color: color-mix(in srgb, #81c784 45%, var(--border));
}

.rec-card--journal .rec-card__badge {
  color: var(--urgency-urgent-text);
  border-color: color-mix(in srgb, var(--urgency-urgent-text) 45%, var(--border));
}

.rec-card__priority {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--urgency-urgent-text);
}

.rec-card__title {
  margin: 0 0 0.35rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.rec-card__detail {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.rec-modal-empty {
  padding: 0.75rem 1rem;
  background: var(--bg-muted);
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  text-align: center;
}

.rec-modal-empty p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
