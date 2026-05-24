<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="appointment-modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="dialogTitleId"
      @click.self="onOverlayClick"
    >
      <div
        class="appointment-modal-dialog"
        :class="{ 'appointment-modal-dialog--notes': doctorNotesView }"
      >
        <div class="appointment-modal-toolbar">
          <button
            v-if="doctorNotesView"
            type="button"
            class="appointment-modal-icon-btn appointment-modal-back"
            @click="emit('doctor-notes-back')"
          >
            <svg
              class="appointment-modal-back__svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ t('appointment.backToDetails') }}</span>
          </button>
          <template v-else>
            <button
              v-if="appointment && showDoctorNotes"
              type="button"
              class="appointment-modal-icon-btn appointment-modal-icon-btn--notes"
              :aria-label="t('dashboard.generateDoctorNotes')"
              :title="t('dashboard.generateDoctorNotes')"
              :disabled="doctorNotesDisabled || doctorNotesLoading"
              @click="emit('generate-doctor-notes')"
            >
              <svg
                class="appointment-modal-icon-btn__svg"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 4h8a2 2 0 012 2v14l-6-3-6 3V6a2 2 0 01-2-2z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 7v4M10 9h4"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </template>
          <button
            type="button"
            class="appointment-modal-icon-btn appointment-modal-close"
            :aria-label="t('common.close')"
            @click="close"
          >
            ×
          </button>
        </div>

        <div v-if="doctorNotesView" class="appointment-modal-notes">
          <header class="appointment-modal-notes__head">
            <h2 :id="dialogTitleId" class="appointment-modal-notes__title">
              {{ doctorNotesTitle ?? t('doctorNotes.clinicalTitle') }}
            </h2>
            <p v-if="appointment" class="appointment-modal-notes__context">
              {{ badgeHeadline }} · {{ dateTimeText }} · {{ appointment.specialty }}
            </p>
          </header>
          <DoctorNotesPanel
            class="appointment-modal-notes__panel"
            compact
            :content="doctorNotesContent"
            :loading="doctorNotesLoading"
            :intro="doctorNotesIntro"
            :generating-label="doctorNotesGeneratingLabel"
            show-specialty-selector
            :specialty="doctorNotesSpecialty"
            @update:specialty="emit('update:doctor-notes-specialty', $event)"
            @specialty-change="emit('doctor-notes-specialty-change', $event)"
          />
        </div>

        <div v-else-if="appointment" class="appointment-modal-content">
          <p class="appointment-modal-eyebrow">{{ t('appointment.eyebrow') }}</p>
          <h2 :id="dialogTitleId" class="appointment-modal-title">
            {{ badgeHeadline }}
          </h2>

          <div class="appointment-modal-when">
            <p class="appointment-modal-datetime">{{ dateTimeText }}</p>
          </div>

          <div class="appointment-modal-details">
            <div class="appointment-detail-row">
              <span class="appointment-detail-icon" aria-hidden="true">👨‍⚕️</span>
              <div>
                <p class="appointment-detail-label">{{ t('appointment.doctor') }}</p>
                <p class="appointment-detail-value">{{ providerLabel }}</p>
              </div>
            </div>
            <div class="appointment-detail-row">
              <span class="appointment-detail-icon" aria-hidden="true">🏥</span>
              <div>
                <p class="appointment-detail-label">{{ t('appointment.specialty') }}</p>
                <p class="appointment-detail-value">{{ appointment.specialty }}</p>
              </div>
            </div>
            <div class="appointment-detail-row">
              <span class="appointment-detail-icon" aria-hidden="true">📍</span>
              <div>
                <p class="appointment-detail-label">{{ t('appointment.location') }}</p>
                <p class="appointment-detail-value">{{ appointment.address }}</p>
              </div>
            </div>
          </div>

          <button
            v-if="showDoctorNotes"
            type="button"
            class="appointment-modal-notes-cta"
            :disabled="doctorNotesDisabled || doctorNotesLoading"
            @click="emit('generate-doctor-notes')"
          >
            {{ t('dashboard.generateDoctorNotes') }}
          </button>

          <router-link
            to="/appointments"
            class="appointment-modal-cta"
            @click="close"
          >
            {{ t('appointment.viewAll') }}
          </router-link>
        </div>

        <div v-else class="appointment-modal-empty">
          <p class="appointment-modal-eyebrow">{{ t('appointment.eyebrowEmpty') }}</p>
          <h2 :id="dialogTitleId" class="appointment-modal-title">
            {{ t('appointment.nothingScheduled') }}
          </h2>
          <p class="appointment-modal-empty-text">
            {{ t('appointment.emptyText') }}
          </p>
          <router-link
            to="/appointments"
            class="appointment-modal-cta"
            @click="close"
          >
            {{ t('appointment.goToAppointments') }}
          </router-link>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import { useI18n } from 'vue-i18n'
