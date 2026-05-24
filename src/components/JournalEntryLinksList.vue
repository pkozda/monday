<template>
  <div
    class="journal-entry-links"
    :class="{
      'journal-entry-links--compact': variant === 'compact',
      'journal-entry-links--inline': variant === 'inline',
    }"
  >
    <p v-if="variant !== 'inline'" class="journal-entry-links__label">
      {{ t('recommendations.viewEntries') }}
    </p>
    <ul class="journal-entry-links__list">
      <li v-for="link in visibleLinks" :key="link.entryId">
        <RouterLink
          :to="journalEntryRoute(link.entryId)"
          class="journal-entry-links__item"
          :title="formatLinkMeta(link)"
          @click="emit('navigate')"
        >
          <span v-if="variant !== 'inline'" class="journal-entry-links__icon" aria-hidden="true"
            >→</span
          >
          <span class="journal-entry-links__text">
            <strong>{{ link.title }}</strong>
            <span v-if="variant !== 'inline'" class="journal-entry-links__meta">{{
              formatLinkMeta(link)
            }}</span>
            <span v-else class="journal-entry-links__chip-meta">{{
              t(`urgency.${link.urgency}`)
            }}</span>
          </span>
        </RouterLink>
      </li>
    </ul>
    <RouterLink
      v-if="showViewAllLink"
      :to="viewAllTo"
      class="journal-entry-links__view-all"
      @click="emit('navigate')"
    >
      {{ viewAllLabel }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { format, parseISO } from 'date-fns'
import { dateFnsLocaleFor } from '@/utils/dateLocale'
import type { AppLocale } from '@/i18n'
import type { RecommendationJournalLink } from '@/models/types'
import { journalAttentionListRoute, journalEntryRoute } from '@/utils/journalRoutes'

const props = withDefaults(
  defineProps<{
    links: RecommendationJournalLink[]
    variant?: 'default' | 'compact' | 'inline'
    showViewAll?: boolean
    viewAllTo?: { path: string; query?: Record<string, string> }
    maxInlineLinks?: number
  }>(),
  {
    variant: 'default',
    showViewAll: true,
    maxInlineLinks: 2,
  }
)

const emit = defineEmits<{
  navigate: []
}>()

const { t, locale } = useI18n()

const viewAllTo = computed(
  () => props.viewAllTo ?? journalAttentionListRoute()
)

const visibleLinks = computed(() => {
  if (props.variant !== 'inline') return props.links
  return props.links.slice(0, props.maxInlineLinks)
})

const showViewAllLink = computed(() => {
  if (!props.showViewAll) return false
  if (props.variant === 'inline') {
    return props.links.length > props.maxInlineLinks
  }
  return props.links.length > 1
})

const viewAllLabel = computed(() => {
  if (props.variant === 'inline' && props.links.length > props.maxInlineLinks) {
    return t('recommendations.viewAllAttentionCount', {
      count: props.links.length,
    })
  }
  return t('recommendations.viewAllAttention')
})

function formatLinkMeta(link: RecommendationJournalLink): string {
  const dateLocale = dateFnsLocaleFor(locale.value as AppLocale)
  let dateLabel = link.eventDate
  try {
    dateLabel = format(parseISO(link.eventDate), 'MMM d, yyyy', {
      locale: dateLocale,
    })
  } catch {
    /* keep raw */
  }
  const urgency = t(`urgency.${link.urgency}`)
  return `${link.conditionArea} · ${dateLabel} · ${urgency}`
}
</script>

<style scoped>
.journal-entry-links {
  margin-top: 0.65rem;
  padding-top: 0.65rem;
  border-top: 1px dashed var(--border-strong);
}

.journal-entry-links__label {
  margin: 0 0 0.45rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
}

.journal-entry-links__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.journal-entry-links__item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.journal-entry-links__item:hover {
  border-color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 8%, var(--bg-surface));
}

.journal-entry-links__icon {
  flex-shrink: 0;
  font-weight: 700;
  color: var(--accent-strong);
  line-height: 1.4;
}

.journal-entry-links__text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.journal-entry-links__text strong {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.journal-entry-links__meta {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.journal-entry-links__view-all {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-strong);
  text-decoration: none;
}

.journal-entry-links__view-all:hover {
  text-decoration: underline;
}

.journal-entry-links--compact .journal-entry-links__item {
  padding: 0.45rem 0.55rem;
}

.journal-entry-links--compact .journal-entry-links__text strong {
  font-size: 0.82rem;
}

.journal-entry-links--compact .journal-entry-links__meta {
  font-size: 0.68rem;
}

.journal-entry-links--inline {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.journal-entry-links--inline .journal-entry-links__list {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.journal-entry-links--inline .journal-entry-links__item {
  align-items: center;
  padding: 0.3rem 0.55rem;
  max-width: 100%;
}

.journal-entry-links--inline .journal-entry-links__text {
  flex-direction: row;
  align-items: baseline;
  gap: 0.35rem;
}

.journal-entry-links--inline .journal-entry-links__text strong {
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 9rem;
}

.journal-entry-links__chip-meta {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--urgency-urgent-text);
  white-space: nowrap;
}

.journal-entry-links--inline .journal-entry-links__view-all {
  margin-top: 0.35rem;
  font-size: 0.72rem;
}
</style>
