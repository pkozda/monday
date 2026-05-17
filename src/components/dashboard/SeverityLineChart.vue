<template>
  <div class="severity-chart">
    <div v-if="points.length === 0" class="chart-empty">{{ emptyText }}</div>
    <svg
      v-else
      viewBox="0 0 400 160"
      class="severity-svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="ariaLabel"
    >
      <line
        v-for="tick in yTicks"
        :key="tick"
        x1="40"
        :x2="380"
        :y1="yForSeverity(tick)"
        :y2="yForSeverity(tick)"
        class="grid-line"
      />
      <text
        v-for="tick in yTicks"
        :key="`label-${tick}`"
        x="34"
        :y="yForSeverity(tick) + 4"
        class="axis-label"
        text-anchor="end"
      >
        {{ tick }}
      </text>
      <polyline :points="linePoints" class="severity-line" fill="none" />
      <circle
        v-for="(p, i) in plotPoints"
        :key="i"
        :cx="p.x"
        :cy="p.y"
        r="4"
        class="severity-dot"
      />
      <text
        v-for="(p, i) in plotPoints"
        :key="`x-${i}`"
        :x="p.x"
        y="155"
        class="axis-label"
        text-anchor="middle"
      >
        {{ p.label }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SeverityPoint } from '@/models/types'

const props = withDefaults(
  defineProps<{
    points: SeverityPoint[]
    emptyText?: string
  }>(),
  { emptyText: 'Log severity ratings in the journal to see trends' }
)

const yTicks = [2, 4, 6, 8, 10]
const padding = { left: 40, right: 20, top: 16, bottom: 28 }
const width = 400
const height = 160

function yForSeverity(severity: number): number {
  const chartH = height - padding.top - padding.bottom
  return padding.top + chartH * (1 - (severity - 1) / 9)
}

const plotPoints = computed(() => {
  const chartW = width - padding.left - padding.right
  const n = props.points.length
  return props.points.map((p, i) => ({
    x: padding.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW),
    y: yForSeverity(p.severity),
    label: p.label,
  }))
})

const linePoints = computed(() =>
  plotPoints.value.map((p) => `${p.x},${p.y}`).join(' ')
)

const ariaLabel = computed(() =>
  props.points.map((p) => `${p.label}: ${p.severity}/10`).join(', ')
)
</script>

<style scoped>
.severity-chart {
  width: 100%;
}

.chart-empty {
  text-align: center;
  color: var(--text-faint);
  padding: 2rem 1rem;
  font-size: 0.9rem;
}

.severity-svg {
  width: 100%;
  max-height: 200px;
  display: block;
}

.grid-line {
  stroke: var(--border);
  stroke-width: 1;
}

.axis-label {
  fill: var(--text-faint);
  font-size: 10px;
}

.severity-line {
  stroke: var(--accent);
  stroke-width: 2;
  stroke-linejoin: round;
}

.severity-dot {
  fill: var(--accent);
  stroke: var(--donut-hole);
  stroke-width: 2;
}
</style>