import { addDays, format, isSameDay, parseISO } from 'date-fns'
import DoctorNotesPanel from '@/components/DoctorNotesPanel.vue'
import {
  appointmentDaysUntil,
  providerDisplayName,
} from '@/services/appointmentUtils'
import { dateFnsLocaleFor } from '@/utils/dateLocale'
import type { AppLocale } from '@/i18n'
import type { DoctorAppointment } from '@/models/types'
import type { DoctorSpecialtyId } from '@/services/doctorSpecialty'

const props = withDefaults(
  defineProps<{
    open: boolean
    appointment: DoctorAppointment | null
    showDoctorNotes?: boolean
    doctorNotesDisabled?: boolean
    doctorNotesLoading?: boolean
    doctorNotesView?: boolean
    doctorNotesContent?: string
    doctorNotesSpecialty?: DoctorSpecialtyId
    doctorNotesTitle?: string
    doctorNotesIntro?: string
    doctorNotesGeneratingLabel?: string
  }>(),
  {
    showDoctorNotes: false,
    doctorNotesDisabled: false,
    doctorNotesLoading: false,
    doctorNotesView: false,
    doctorNotesContent: '',
    doctorNotesSpecialty: 'primary_care',
  }
)

const emit = defineEmits<{
  close: []
  'generate-doctor-notes': []
  'doctor-notes-back': []
  'update:doctor-notes-specialty': [value: DoctorSpecialtyId]
  'doctor-notes-specialty-change': [value: DoctorSpecialtyId]
}>()

const { t, locale } = useI18n()

const dialogTitleId = computed(() =>
  props.doctorNotesView ? 'appointment-doctor-notes-title' : 'upcoming-appointment-modal-title'
)

const providerLabel = computed(() =>
  props.appointment ? providerDisplayName(props.appointment) : ''
)

const badgeHeadline = computed(() => {
  if (!props.appointment) return ''
  const days = appointmentDaysUntil(props.appointment.scheduledAt)
  if (days === 0) return t('appointment.badgeToday')
  if (days === 1) return t('appointment.badgeTomorrow')
  return t('appointment.badgeInDays', { days })
})

const dateTimeText = computed(() => {
  if (!props.appointment) return ''
  const d = parseISO(props.appointment.scheduledAt)
  if (Number.isNaN(d.getTime())) return props.appointment.scheduledAt
  const now = new Date()
  const dfLocale = dateFnsLocaleFor(locale.value as AppLocale)
  const time = format(d, 'p', { locale: dfLocale })
  if (isSameDay(d, now)) {
    return t('appointment.datetimeToday', { time })
  }
  if (isSameDay(d, addDays(now, 1))) {
    return t('appointment.datetimeTomorrow', { time })
  }
  const date = format(d, 'EEE, MMM d', { locale: dfLocale })
  return t('appointment.datetimeDefault', { date, time })
})

function close() {
  emit('close')
}

function onOverlayClick() {
  if (props.doctorNotesView) {
    emit('doctor-notes-back')
    return
  }
  close()
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
  transition: max-width 0.2s ease;
}

.appointment-modal-dialog--notes {
  max-width: min(720px, 100%);
  max-height: 90vh;
}

.appointment-modal-toolbar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0.85rem 0.85rem 0;
  background: linear-gradient(
    to bottom,
    var(--bg-surface) 70%,
    color-mix(in srgb, var(--bg-surface) 85%, transparent)
  );
}

.appointment-modal-dialog--notes .appointment-modal-toolbar {
  justify-content: space-between;
}

.appointment-modal-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
}

.appointment-modal-back {
  width: auto;
  min-height: 2.25rem;
  padding: 0 0.65rem 0 0.45rem;
  gap: 0.2rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.appointment-modal-back:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.appointment-modal-back__svg {
  flex-shrink: 0;
}

.appointment-modal-icon-btn--notes {
  color: var(--accent-strong);
  border-color: color-mix(in srgb, var(--accent-strong) 38%, var(--border));
  background: color-mix(in srgb, var(--accent-strong) 12%, var(--bg-surface));
}

.appointment-modal-icon-btn--notes:hover:not(:disabled) {
  border-color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 20%, var(--bg-surface));
}

.appointment-modal-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.appointment-modal-icon-btn__svg {
  display: block;
}

.appointment-modal-close {
  margin-left: auto;
  font-size: 1.35rem;
  line-height: 1;
}

.appointment-modal-close:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.appointment-modal-notes {
  padding: 0 1.25rem 0.25rem;
}

.appointment-modal-notes__head {
  margin-bottom: 0.75rem;
  padding-right: 2.5rem;
}

.appointment-modal-notes__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
}

.appointment-modal-notes__context {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--text-muted);
}

.appointment-modal-content,
.appointment-modal-empty {
  padding: 0.5rem 1.5rem 0;
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
  margin-bottom: 1rem;
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

.appointment-modal-notes-cta {
  display: block;
  width: 100%;
  margin-bottom: 0.65rem;
  padding: 0.7rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 10%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, var(--accent-strong) 35%, var(--border));
  border-radius: 8px;
  cursor: pointer;
}

.appointment-modal-notes-cta:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent-strong) 18%, var(--bg-surface));
}

.appointment-modal-notes-cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
