<template>
  <div class="severity-trend">
    <div v-if="points.length === 0" class="chart-empty">{{ emptyText }}</div>
    <template v-else>
      <p v-if="rangeCaption" class="range-caption">{{ rangeCaption }}</p>
      <div
        class="severity-rows"
        :class="{ 'severity-rows--scroll': displayRows.length > 7 }"
        role="list"
        :aria-label="ariaLabel"
      >
        <div
          v-for="row in displayRows"
          :key="row.date"
          class="severity-row"
          role="listitem"
        >
          <time class="severity-date" :datetime="row.date">{{ row.shortLabel }}</time>
          <div
            class="severity-track"
            :title="`${row.shortLabel}: ${formatSeverity(row.severity)} / 10`"
          >
            <div
              class="severity-fill"
              :style="{ width: barPercent(row.severity) }"
            />
          </div>
          <span class="severity-value">{{ formatSeverity(row.severity) }}</span>
        </div>
      </div>
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

const MAX_ROWS = 12

function formatSeverity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function barPercent(severity: number): string {
  const clamped = Math.min(10, Math.max(1, severity))
  return `${(clamped / 10) * 100}%`
}

function shortDateLabel(isoDay: string, compact: boolean): string {
  const d = parseISO(isoDay)
  if (Number.isNaN(d.getTime())) return isoDay.slice(5) || isoDay
  return compact ? format(d, 'M/d') : format(d, 'MMM d')
}

const displayRows = computed(() => {
  const recent = props.points.slice(-MAX_ROWS)
  const compact = recent.length > 6
  return [...recent].reverse().map((p) => ({
    ...p,
    shortLabel: shortDateLabel(p.date, compact),
  }))
})

const rangeCaption = computed(() => {
  if (props.points.length < 2) return null
  const first = props.points[0]
  const last = props.points[props.points.length - 1]
  const start = parseISO(first.date)
  const end = parseISO(last.date)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const spanYears = end.getFullYear() !== start.getFullYear()
  const fmt = spanYears ? 'MMM d, yyyy' : 'MMM d'
  const range = `${format(start, fmt)} – ${format(end, fmt)}`
  if (props.points.length > MAX_ROWS) {
    return `${range} · showing latest ${MAX_ROWS} days`
  }
  return range
})

const ariaLabel = computed(() =>
  displayRows.value
    .map((p) => `${p.shortLabel}: ${formatSeverity(p.severity)} out of 10`)
    .join(', ')
)
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
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  color: var(--text-faint);
}

.severity-rows {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.severity-rows--scroll {
  max-height: 280px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.severity-row {
  display: grid;
  grid-template-columns: 3.25rem 1fr 2.25rem;
  align-items: center;
  gap: 0.65rem;
}

.severity-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: right;
  white-space: nowrap;
}

.severity-track {
  height: 12px;
  background: var(--bg-muted);
  border-radius: 6px;
  overflow: hidden;
}

.severity-fill {
  height: 100%;
  min-width: 4px;
  border-radius: 6px;
  background: var(--accent);
  transition: width 0.35s ease;
}

.severity-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 520px) {
  .severity-row {
    grid-template-columns: 2.75rem 1fr 2rem;
    gap: 0.5rem;
  }
}
</style>
