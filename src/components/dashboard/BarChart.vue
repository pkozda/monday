<template>
  <div class="bar-chart">
    <div v-if="segments.length === 0" class="chart-empty">{{ emptyText }}</div>
    <div v-else class="bars">
      <div v-for="item in segments" :key="item.label" class="bar-row">
        <span class="bar-label">{{ item.label }}</span>
        <div class="bar-track">
          <div
            class="bar-fill"
            :style="{
              width: barWidth(item.value),
              backgroundColor: item.color,
            }"
          />
        </div>
        <span class="bar-value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChartSegment } from '@/models/types'

const props = withDefaults(
  defineProps<{
    segments: ChartSegment[]
    emptyText?: string
  }>(),
  { emptyText: 'No data yet' }
)

const maxValue = computed(() =>
  Math.max(1, ...props.segments.map((s) => s.value))
)

function barWidth(value: number): string {
  return `${(value / maxValue.value) * 100}%`
}
</script>

<style scoped>
.bar-chart {
  width: 100%;
}

.chart-empty {
  text-align: center;
  color: var(--text-faint);
  padding: 2rem 1rem;
  font-size: 0.9rem;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bar-row {
  display: grid;
  grid-template-columns: 7rem 1fr 2rem;
  align-items: center;
  gap: 0.75rem;
}

.bar-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: right;
}

.bar-track {
  height: 10px;
  background: var(--bg-muted);
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  min-width: 4px;
  transition: width 0.4s ease;
}

.bar-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
}

@media (max-width: 520px) {
  .bar-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .bar-label {
    text-align: left;
  }

  .bar-value {
    text-align: left;
  }
}
</style>
