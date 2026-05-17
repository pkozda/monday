<template>
  <div class="recommendations-accordion">
    <h2 class="visually-hidden">Recommendations for you</h2>
    <button
      type="button"
      class="accordion-trigger"
      :aria-expanded="expanded"
      aria-controls="recommendations-panel"
      @click="expanded = !expanded"
    >
      <span class="accordion-trigger-text">
        <span class="accordion-title">Recommendations for you</span>
        <span class="accordion-subtitle">
          Preventive care suggestions based on your age, profile, and journal
        </span>
      </span>
      <span class="accordion-trigger-meta">
        <span v-if="recommendations.length" class="accordion-count">
          {{ recommendations.length }}
        </span>
        <span
          class="accordion-chevron"
          :class="{ 'accordion-chevron--open': expanded }"
          aria-hidden="true"
        />
      </span>
    </button>

    <div
      id="recommendations-panel"
      class="accordion-panel"
      :class="{ 'accordion-panel--open': expanded }"
      :aria-hidden="!expanded"
    >
      <div class="accordion-panel-inner">
        <p class="recommendations-disclaimer">
          General preventive guidance based on your profile and journal—not a substitute
          for advice from your clinician.
        </p>

        <ul v-if="recommendations.length" class="recommendations-list">
          <li
            v-for="rec in recommendations"
            :key="rec.id"
            class="recommendation-item"
            :class="`priority--${rec.priority}`"
          >
            <span class="recommendation-badge" :class="`badge--${rec.category}`">
              {{ categoryLabel(rec.category) }}
            </span>
            <div class="recommendation-body">
              <h3 class="recommendation-title">{{ rec.title }}</h3>
              <p class="recommendation-detail">{{ rec.detail }}</p>
            </div>
          </li>
        </ul>

        <p v-else class="recommendations-empty">
          Add your date of birth in your profile to see personalized screening suggestions.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HealthRecommendation, HealthRecommendationCategory } from '@/models/types'

defineProps<{
  recommendations: HealthRecommendation[]
}>()

const expanded = ref(false)

const CATEGORY_LABELS: Record<HealthRecommendationCategory, string> = {
  screening: 'Screening',
  preventive: 'Preventive',
  lifestyle: 'Lifestyle',
  profile: 'Profile',
  journal: 'Your data',
}

function categoryLabel(category: HealthRecommendationCategory): string {
  return CATEGORY_LABELS[category]
}
</script>

<style scoped>
.recommendations-accordion {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.accordion-trigger {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: inherit;
  transition: background-color 0.2s;
}

.accordion-trigger:hover {
  background: var(--bg-muted);
}

.accordion-trigger:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.accordion-trigger-text {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.accordion-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.25;
}

.accordion-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.accordion-trigger-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  margin-top: 0.35rem;
}

.accordion-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--hint-bg);
  border: 1px solid var(--hint-border);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  min-width: 1.5rem;
  text-align: center;
}

.accordion-chevron {
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid var(--text-muted);
  border-bottom: 2px solid var(--text-muted);
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.accordion-chevron--open {
  transform: rotate(-135deg);
  margin-top: 0.25rem;
}

.accordion-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
  border-top: 1px solid transparent;
}

.accordion-panel--open {
  grid-template-rows: 1fr;
  border-top-color: var(--border);
}

.accordion-panel-inner {
  overflow: hidden;
  min-height: 0;
  padding: 0 1.5rem;
}

.accordion-panel--open .accordion-panel-inner {
  padding: 1.25rem 1.5rem 1.5rem;
}

.recommendations-disclaimer {
  font-size: 0.8rem;
  color: var(--text-faint);
  margin: 0 0 1.25rem;
  line-height: 1.45;
}

.recommendations-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.875rem 1rem;
  border-radius: 6px;
  background: var(--bg-muted);
  border: 1px solid var(--border);
}

.recommendation-item.priority--high {
  border-color: var(--urgency-urgent-text);
  background: var(--urgency-urgent-bg);
}

.recommendation-badge {
  flex-shrink: 0;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.45rem;
  border-radius: 4px;
  margin-top: 0.15rem;
  background: var(--bg-surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.badge--screening {
  color: var(--accent);
  border-color: var(--accent);
}

.badge--journal {
  color: var(--urgency-urgent-text);
  border-color: var(--urgency-urgent-text);
}

.recommendation-body {
  min-width: 0;
}

.recommendation-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.35rem;
  color: var(--text-primary);
}

.recommendation-detail {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.recommendations-empty {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
  text-align: center;
  padding: 1rem 0;
}
</style>
