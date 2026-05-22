<template>
  <div class="severity-trend">
    <div v-if="points.length === 0" class="chart-empty">{{ emptyText }}</div>
    <template v-else>
      <p v-if="rangeCaption" class="range-caption">{{ rangeCaption }}</p>
      <figure class="severity-figure">
        <svg
          class="severity-svg"
          :viewBox="`0 0 ${width} ${height}`"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          :aria-label="ariaLabel"
        >
          <g class="severity-grid" aria-hidden="true">
            <line
              v-for="tick in yTicks"
              :key="tick.value"
              :x1="pad.left"
              :y1="tick.y"
              :x2="width - pad.right"
              :y2="tick.y"
            />
          </g>

          <g class="severity-y-labels" aria-hidden="true">
            <text
              v-for="tick in yTicks"
              :key="`y-${tick.value}`"
              :x="pad.left - 6"
              :y="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {{ tick.value }}
            </text>
          </g>

          <path
            v-if="linePath"
            class="severity-line"
            :d="linePath"
            fill="none"
            vector-effect="non-scaling-stroke"
          />

          <g class="severity-dots">
            <circle
              v-for="dot in plotDots"
              :key="dot.date"
              class="severity-dot"
              :cx="dot.x"
              :cy="dot.y"
              r="4"
              tabindex="0"
            >
              <title>{{ dot.title }}</title>
            </circle>
          </g>

          <g class="severity-x-labels" aria-hidden="true">
            <text
              v-for="tick in xTicks"
              :key="tick.date"
              :x="tick.x"
              :y="height - 8"
              text-anchor="middle"
            >
              {{ tick.label }}
            </text>
          </g>
        </svg>
        <figcaption class="severity-axis-caption">
          <span>Event date</span>
          <span>Severity (1–10)</span>
        </figcaption>
      </figure>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import type { SeverityPoint } from '@/models/types'

const props = withDefaults(
  defineProps<{
    points: SeverityPoint[]
    emptyText?: string
  }>(),
  { emptyText: 'Log severity ratings in the journal to see trends' }
)

const width = 400
const height = 200
const pad = { top: 16, right: 12, bottom: 32, left: 28 }

const plotWidth = width - pad.left - pad.right
const plotHeight = height - pad.top - pad.bottom

const Y_TICKS = [1, 3, 5, 7, 10]
/** Minimum horizontal space between x-axis date labels (px in viewBox). */
const MIN_X_LABEL_GAP_PX = 52
const MAX_X_TICKS = 6

function formatSeverity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function yPosition(severity: number): number {
  const clamped = Math.min(10, Math.max(1, severity))
  const ratio = (clamped - 1) / 9
  return pad.top + plotHeight * (1 - ratio)
}

const chartPoints = computed(() => {
  const sorted = [...props.points].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  )
  const lastIndex = Math.max(0, sorted.length - 1)

  return sorted.map((p, index) => {
    const x =
      sorted.length === 1
        ? pad.left + plotWidth / 2
        : pad.left + (index / lastIndex) * plotWidth
    const y = yPosition(p.severity)
    return {
      date: p.date,
      label: p.label,
      severity: p.severity,
      x,
      y,
      title: `${p.label}: ${formatSeverity(p.severity)} / 10`,
      index,
    }
  })
})

const linePath = computed(() => {
  const pts = chartPoints.value
  if (pts.length < 2) return ''
  return pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
})

const plotDots = computed(() => chartPoints.value)

const yTicks = computed(() =>
  Y_TICKS.map((value) => ({ value, y: yPosition(value) }))
)

function chartSpanDays(points: { date: string }[]): number {
  if (points.length < 2) return 1
  const start = parseISO(points[0].date)
  const end = parseISO(points[points.length - 1].date)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
  const ms = end.getTime() - start.getTime()
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)) + 1)
}

function compactTickLabel(date: string, spanDays: number): string {
  const d = parseISO(date)
  if (Number.isNaN(d.getTime())) return date.slice(5) || date
  if (spanDays <= 14) return format(d, 'M/d')
  if (spanDays <= 45) return format(d, 'MMM d')
  if (spanDays > 365) return format(d, 'MMM d, yy')
  return format(d, 'MMM d')
}

