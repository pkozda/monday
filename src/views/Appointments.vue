<template>
  <div class="appointments-view">
    <div class="appointments-top">
      <PageHeader
        :eyebrow="t('appointmentsPage.eyebrow')"
        :title="t('appointmentsPage.title')"
        :subtitle="t('appointmentsPage.subtitle')"
      >
        <template #actions>
          <button type="button" class="btn-add-appointment" @click="addModalOpen = true">
            {{ t('appointmentsPage.addAppointment') }}
          </button>
        </template>
      </PageHeader>

      <div
        v-if="successMessage"
        class="page-banner page-banner--success success-banner"
        role="status"
      >
        {{ successMessage }}
      </div>
    </div>

    <NearbyDoctorSearchPanel class="appointments-nearby" />

    <div class="appointments-content">
      <aside class="appointments-column appointments-column--calendar" aria-label="Appointment calendar">
        <div class="appointments-column-header">
          <SectionHeader
            :title="t('appointmentsPage.calendarTitle')"
            :subtitle="t('appointmentsPage.calendarSubtitle')"
            class="column-header page-section-title"
          />
        </div>
        <div class="appointments-column-scroll">
          <AppointmentCalendar
            compact
            :appointments="appointments"
            @select-day="onSelectDay"
          />
        </div>
      </aside>

      <section class="appointments-column" aria-labelledby="upcoming-heading">
        <div class="appointments-column-header">
          <SectionHeader
            id="upcoming-heading"
            :title="t('appointmentsPage.upcomingTitle')"
            :subtitle="t('appointmentsPage.upcomingSubtitle')"
            class="column-header page-section-title"
          />
        </div>
        <div class="appointments-column-scroll" role="region" aria-label="Upcoming appointments">
          <div v-if="loading" class="loading">{{ t('appointmentsPage.loading') }}</div>
          <div v-else-if="upcoming.length === 0" class="empty-state">
            <p>{{ t('appointmentsPage.noUpcoming') }}</p>
            <button type="button" class="empty-cta" @click="addModalOpen = true">
              {{ t('appointmentsPage.addAppointment') }}
            </button>
          </div>
          <div v-else class="appointments-list">
            <AppointmentCard
              v-for="appt in upcoming"
              :key="appt.id"
              :appointment="appt"
              :removing="removingId === appt.id"
              @remove="onRemove"
            />
          </div>
        </div>
      </section>

      <section class="appointments-column" aria-labelledby="past-heading">
        <div class="appointments-column-header">
          <SectionHeader
            id="past-heading"
            :title="t('appointmentsPage.pastTitle')"
            :subtitle="t('appointmentsPage.pastSubtitle')"
            class="column-header page-section-title"
          />
        </div>
        <div class="appointments-column-scroll" role="region" aria-label="Past appointments">
          <div v-if="loading" class="loading">{{ t('appointmentsPage.loading') }}</div>
          <div v-else-if="past.length === 0" class="empty-state">
            <p>{{ t('appointmentsPage.noPast') }}</p>
          </div>
          <div v-else class="appointments-list">
            <AppointmentCard
              v-for="appt in past"
              :key="appt.id"
              :appointment="appt"
              :removing="removingId === appt.id"
              @remove="onRemove"
            />
          </div>
        </div>
      </section>
    </div>

    <AppointmentFormModal
      :open="addModalOpen"
      @close="addModalOpen = false"
      @submitted="onAppointmentSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'

const { t } = useI18n()
import SectionHeader from '@/components/SectionHeader.vue'
import AppointmentFormModal from '@/components/AppointmentFormModal.vue'
import AppointmentCard from '@/components/AppointmentCard.vue'
import AppointmentCalendar from '@/components/AppointmentCalendar.vue'
import NearbyDoctorSearchPanel from '@/components/appointments/NearbyDoctorSearchPanel.vue'
import {
  deleteAppointment,
  getAppointments,
} from '@/api/appointmentsApi'
import { splitAppointments } from '@/services/appointmentUtils'
import type { DoctorAppointment } from '@/models/types'

const loading = ref(true)
const addModalOpen = ref(false)
const appointments = ref<DoctorAppointment[]>([])
const successMessage = ref('')
const removingId = ref<string | null>(null)

const upcoming = computed(
  () => splitAppointments(appointments.value).upcoming
)
const past = computed(() => splitAppointments(appointments.value).past)

onMounted(() => {
  void loadAppointments()
})

async function loadAppointments() {
  loading.value = true
  try {
    appointments.value = await getAppointments()
  } finally {
    loading.value = false
  }
}

function onAppointmentSubmitted(appt: DoctorAppointment) {
  appointments.value = [
    appt,
    ...appointments.value.filter((a) => a.id !== appt.id),
  ]
  successMessage.value = t('appointmentsPage.saved', {
    doctor: appt.doctorName,
    specialty: appt.specialty,
  })
  window.setTimeout(() => {
    successMessage.value = ''
  }, 6000)
}

function onSelectDay(_dayKey: string) {
  /* calendar handles selection UI */
}

async function onRemove(id: string) {
  removingId.value = id
  try {
    await deleteAppointment(id)
    appointments.value = appointments.value.filter((a) => a.id !== id)
  } finally {
    removingId.value = null
  }
}
</script>

<style scoped>
.appointments-view {
  --appointments-grid-cols: minmax(260px, 300px) minmax(0, 1fr) minmax(0, 1fr);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 2rem 2rem;
  width: 100%;
  box-sizing: border-box;
}

.appointments-top {
  flex-shrink: 0;
}

.appointments-top :deep(.page-header) {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: none;
}

.success-banner {
  margin: 0;
}

.appointments-nearby {
  flex-shrink: 0;
  margin-top: 0.5rem;
}

.btn-add-appointment {
  flex-shrink: 0;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 6px;
  background: var(--accent-strong);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.btn-add-appointment:hover {
  background: var(--accent-hover);
}

.appointments-content {
  display: grid;
  grid-template-columns: var(--appointments-grid-cols);
  gap: 1.25rem;
  margin-top: 0.75rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border);
}

.appointments-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.appointments-column-header {
  flex-shrink: 0;
  padding-bottom: 0.5rem;
}

.appointments-column-scroll {
  padding-right: 0.35rem;
}

.column-header :deep(.section-header) {
  margin-bottom: 0;
}

.column-header :deep(.section-title) {
  font-size: 1.1rem;
  margin-bottom: 0.2rem;
}

.column-header :deep(.section-subtitle) {
  font-size: 0.8rem;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading,
.empty-state {
  color: var(--text-faint);
  font-size: 0.85rem;
  padding: 0.5rem 0;
}

.empty-cta {
  margin-top: 0.65rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--bg-muted);
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.empty-cta:hover {
  border-color: var(--accent);
  background: var(--bg-surface);
}

@media (max-width: 960px) {
  .appointments-content {
    grid-template-columns: 1fr;
  }

  .appointments-column--calendar {
    max-width: 360px;
  }
}

@media (max-width: 600px) {
  .appointments-view {
    padding: 1rem 1rem 2rem;
  }

  .btn-add-appointment {
    width: 100%;
  }
}
</style>
