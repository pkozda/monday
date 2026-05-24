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
        <header class="rec-modal-hero">
          <div class="rec-modal-hero__glow" aria-hidden="true" />
          <button
            type="button"
            class="rec-modal-close"
            :aria-label="t('common.close')"
            @click="close"
          >
            <span aria-hidden="true">×</span>
          </button>

          <div class="rec-modal-hero__icon-wrap" aria-hidden="true">
            <svg class="rec-modal-hero__icon" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="2" opacity="0.35" />
              <path
                d="M32 18v8M32 38v8M18 32h8M38 32h8"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <circle cx="32" cy="32" r="10" fill="currentColor" opacity="0.2" />
              <path
                d="M28 32l3 3 6-7"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <p class="rec-modal-eyebrow">{{ t('recommendations.eyebrow') }}</p>
          <h2 id="recommendations-modal-title" class="rec-modal-title">
            {{ headline }}
          </h2>
          <p v-if="recommendations.length" class="rec-modal-hero__subtitle">
            {{ t('recommendations.heroSubtitle') }}
          </p>

          <div v-if="recommendations.length" class="rec-modal-stats" role="list">
            <span
              v-if="highCount"
              class="rec-stat rec-stat--priority"
              role="listitem"
            >
              <span class="rec-stat__icon" aria-hidden="true">!</span>
              <strong>{{ highCount }}</strong>
              {{ t('recommendations.statPriority') }}
            </span>
            <span class="rec-stat" role="listitem">
              <span class="rec-stat__icon rec-stat__icon--tips" aria-hidden="true">✦</span>
              <strong>{{ recommendations.length }}</strong>
              {{ t('recommendations.statTotal') }}
            </span>
          </div>
        </header>

        <div class="rec-modal-body">
          <div v-if="recommendations.length" class="rec-modal-summary">
            <span class="rec-modal-summary__icon" aria-hidden="true">💡</span>
            <p class="rec-modal-summary__text">
              <strong>{{ t('recommendations.summaryBold') }}</strong>
              {{ t('recommendations.summary') }}
            </p>
          </div>

          <p class="rec-modal-disclaimer">
            <span class="rec-modal-disclaimer__icon" aria-hidden="true">ℹ</span>
            {{ t('recommendations.disclaimer') }}
          </p>

          <div v-if="groupedRecommendations.high.length" class="rec-section">
            <h3 class="rec-section__heading">
              <span class="rec-section__heading-icon" aria-hidden="true">⚡</span>
              {{ t('recommendations.sectionPriority') }}
            </h3>
            <ul class="rec-modal-list">
              <li
                v-for="rec in groupedRecommendations.high"
                :key="rec.id"
                class="rec-card"
                :class="cardClasses(rec)"
              >
                <RecommendationCard :rec="rec" @navigate="close" />
              </li>
            </ul>
          </div>

          <div v-if="groupedRecommendations.other.length" class="rec-section">
            <h3
              v-if="groupedRecommendations.high.length"
              class="rec-section__heading rec-section__heading--muted"
            >
              <span class="rec-section__heading-icon" aria-hidden="true">📋</span>
              {{ t('recommendations.sectionMore') }}
            </h3>
            <ul class="rec-modal-list">
              <li
                v-for="rec in groupedRecommendations.other"
                :key="rec.id"
                class="rec-card"
                :class="cardClasses(rec)"
              >
                <RecommendationCard :rec="rec" @navigate="close" />
              </li>
            </ul>
          </div>

          <div v-if="!recommendations.length" class="rec-modal-empty">
            <div class="rec-modal-empty__art" aria-hidden="true">
              <svg viewBox="0 0 80 80" fill="none">
                <rect
                  x="12"
                  y="16"
                  width="56"
                  height="48"
                  rx="8"
                  stroke="currentColor"
                  stroke-width="2"
                  opacity="0.4"
                />
                <path
                  d="M22 32h36M22 42h28M22 52h20"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  opacity="0.5"
                />
                <circle cx="56" cy="52" r="12" fill="currentColor" opacity="0.15" />
                <path
                  d="M52 52h8M56 48v8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <p class="rec-modal-empty__title">
              {{ t('recommendations.emptyTitle') }}
            </p>
            <p class="rec-modal-empty__text">{{ t('recommendations.empty') }}</p>
          </div>
        </div>

        <footer class="rec-modal-footer">
          <button type="button" class="rec-modal-cta" @click="close">
            {{ t('recommendations.gotIt') }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import RecommendationCard from '@/components/dashboard/RecommendationCard.vue'
import { localizeRecommendation } from '@/services/localizeRecommendation'
import type { HealthRecommendation } from '@/models/types'

const props = defineProps<{
  open: boolean
  recommendations: HealthRecommendation[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const headline = computed(() => {
  const n = props.recommendations.length
  if (n === 0) return t('recommendations.headlineNone')
  if (n === 1) return t('recommendations.headlineOne')
  return t('recommendations.headlineMany', { count: n })
})

const localizedRecommendations = computed(() =>
  props.recommendations.map((rec) => ({
    ...rec,
    ...localizeRecommendation(rec, t),
  }))
)

const highCount = computed(
  () => localizedRecommendations.value.filter((r) => r.priority === 'high').length
)

const groupedRecommendations = computed(() => {
  const high = localizedRecommendations.value.filter((r) => r.priority === 'high')
  const other = localizedRecommendations.value.filter((r) => r.priority !== 'high')
  return { high, other }
})

function cardClasses(rec: HealthRecommendation) {
  return [
    `rec-card--${rec.category}`,
    `rec-card--priority-${rec.priority}`,
  ]
}

function close() {
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.rec-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(6px);
}

.rec-modal-dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 520px;
  max-height: min(92vh, 780px);
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.28),
    0 0 0 1px color-mix(in srgb, var(--accent-strong) 12%, transparent);
}

.rec-modal-hero {
  position: relative;
  padding: 1.75rem 1.5rem 1.25rem;
  text-align: center;
  background: linear-gradient(
    165deg,
    color-mix(in srgb, #2e7d32 22%, var(--bg-surface)) 0%,
    color-mix(in srgb, var(--accent-strong) 8%, var(--bg-surface)) 55%,
    var(--bg-surface) 100%
  );
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}

[data-theme='dark'] .rec-modal-hero {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, #81c784 18%, var(--bg-surface)) 0%,
    color-mix(in srgb, var(--accent-strong) 12%, var(--bg-surface)) 50%,
    var(--bg-surface) 100%
  );
}

.rec-modal-hero__glow {
  position: absolute;
  top: -40%;
  left: 50%;
  width: 280px;
  height: 280px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, #43a047 35%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
  opacity: 0.5;
}

.rec-modal-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1.35rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px var(--shadow);
}