function maxXTickCount(pointCount: number): number {
  const byWidth = Math.max(2, Math.floor(plotWidth / MIN_X_LABEL_GAP_PX))
  return Math.min(MAX_X_TICKS, byWidth, pointCount)
}

function evenlySpacedIndices(pointCount: number, tickCount: number): number[] {
  if (tickCount >= pointCount) {
    return Array.from({ length: pointCount }, (_, i) => i)
  }
  const indices: number[] = []
  for (let i = 0; i < tickCount; i++) {
    indices.push(Math.round((i / (tickCount - 1)) * (pointCount - 1)))
  }
  return [...new Set(indices)].sort((a, b) => a - b)
}

function pickXTicks(
  points: { date: string; label: string; x: number }[]
): { date: string; label: string; x: number }[] {
  if (points.length === 0) return []
  if (points.length === 1) return [{ ...points[0], label: compactTickLabel(points[0].date, 1) }]

  const spanDays = chartSpanDays(points)
  const targetCount = maxXTickCount(points.length)
  let indices = evenlySpacedIndices(points.length, targetCount)

  const selected: { date: string; label: string; x: number }[] = []
  for (const index of indices) {
    const p = points[index]
    const label = compactTickLabel(p.date, spanDays)
    const last = selected[selected.length - 1]
    if (last && p.x - last.x < MIN_X_LABEL_GAP_PX * 0.85) continue
    selected.push({ date: p.date, label, x: p.x })
  }

  const first = points[0]
  const last = points[points.length - 1]
  if (selected.length === 0 || selected[0].date !== first.date) {
    selected.unshift({
      date: first.date,
      label: compactTickLabel(first.date, spanDays),
      x: first.x,
    })
  }
  const tail = selected[selected.length - 1]
  if (tail.date !== last.date) {
    if (last.x - tail.x < MIN_X_LABEL_GAP_PX * 0.85 && selected.length > 1) {
      selected[selected.length - 1] = {
        date: last.date,
        label: compactTickLabel(last.date, spanDays),
        x: last.x,
      }
    } else {
      selected.push({
        date: last.date,
        label: compactTickLabel(last.date, spanDays),
        x: last.x,
      })
    }
  }

  return selected
}

const xTicks = computed(() => pickXTicks(chartPoints.value))

const rangeCaption = computed(() => {
  if (props.points.length < 2) return null
  const sorted = [...props.points].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  )
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const start = parseISO(first.date)
  const end = parseISO(last.date)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const spanYears = end.getFullYear() !== start.getFullYear()
  const fmt = spanYears ? 'MMM d, yyyy' : 'MMM d'
  const range = `${format(start, fmt)} – ${format(end, fmt)}`
  if (sorted.length > xTicks.value.length) {
    return `${range} · hover points for each day`
  }
  return range
})

const ariaLabel = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return 'Severity trend chart'
  const values = pts.map((p) => `${p.label} ${formatSeverity(p.severity)}`).join(', ')
  return `Severity over time: ${values}`
})
</script>

<style scoped>
.severity-trend {
  width: 100%;
}

.chart-empty {
  text-align: center;
  color: var(--text-faint);
  padding: 2rem 1rem;
  font-size: 0.9rem;
}

.range-caption {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: var(--text-faint);
}

.severity-figure {
  margin: 0;
  width: 100%;
}

.severity-svg {
  display: block;
  width: 100%;
  height: auto;
  min-height: 180px;
  max-height: 240px;
}

.severity-grid line {
  stroke: var(--border);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.severity-y-labels text,
.severity-x-labels text {
  fill: var(--text-faint);
  font-size: 10px;
  font-family: inherit;
}

.severity-line {
  stroke: var(--accent);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.severity-dot {
  fill: var(--accent-strong);
  stroke: var(--bg-surface);
  stroke-width: 2;
  cursor: default;
  transition: r 0.15s ease;
}

.severity-dot:hover,
.severity-dot:focus-visible {
  r: 5.5;
  fill: var(--accent-hover);
  outline: none;
}

.severity-axis-caption {
  display: flex;
  justify-content: space-between;
  margin-top: 0.35rem;
  padding: 0 0.25rem;
  font-size: 0.7rem;
  color: var(--text-faint);
}
</style>
