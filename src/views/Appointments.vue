<template>
  <div class="appointments-view">
    <div class="appointments-top">
      <PageHeader
        eyebrow="Scheduling"
        title="Doctor appointments"
        subtitle="Calendar plus upcoming and past visits."
      >
        <template #actions>
          <button type="button" class="btn-add-appointment" @click="addModalOpen = true">
            Add appointment
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

    <div class="appointments-content">
      <aside class="appointments-column appointments-column--calendar" aria-label="Appointment calendar">
        <div class="appointments-column-header">
          <SectionHeader
            title="Calendar"
            subtitle="Tap a day to see visits on that date."
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
            title="Upcoming"
            subtitle="Soonest first."
            class="column-header page-section-title"
          />
        </div>
        <div class="appointments-column-scroll" role="region" aria-label="Upcoming appointments">
          <div v-if="loading" class="loading">Loading…</div>
          <div v-else-if="upcoming.length === 0" class="empty-state">
            <p>No upcoming appointments.</p>
            <button type="button" class="empty-cta" @click="addModalOpen = true">
              Add appointment
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
            title="Past visits"
            subtitle="Newest first."
            class="column-header page-section-title"
          />
        </div>
        <div class="appointments-column-scroll" role="region" aria-label="Past appointments">
          <div v-if="loading" class="loading">Loading…</div>
          <div v-else-if="past.length === 0" class="empty-state">
            <p>No past appointments yet.</p>
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
import PageHeader from '@/components/PageHeader.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import AppointmentFormModal from '@/components/AppointmentFormModal.vue'
import AppointmentCard from '@/components/AppointmentCard.vue'
import AppointmentCalendar from '@/components/AppointmentCalendar.vue'
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
  successMessage.value = `Appointment saved — ${appt.doctorName}, ${appt.specialty}.`
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
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 2rem 1rem;
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
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  grid-template-columns: var(--appointments-grid-cols);
  gap: 1.25rem;
  overflow: hidden;
  margin-top: 0.75rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border);
}

.appointments-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.appointments-column-header {
  flex-shrink: 0;
  padding-bottom: 0.5rem;
}

.appointments-column-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.35rem;
  scrollbar-gutter: stable;
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
  .appointments-view {
    height: auto;
    overflow: visible;
    flex: none;
    padding-bottom: 2rem;
  }

  .appointments-top {
    position: sticky;
    top: 5.5rem;
    z-index: 35;
    padding-bottom: 0.35rem;
    margin-bottom: 0.25rem;
  }

  .appointments-content {
    display: flex;
    flex-direction: column;
    flex: none;
    gap: 1.25rem;
    overflow: visible;
    border-top: none;
    padding-top: 0;
  }

  .appointments-column {
    min-height: 0;
    overflow: hidden;
    max-height: none;
  }

  .appointments-column-header {
    position: sticky;
    top: 5.5rem;
    z-index: 30;
    background: var(--bg-page);
    padding-top: 0.25rem;
    padding-bottom: 0.5rem;
  }

  .appointments-column-scroll {
    flex: 1;
    max-height: 20rem;
  }

  .appointments-column--calendar {
    max-width: 360px;
  }
}

@media (max-width: 600px) {
  .appointments-view {
    padding: 1rem;
  }

  .btn-add-appointment {
    width: 100%;
  }

  .appointments-column {
    max-width: 100%;
  }

  .appointments-column-scroll {
    max-height: 18rem;
  }
}
</style>