.rec-modal-close:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.rec-modal-hero__icon-wrap {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  background: color-mix(in srgb, #2e7d32 18%, var(--bg-surface));
  border: 2px solid color-mix(in srgb, #2e7d32 35%, var(--border));
  color: #2e7d32;
  box-shadow: 0 8px 24px color-mix(in srgb, #2e7d32 25%, transparent);
}

[data-theme='dark'] .rec-modal-hero__icon-wrap {
  color: #81c784;
  background: color-mix(in srgb, #81c784 15%, var(--bg-surface));
  border-color: color-mix(in srgb, #81c784 40%, var(--border));
}

.rec-modal-hero__icon {
  width: 2.5rem;
  height: 2.5rem;
}

.rec-modal-eyebrow {
  position: relative;
  z-index: 1;
  margin: 0 0 0.35rem;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #2e7d32;
}

[data-theme='dark'] .rec-modal-eyebrow {
  color: #81c784;
}

.rec-modal-title {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.rec-modal-hero__subtitle {
  position: relative;
  z-index: 1;
  margin: 0.5rem auto 0;
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--text-secondary);
  max-width: 28rem;
}

.rec-modal-stats {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.rec-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  box-shadow: 0 1px 4px var(--shadow);
}

.rec-stat strong {
  font-weight: 800;
  color: var(--text-primary);
}

.rec-stat--priority {
  border-color: color-mix(in srgb, var(--urgency-urgent-text) 45%, var(--border));
  background: color-mix(in srgb, var(--urgency-urgent-bg) 50%, var(--bg-surface));
}

.rec-stat--priority strong {
  color: var(--urgency-urgent-text);
}

.rec-stat__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.15rem;
  height: 1.15rem;
  font-size: 0.7rem;
  font-weight: 800;
  border-radius: 50%;
  background: var(--urgency-urgent-bg);
  color: var(--urgency-urgent-text);
}

.rec-stat__icon--tips {
  background: color-mix(in srgb, #2e7d32 20%, var(--bg-muted));
  color: #2e7d32;
  font-size: 0.55rem;
}

[data-theme='dark'] .rec-stat__icon--tips {
  color: #81c784;
  background: color-mix(in srgb, #81c784 20%, var(--bg-muted));
}

.rec-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.15rem 1.25rem 0.5rem;
}

.rec-modal-summary {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 0.85rem;
  padding: 0.9rem 1rem;
  text-align: left;
  background: color-mix(in srgb, #2e7d32 8%, var(--bg-muted));
  border: 1px solid color-mix(in srgb, #2e7d32 22%, var(--border));
  border-radius: 12px;
}

.rec-modal-summary__icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  line-height: 1;
}

.rec-modal-summary__text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.rec-modal-summary__text strong {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.rec-modal-disclaimer {
  display: flex;
  gap: 0.45rem;
  align-items: flex-start;
  margin: 0 0 1rem;
  padding: 0.55rem 0.65rem;
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--text-faint);
  background: var(--bg-muted);
  border-radius: 8px;
}

.rec-modal-disclaimer__icon {
  flex-shrink: 0;
  font-weight: 700;
  opacity: 0.7;
}

.rec-section {
  margin-bottom: 1rem;
}

.rec-section__heading {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.55rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--urgency-urgent-text);
}

.rec-section__heading--muted {
  color: var(--text-muted);
}

.rec-section__heading-icon {
  font-size: 0.95rem;
}

.rec-modal-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.rec-card {
  border-radius: 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.rec-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--shadow);
  border-color: var(--border-strong);
}

.rec-card--priority-high {
  border-color: color-mix(in srgb, var(--urgency-urgent-text) 50%, var(--border));
  background: color-mix(in srgb, var(--urgency-urgent-bg) 55%, var(--bg-muted));
}

.rec-modal-empty {
  padding: 1.5rem 1rem 1rem;
  text-align: center;
}

.rec-modal-empty__art {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  color: var(--text-faint);
}

.rec-modal-empty__art svg {
  width: 5rem;
  height: 5rem;
}

.rec-modal-empty__title {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.rec-modal-empty__text {
  margin: 0 auto;
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 22rem;
}

.rec-modal-footer {
  flex-shrink: 0;
  padding: 0.85rem 1.25rem 1.25rem;
  border-top: 1px solid var(--border);
  background: var(--bg-surface);
}

.rec-modal-cta {
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  box-shadow: 0 4px 14px color-mix(in srgb, #2e7d32 40%, transparent);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}

.rec-modal-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px color-mix(in srgb, #2e7d32 45%, transparent);
}

.rec-modal-cta:active {
  transform: translateY(0);
}

[data-theme='dark'] .rec-modal-cta {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
}
</style>
