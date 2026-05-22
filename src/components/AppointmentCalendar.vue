<template>
  <div class="appointment-calendar" :class="{ 'appointment-calendar--compact': compact }">
    <div class="calendar-toolbar">
      <button type="button" class="cal-nav" aria-label="Previous month" @click="prevMonth">
        ‹
      </button>
      <h3 class="calendar-month">{{ monthLabel }}</h3>
      <button type="button" class="cal-nav" aria-label="Next month" @click="nextMonth">
        ›
      </button>
      <button type="button" class="cal-today" @click="goToday">Today</button>
    </div>

    <div class="calendar-weekdays">
      <span v-for="d in weekdayLabelsDisplay" :key="d" class="weekday">{{ d }}</span>
    </div>

    <div class="calendar-grid" role="grid" aria-label="Appointment calendar">
      <button
        v-for="cell in cells"
        :key="cell.dayKey"
        type="button"
        class="calendar-day"
        :class="{
          'calendar-day--outside': !cell.inMonth,
          'calendar-day--today': cell.isToday,
          'calendar-day--selected': cell.dayKey === selectedDayKey,
          'calendar-day--has-appts': cell.appointmentCount > 0,
        }"
        :aria-label="dayAriaLabel(cell)"
        :aria-pressed="cell.dayKey === selectedDayKey"
        @click="selectDay(cell.dayKey)"
      >
        <span class="calendar-day__num">{{ format(cell.date, 'd') }}</span>
        <span
          v-if="cell.appointmentCount > 0"
          class="calendar-day__dots"
          :title="`${cell.appointmentCount} appointment(s)`"
        >
          <span
            v-for="n in Math.min(cell.appointmentCount, 3)"
            :key="n"
            class="calendar-day__dot"
          />
        </span>
      </button>
    </div>

    <div
      v-if="selectedDayKey && showDayDetail"
      class="calendar-day-detail"
    >
      <h4 class="day-detail-title">{{ selectedDayTitle }}</h4>
      <ul class="day-detail-list">
        <li v-for="appt in selectedDayAppointments" :key="appt.id">
          <span class="day-detail-time">{{ formatAppointmentTime(appt.scheduledAt) }}</span>
          <span class="day-detail-provider">{{ providerDisplayName(appt) }}</span>
          <span class="day-detail-specialty">{{ appt.specialty }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  appointmentDayKey,
  appointmentsByDay,
  buildMonthGrid,
  formatAppointmentTime,
  providerDisplayName,
  shiftMonth,
} from '@/services/appointmentUtils'
import type { DoctorAppointment } from '@/models/types'

const props = withDefaults(
  defineProps<{
    appointments: DoctorAppointment[]
    /** Smaller grid for sidebar layout */
    compact?: boolean
  }>(),
  { compact: false }
)

const emit = defineEmits<{
  'select-day': [dayKey: string]
}>()

const viewMonth = ref(startOfCurrentMonth())
const selectedDayKey = ref(format(new Date(), 'yyyy-MM-dd'))

