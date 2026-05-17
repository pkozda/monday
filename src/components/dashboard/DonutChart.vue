<template>
  <div class="donut-chart">
    <div v-if="segments.length === 0" class="chart-empty">{{ emptyText }}</div>
    <div v-else class="donut-layout">
      <div
        class="donut-ring"
        :style="{ background: conicGradient }"
        role="img"
        :aria-label="ariaLabel"
      />
      <ul class="donut-legend">
        <li v-for="item in segments" :key="item.label" class="legend-item">
          <span class="legend-swatch" :style="{ backgroundColor: item.color }" />
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.value }} ({{ percent(item.value) }}%)</span>
        </li>
      </ul>
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

const total = computed(() =>
  props.segments.reduce((sum, s) => sum + s.value, 0)
)

const conicGradient = computed(() => {
  if (total.value === 0) return 'var(--bg-muted)'
  let cursor = 0
  const stops: string[] = []
  for (const seg of props.segments) {
    const start = (cursor / total.value) * 100
    cursor += seg.value
    const end = (cursor / total.value) * 100
    stops.push(`${seg.color} ${start}% ${end}%`)
  }
  return `conic-gradient(${stops.join(', ')})`
})

const ariaLabel = computed(() =>
  props.segments.map((s) => `${s.label}: ${s.value}`).join(', ')
)

function percent(value: number): number {
  if (total.value === 0) return 0
  return Math.round((value / total.value) * 100)
}
</script>

<style scoped>
.donut-chart {
  width: 100%;
}

.chart-empty {
  text-align: center;
  color: var(--text-faint);
  padding: 2rem 1rem;
  font-size: 0.9rem;
}

.donut-layout {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.donut-ring {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
}

.donut-ring::after {
  content: '';
  position: absolute;
  inset: 28%;
  background: var(--donut-hole);
  border-radius: 50%;
}

.donut-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  color: var(--text-secondary);
  flex: 1;
}

.legend-value {
  color: var(--text-primary);
  font-weight: 500;
}
</style>
