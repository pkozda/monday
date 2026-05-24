<template>
  <div class="rec-card__layout">
    <div
      class="rec-card__icon"
      :class="`rec-card__icon--${rec.category}`"
      aria-hidden="true"
    >
      <svg v-if="rec.category === 'screening'" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 3h6v3H9V3zm-2 5h10v13a2 2 0 01-2 2H9a2 2 0 01-2-2V8z"
          stroke="currentColor"
          stroke-width="1.75"
        />
        <path
          d="M8 12h8M8 16h5"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
      <svg v-else-if="rec.category === 'preventive'" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l7 4v5c0 4.5-3 8.5-7 9-4-.5-7-4.5-7-9V7l7-4z"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else-if="rec.category === 'lifestyle'" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21s-6-4.5-6-10a6 6 0 1112 0c0 5.5-6 10-6 10z"
          stroke="currentColor"
          stroke-width="1.75"
        />
        <circle cx="12" cy="11" r="2.5" fill="currentColor" />
      </svg>
      <svg v-else-if="rec.category === 'profile'" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.75" />
        <path
          d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none">
        <path
          d="M6 4h12a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linejoin="round"
        />
        <path
          d="M9 9h6M9 13h4"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <div class="rec-card__body">
      <div class="rec-card__top">
        <span class="rec-card__badge">{{
          t(`recommendations.categories.${rec.category}`)
        }}</span>
        <span v-if="rec.priority === 'high'" class="rec-card__priority">
          <span class="rec-card__priority-dot" aria-hidden="true" />
          {{ t('common.priority') }}
        </span>
      </div>
      <h3 class="rec-card__title">{{ rec.title }}</h3>
      <p class="rec-card__detail">{{ rec.detail }}</p>

      <JournalEntryLinksList
        v-if="journalLinks.length"
        variant="compact"
        :links="journalLinks"
        :show-view-all="journalLinks.length > 1 && Boolean(rec.actionRoute)"
        @navigate="emit('navigate')"
      />

      <RouterLink
        v-else-if="rec.actionRoute"
        :to="rec.actionRoute"
        class="rec-card__action"
        @click="emit('navigate')"
      >
        {{ actionLabel }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import JournalEntryLinksList from '@/components/JournalEntryLinksList.vue'
import type { HealthRecommendation } from '@/models/types'

const props = defineProps<{
  rec: HealthRecommendation & { title: string; detail: string }
}>()

const emit = defineEmits<{
  navigate: []
}>()

const { t } = useI18n()

const journalLinks = computed(() => props.rec.journalLinks ?? [])

const actionLabel = computed(() => {
  if (props.rec.id === 'journal-attention') {
    return t('recommendations.openAttentionJournal')
  }
  if (props.rec.id === 'start-journaling' || props.rec.id === 'journal-recent') {
    return t('common.goToJournal')
  }
  return t('recommendations.viewInJournal')
})

</script>

<style scoped>
.rec-card__layout {
  display: flex;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  align-items: flex-start;
}

.rec-card__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 10px;
  color: var(--text-primary);
}

.rec-card__icon svg {
  width: 1.35rem;
  height: 1.35rem;
}

.rec-card__icon--screening {
  background: color-mix(in srgb, var(--accent-strong) 18%, var(--bg-surface));
  color: var(--accent-strong);
}

.rec-card__icon--preventive {
  background: color-mix(in srgb, #2e7d32 16%, var(--bg-surface));
  color: #2e7d32;
}

[data-theme='dark'] .rec-card__icon--preventive {
  color: #81c784;
  background: color-mix(in srgb, #81c784 14%, var(--bg-surface));
}

.rec-card__icon--lifestyle {
  background: color-mix(in srgb, #e91e63 12%, var(--bg-surface));
  color: #c2185b;
}

[data-theme='dark'] .rec-card__icon--lifestyle {
  color: #f48fb1;
  background: color-mix(in srgb, #f48fb1 12%, var(--bg-surface));
}

.rec-card__icon--profile {
  background: color-mix(in srgb, #7e57c2 14%, var(--bg-surface));
  color: #7e57c2;
}

[data-theme='dark'] .rec-card__icon--profile {
  color: #b39ddb;
}

.rec-card__icon--journal {
  background: color-mix(in srgb, var(--urgency-urgent-text) 14%, var(--bg-surface));
  color: var(--urgency-urgent-text);
}

.rec-card__body {
  flex: 1;
  min-width: 0;
}

.rec-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.rec-card__badge {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.rec-card__priority {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--urgency-urgent-text);
}

.rec-card__priority-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: var(--urgency-urgent-text);
  animation: rec-pulse 1.5s ease-in-out infinite;
}

@keyframes rec-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.85);
  }
}

.rec-card__title {
  margin: 0 0 0.3rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.rec-card__detail {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.rec-card__body :deep(.journal-entry-links) {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--border-strong);
}

.rec-card__action {
  display: inline-flex;
  align-items: center;
  margin-top: 0.75rem;
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 10%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, var(--accent-strong) 35%, var(--border));
  border-radius: 6px;
}

.rec-card__action:hover {
  background: color-mix(in srgb, var(--accent-strong) 18%, var(--bg-surface));
}
</style>
