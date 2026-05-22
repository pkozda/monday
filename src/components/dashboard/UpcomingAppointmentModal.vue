<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="appointment-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upcoming-appointment-modal-title"
      @click.self="close"
    >
      <div class="appointment-modal-dialog">
        <button
          type="button"
          class="appointment-modal-close"
          aria-label="Close"
          @click="close"
        >
          ×
        </button>

        <div v-if="appointment && schedule" class="appointment-modal-content">
          <p class="appointment-modal-eyebrow">Next appointment</p>
          <h2 id="upcoming-appointment-modal-title" class="appointment-modal-title">
            {{ schedule.badgeHeadline }}
          </h2>

          <div class="appointment-modal-when">
            <p class="appointment-modal-datetime">{{ schedule.dateTimeText }}</p>
          </div>

          <div class="appointment-modal-details">
            <div class="appointment-detail-row">
              <span class="appointment-detail-icon" aria-hidden="true">👨‍⚕️</span>
              <div>
                <p class="appointment-detail-label">Doctor</p>
                <p class="appointment-detail-value">{{ providerLabel }}</p>
              </div>
            </div>
            <div class="appointment-detail-row">
              <span class="appointment-detail-icon" aria-hidden="true">🏥</span>
              <div>
                <p class="appointment-detail-label">Specialty</p>
                <p class="appointment-detail-value">{{ appointment.specialty }}</p>
              </div>
            </div>
            <div class="appointment-detail-row">
              <span class="appointment-detail-icon" aria-hidden="true">📍</span>
              <div>
                <p class="appointment-detail-label">Location</p>
                <p class="appointment-detail-value">{{ appointment.address }}</p>
              </div>
            </div>
          </div>

          <router-link
            to="/appointments"
            class="appointment-modal-cta"
            @click="close"
          >
            View all appointments
          </router-link>
        </div>

        <div v-else class="appointment-modal-empty">
          <p class="appointment-modal-eyebrow">Appointments</p>
          <h2 id="upcoming-appointment-modal-title" class="appointment-modal-title">
            Nothing scheduled
          </h2>
          <p class="appointment-modal-empty-text">
            You do not have an upcoming visit on your calendar yet.
          </p>
          <router-link
            to="/appointments"
            class="appointment-modal-cta"
            @click="close"
          >
            Go to Appointments
          </router-link>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  appointmentScheduleSummary,
  providerDisplayName,
} from '@/services/appointmentUtils'
import type { DoctorAppointment } from '@/models/types'

const props = defineProps<{
  open: boolean
  appointment: DoctorAppointment | null
}>()

const emit = defineEmits<{
  close: []
}>()

const providerLabel = computed(() =>
  props.appointment ? providerDisplayName(props.appointment) : ''
)

const schedule = computed(() =>
  props.appointment
    ? appointmentScheduleSummary(props.appointment.scheduledAt)
    : null
)

function close() {
  emit('close')
}
</script>

<style scoped>
.appointment-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
}

.appointment-modal-dialog {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: min(90vh, 640px);
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 0 0 1.5rem;
  box-shadow: 0 20px 56px var(--shadow);
}

.appointment-modal-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 2;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 2rem;
  height: 2rem;
  font-size: 1.35rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.appointment-modal-close:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.appointment-modal-content,
.appointment-modal-empty {
  padding: 2.75rem 1.5rem 0;
  text-align: center;
}

.appointment-modal-eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-strong);
}

.appointment-modal-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.appointment-modal-when {
  margin: 1rem 0 1.25rem;
  padding: 0.85rem 1rem;
  background: color-mix(in srgb, var(--accent-strong) 10%, var(--bg-muted));
  border: 1px solid color-mix(in srgb, var(--accent-strong) 28%, var(--border));
  border-radius: 10px;
}

.appointment-modal-datetime {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.35;
}

.appointment-modal-details {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.appointment-detail-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem 0.85rem;
  background: var(--bg-muted);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.appointment-detail-icon {
  font-size: 1.15rem;
  line-height: 1.4;
  flex-shrink: 0;
}

.appointment-detail-label {
  margin: 0 0 0.15rem;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
}

.appointment-detail-value {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.appointment-modal-cta {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  background: var(--accent-strong);
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.appointment-modal-cta:hover {
  background: var(--accent-hover);
}

.appointment-modal-empty-text {
  margin: 0.5rem 0 1.25rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
