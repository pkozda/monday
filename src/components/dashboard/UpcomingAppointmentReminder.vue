<template>
  <div v-if="appointment" class="appointment-reminder" role="status">
    <div class="appointment-reminder__icon" aria-hidden="true">📅</div>
    <div class="appointment-reminder__body">
      <p class="appointment-reminder__eyebrow">Next appointment</p>
      <p class="appointment-reminder__title">{{ providerLabel }}</p>
      <p class="appointment-reminder__meta">
        {{ leadText }} · {{ appointment.specialty }}
      </p>
      <p class="appointment-reminder__address">{{ appointment.address }}</p>
    </div>
    <router-link to="/appointments" class="appointment-reminder__link">
      View all
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  providerDisplayName,
  reminderLeadText,
} from '@/services/appointmentUtils'
import type { DoctorAppointment } from '@/models/types'

const props = defineProps<{
  appointment: DoctorAppointment | null
}>()

const providerLabel = computed(() =>
  props.appointment ? providerDisplayName(props.appointment) : ''
)

const leadText = computed(() =>
  props.appointment
    ? reminderLeadText(props.appointment.scheduledAt)
    : ''
)
</script>

<style scoped>
.appointment-reminder {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: color-mix(in srgb, var(--accent) 12%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--border));
  border-radius: 8px;
}

.appointment-reminder__icon {
  font-size: 1.5rem;
  line-height: 1;
  flex-shrink: 0;
}

.appointment-reminder__body {
  flex: 1;
  min-width: 0;
}

.appointment-reminder__eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  margin: 0 0 0.25rem;
}

.appointment-reminder__title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.appointment-reminder__meta {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
}

.appointment-reminder__address {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0.2rem 0 0;
}

.appointment-reminder__link {
  flex-shrink: 0;
  align-self: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;
  white-space: nowrap;
}

.appointment-reminder__link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .appointment-reminder {
    flex-wrap: wrap;
  }

  .appointment-reminder__link {
    width: 100%;
    text-align: right;
  }
}
</style>