function startOfCurrentMonth(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weekdayLabelsCompact = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const weekdayLabelsDisplay = computed(() =>
  props.compact ? weekdayLabelsCompact : weekdayLabels
)

const showDayDetail = computed(
  () => !props.compact || selectedDayAppointments.value.length > 0
)

const byDay = computed(() => appointmentsByDay(props.appointments))

const cells = computed(() => buildMonthGrid(viewMonth.value, byDay.value))

const monthLabel = computed(() => format(viewMonth.value, 'MMMM yyyy'))

const selectedDayAppointments = computed(
  () => byDay.value.get(selectedDayKey.value) ?? []
)

const selectedDayTitle = computed(() => {
  const d = parseISO(`${selectedDayKey.value}T12:00:00`)
  if (Number.isNaN(d.getTime())) return selectedDayKey.value
  return props.compact
    ? format(d, 'MMM d')
    : format(d, 'EEEE, MMMM d, yyyy')
})

function selectDay(dayKey: string) {
  selectedDayKey.value = dayKey
  emit('select-day', dayKey)
}

function prevMonth() {
  viewMonth.value = shiftMonth(viewMonth.value, -1)
}

function nextMonth() {
  viewMonth.value = shiftMonth(viewMonth.value, 1)
}

function goToday() {
  const today = new Date()
  viewMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectedDayKey.value = format(today, 'yyyy-MM-dd')
  emit('select-day', selectedDayKey.value)
}

function dayAriaLabel(cell: { date: Date; appointmentCount: number }): string {
  const base = format(cell.date, 'MMMM d, yyyy')
  if (cell.appointmentCount === 0) return base
  return `${base}, ${cell.appointmentCount} appointment(s)`
}
</script>

<style scoped>
.appointment-calendar {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.calendar-month {
  flex: 1;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.cal-nav {
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.cal-nav:hover {
  border-color: var(--accent);
}

.cal-today {
  margin-left: 0.25rem;
  padding: 0.4rem 0.65rem;
  font-size: 0.8rem;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.cal-today:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 0.35rem;
}

.weekday {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-faint);
  padding: 0.25rem 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  min-height: 2.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--bg-muted);
  cursor: pointer;
  padding: 0.2rem;
  font-family: inherit;
}

.calendar-day--outside {
  opacity: 0.35;
}

.calendar-day--today {
  border-color: var(--accent);
}

.calendar-day--selected {
  background: color-mix(in srgb, var(--accent) 22%, var(--bg-muted));
  border-color: var(--accent);
}

.calendar-day--has-appts .calendar-day__num {
  font-weight: 700;
}

.calendar-day:hover:not(:disabled) {
  border-color: var(--border-strong);
}

.calendar-day__num {
  font-size: 0.85rem;
  color: var(--text-primary);
}

.calendar-day__dots {
  display: flex;
  gap: 3px;
  justify-content: center;
}

.calendar-day__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
}

.calendar-day-detail {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.day-detail-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.65rem;
  color: var(--text-primary);
}

.day-detail-empty {
  font-size: 0.875rem;
  color: var(--text-faint);
  margin: 0;
}

.day-detail-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.day-detail-list li {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  grid-template-rows: auto auto;
  gap: 0.15rem 0.75rem;
  font-size: 0.875rem;
}

.day-detail-time {
  grid-row: 1 / 3;
  font-weight: 600;
  color: var(--accent);
}

.day-detail-provider {
  font-weight: 500;
  color: var(--text-primary);
}

.day-detail-specialty {
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Compact sidebar layout */
.appointment-calendar--compact {
  padding: 0.85rem 0.65rem;
}

.appointment-calendar--compact .calendar-toolbar {
  margin-bottom: 0.65rem;
  gap: 0.35rem;
}

.appointment-calendar--compact .calendar-month {
  font-size: 1rem;
}

.appointment-calendar--compact .cal-nav {
  width: 2.1rem;
  height: 2.1rem;
  font-size: 1.15rem;
  border-radius: 5px;
}

.appointment-calendar--compact .cal-today {
  padding: 0.3rem 0.5rem;
  font-size: 0.75rem;
}

.appointment-calendar--compact .weekday {
  font-size: 0.72rem;
  padding: 0.15rem 0;
}

.appointment-calendar--compact .calendar-grid {
  gap: 3px;
}

.appointment-calendar--compact .calendar-day {
  aspect-ratio: auto;
  min-height: 0;
  height: 2.1rem;
  border-radius: 5px;
  padding: 0;
  gap: 0;
}

.appointment-calendar--compact .calendar-day__num {
  font-size: 0.85rem;
  line-height: 1;
}

.appointment-calendar--compact .calendar-day__dots {
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  gap: 2px;
}

.appointment-calendar--compact .calendar-day {
  position: relative;
}

.appointment-calendar--compact .calendar-day__dot {
  width: 4px;
  height: 4px;
}

.appointment-calendar--compact .calendar-day-detail {
  margin-top: 0.65rem;
  padding-top: 0.65rem;
}

.appointment-calendar--compact .day-detail-title {
  font-size: 0.85rem;
  margin-bottom: 0.45rem;
}

.appointment-calendar--compact .day-detail-list {
  gap: 0.45rem;
}

.appointment-calendar--compact .day-detail-list li {
  font-size: 0.8rem;
  grid-template-columns: 4rem 1fr;
}

.appointment-calendar--compact .day-detail-time {
  font-size: 0.8rem;
}
</style>
