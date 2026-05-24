<template>
  <StatCard
    class="attention-stat-card"
    variant="attention"
    :label="label"
    :value="value"
    :hint="hint"
    :detail="detail"
    :alert="true"
  >
    <template #footer>
      <JournalEntryLinksList variant="inline" :links="links" />
    </template>
  </StatCard>
</template>

<script setup lang="ts">
import StatCard from '@/components/dashboard/StatCard.vue'
import JournalEntryLinksList from '@/components/JournalEntryLinksList.vue'
import type { RecommendationJournalLink } from '@/models/types'

defineProps<{
  label: string
  value: number
  hint: string
  detail: string
  links: RecommendationJournalLink[]
}>()
</script>

<style scoped>
.attention-stat-card {
  min-width: 0;
}
</style>
