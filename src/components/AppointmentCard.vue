<template>
  <article class="appointment-card" :class="{ 'appointment-card--past': isPast }">
    <div class="appointment-card__head">
      <div>
        <h3 class="appointment-card__provider">{{ providerLabel }}</h3>
        <p class="appointment-card__specialty">{{ appointment.specialty }}</p>
        <p v-if="appointment.source === 'journal'" class="appointment-card__source">
          From health journal
        </p>
      </div>
      <span class="appointment-card__badge" :class="badgeClass">
        {{ badgeText }}
      </span>
    </div>
    <p class="appointment-card__when">{{ whenLabel }}</p>
    <p class="appointment-card__address">{{ appointment.address }}</p>
    <p v-if="appointment.notes" class="appointment-card__notes">{{ appointment.notes }}</p>
    <button
      type="button"
      class="appointment-card__remove"
      :disabled="removing"
      @click="emit('remove', appointment.id)"
    >
      {{ removing ? 'Removing…' : 'Remove' }}
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  formatAppointmentDateTime,
  isUpcomingAppointment,
  providerDisplayName,
} from '@/services/appointmentUtils'
import type { DoctorAppointment } from '@/models/types'

const props = defineProps<{
  appointment: DoctorAppointment
  removing?: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const isPast = computed(() => !isUpcomingAppointment(props.appointment))

const providerLabel = computed(() =>
  providerDisplayName(props.appointment)
)

const whenLabel = computed(() =>
  formatAppointmentDateTime(props.appointment.scheduledAt)
)

const badgeText = computed(() => (isPast.value ? 'Past' : 'Upcoming'))

const badgeClass = computed(() =>
  isPast.value ? 'appointment-card__badge--past' : 'appointment-card__badge--upcoming'
)
</script>

<style scoped>
.appointment-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.appointment-card--past {
  opacity: 0.92;
}

.appointment-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.appointment-card__provider {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.appointment-card__specialty {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0.2rem 0 0;
}

.appointment-card__source {
  font-size: 0.75rem;
  color: var(--text-faint);
  margin: 0.25rem 0 0;
  font-style: italic;
}

.appointment-card__badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}

.appointment-card__badge--upcoming {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent);
}

.appointment-card__badge--past {
  background: var(--bg-muted);
  color: var(--text-faint);
}

.appointment-card__when {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 0.35rem;
}

.appointment-card__address {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.appointment-card__notes {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.75rem 0 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.appointment-card__remove {
  margin-top: 1rem;
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
}

.appointment-card__remove:hover:not(:disabled) {
  color: var(--danger, #c62828);
}

.appointment-card__remove:disabled {
  cursor: not-allowed;
}
</style>
