<template>
  <div class="patient-card">
    <div class="patient-header">
      <div class="patient-avatar" aria-hidden="true">{{ initials }}</div>
      <div class="patient-info">
        <h2 class="patient-name">{{ profile.displayName }}</h2>
        <p v-if="ageLabel" class="patient-meta">{{ ageLabel }}</p>
        <p v-if="weightSummary.currentLabel" class="patient-weight">
          <span class="patient-weight__label">Current weight</span>
          <span class="patient-weight__value">{{ weightSummary.currentLabel }}</span>
          <span
            v-if="weightSummary.trend"
            class="patient-weight__arrow"
            :class="`patient-weight__arrow--${weightSummary.trend}`"
            :title="weightTrendTitle"
            :aria-label="weightTrendTitle"
          >
            {{ weightArrow }}
          </span>
          <span v-if="weightDeltaText" class="patient-weight__delta">
            {{ weightDeltaText }}
          </span>
        </p>
        <p v-if="trackingLabel" class="patient-meta">{{ trackingLabel }}</p>
      </div>
      <div class="patient-actions">
        <button
          type="button"
          class="profile-icon-btn profile-icon-btn--appointment"
          aria-label="Next appointment"
          :title="appointmentTitle"
          @click="appointmentOpen = true"
        >
          <svg
            class="profile-icon-btn__svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM7 15h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
            />
          </svg>
          <span
            v-if="nearestAppointment"
            class="profile-icon-badge profile-icon-badge--dot"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="profile-icon-btn profile-icon-btn--recommendations"
          aria-label="Recommendations for you"
          :title="recommendationsTitle"
          @click="recommendationsOpen = true"
        >
          <svg
            class="profile-icon-btn__svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"
            />
          </svg>
          <span
            v-if="recommendations.length"
            class="profile-icon-badge"
          >
            {{ recommendationsBadgeText }}
          </span>
        </button>
        <button
          type="button"
          class="profile-icon-btn profile-icon-btn--history"
          aria-label="Add health history"
          title="Add health history (anamnesis)"
          @click="anamnesisOpen = true"
        >
          <svg
            class="profile-icon-btn__svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2z"
            />
          </svg>
        </button>
        <button type="button" class="edit-toggle" @click="editing = !editing">
          {{ editing ? 'Cancel' : 'Edit profile' }}
        </button>
      </div>
    </div>

    <AnamnesisModal
      :open="anamnesisOpen"
      @close="anamnesisOpen = false"
      @imported="onAnamnesisImported"
    />

    <UpcomingAppointmentModal
      :open="appointmentOpen"
      :appointment="nearestAppointment"
      @close="appointmentOpen = false"
    />

    <HealthRecommendationsModal
      :open="recommendationsOpen"
      :recommendations="recommendations"
      @close="recommendationsOpen = false"
    />

    <form v-if="editing" class="patient-form" @submit.prevent="save">
      <div class="form-row">
        <label for="displayName">Display name</label>
        <input id="displayName" v-model="draft.displayName" type="text" required />
      </div>
      <div class="form-row">
        <label for="dateOfBirth">Date of birth</label>
        <input id="dateOfBirth" v-model="draft.dateOfBirth" type="date" />
      </div>
      <div class="form-row">
        <label for="biologicalSex">Biological sex</label>
        <select id="biologicalSex" v-model="draft.biologicalSex">
          <option value="">Not specified</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
      <div class="form-row">
        <label for="bloodType">Blood type</label>
        <input
          id="bloodType"
          v-model="draft.bloodType"
          type="text"
          placeholder="e.g. A+"
        />
      </div>
      <button type="submit" class="save-btn" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save profile' }}
      </button>
    </form>

    <dl v-else class="patient-details">
      <div v-if="profile.dateOfBirth" class="detail">
        <dt>Date of birth</dt>
        <dd>{{ formattedDob }}</dd>
      </div>
      <div v-if="profile.biologicalSex" class="detail">
        <dt>Biological sex</dt>
        <dd>{{ sexLabel }}</dd>
      </div>
      <div v-if="profile.bloodType" class="detail">
        <dt>Blood type</dt>
        <dd>{{ profile.bloodType }}</dd>
      </div>
      <div v-if="weightSummary.currentLabel" class="detail">
        <dt>Current weight</dt>
        <dd class="detail-weight">
          {{ weightSummary.currentLabel }}
          <span
            v-if="weightSummary.trend"
            class="patient-weight__arrow patient-weight__arrow--inline"
            :class="`patient-weight__arrow--${weightSummary.trend}`"
            :title="weightTrendTitle"
          >
            {{ weightArrow }}
          </span>
        </dd>
      </div>
      <div class="detail">
        <dt>Profile created</dt>
        <dd>{{ formattedCreated }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { format, parseISO, differenceInYears } from 'date-fns'
import { savePatientProfile } from '@/api/patientApi'
import AnamnesisModal from '@/components/dashboard/AnamnesisModal.vue'
import HealthRecommendationsModal from '@/components/dashboard/HealthRecommendationsModal.vue'
import UpcomingAppointmentModal from '@/components/dashboard/UpcomingAppointmentModal.vue'
import { formatFriendlyDayCount } from '@/services/formatDuration'
import { summarizeWeightTrend } from '@/services/weightTrend'
import type {
  BiologicalSex,
  DoctorAppointment,
  HealthEntry,
  HealthRecommendation,
  PatientProfile,
} from '@/models/types'

const props = defineProps<{
  profile: PatientProfile
  journalEntries: HealthEntry[]
  trackingSince: string | null
  daysTracked: number
  recommendations: HealthRecommendation[]
  nearestAppointment: DoctorAppointment | null
}>()

const emit = defineEmits<{
  updated: [profile: PatientProfile]
  journalImported: [count: number]
}>()

const editing = ref(false)
const saving = ref(false)
const anamnesisOpen = ref(false)
const appointmentOpen = ref(false)
const recommendationsOpen = ref(false)

const appointmentTitle = computed(() =>
  props.nearestAppointment
    ? 'Next appointment — click to view'
    : 'Appointments — none upcoming'
)

const recommendationsTitle = computed(() => {
  const n = props.recommendations.length
  if (n === 0) return 'Recommendations for you'
  return `Recommendations for you (${n})`
})

const recommendationsBadgeText = computed(() => {
  const n = props.recommendations.length
  return n > 9 ? '9+' : String(n)
})

function onAnamnesisImported(count: number) {
  emit('journalImported', count)
}

const draft = reactive({
  displayName: '',
  dateOfBirth: '',
  biologicalSex: '' as BiologicalSex | '',
  bloodType: '',
})

watch(
  () => props.profile,
  (p) => {
    draft.displayName = p.displayName
    draft.dateOfBirth = p.dateOfBirth ?? ''
    draft.biologicalSex = p.biologicalSex ?? ''
    draft.bloodType = p.bloodType ?? ''
  },
  { immediate: true }
)

const initials = computed(() => {
  const parts = props.profile.displayName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return props.profile.displayName.slice(0, 2).toUpperCase() || '?'
})

const ageLabel = computed(() => {
  if (!props.profile.dateOfBirth) return null
  const years = differenceInYears(new Date(), parseISO(props.profile.dateOfBirth))
  return `${years} years old`
})

const weightSummary = computed(() =>
  summarizeWeightTrend(props.journalEntries)
)

const weightArrow = computed(() => {
  switch (weightSummary.value.trend) {
    case 'down':
      return '↓'
    case 'up':
      return '↑'
    case 'flat':
      return '→'
    default:
      return ''
  }
})

const weightDeltaText = computed(() => {
  const delta = weightSummary.value.deltaKg
  if (delta === null || weightSummary.value.trend === null) return null
  const abs = Math.abs(delta)
  const formatted = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  if (weightSummary.value.trend === 'down') {
    return `−${formatted} kg vs last log`
  }
  if (weightSummary.value.trend === 'up') {
    return `+${formatted} kg vs last log`
  }
  return 'unchanged vs last log'
})

const weightTrendTitle = computed(() => {
  const { trend, previousLabel, previousDate } = weightSummary.value
  if (!trend || !previousLabel) return ''
  const date = previousDate
    ? format(parseISO(previousDate), 'MMM d, yyyy')
    : 'previous entry'
  if (trend === 'down') {
    return `Down from ${previousLabel} (${date})`
  }
  if (trend === 'up') {
    return `Up from ${previousLabel} (${date})`
  }
  return `Same as ${previousLabel} (${date})`
})

const trackingLabel = computed(() => {
  if (!props.trackingSince) {
    return 'Start your health journal to begin tracking'
  }
  const span = formatFriendlyDayCount(props.daysTracked)
  const since = format(parseISO(props.trackingSince), 'MMM d, yyyy')
  return `Health journal spans ${span} · records since ${since}`
})

const formattedDob = computed(() =>
  props.profile.dateOfBirth
    ? format(parseISO(props.profile.dateOfBirth), 'MMMM d, yyyy')
    : ''
)

const formattedCreated = computed(() =>
  format(parseISO(props.profile.createdAt), 'MMMM d, yyyy')
)

const sexLabel = computed(() => {
  const map: Record<BiologicalSex, string> = {
    female: 'Female',
    male: 'Male',
    other: 'Other',
    prefer_not_to_say: 'Prefer not to say',
  }
  return props.profile.biologicalSex
    ? map[props.profile.biologicalSex]
    : ''
})

async function save() {
  saving.value = true
  try {
    const updated = await savePatientProfile({
      displayName: draft.displayName.trim(),
      dateOfBirth: draft.dateOfBirth || undefined,
      biologicalSex: draft.biologicalSex || undefined,
      bloodType: draft.bloodType.trim() || undefined,
    })
    emit('updated', updated)
    editing.value = false
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.patient-card {
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-surface) 100%);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
}

.patient-header {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.patient-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-strong);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}

.patient-info {
  flex: 1;
  min-width: 180px;
}

.patient-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.35rem;
  color: var(--text-primary);
}

.patient-meta {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.patient-weight {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.5rem;
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
}

.patient-weight__label {
  color: var(--text-faint);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.patient-weight__value {
  font-weight: 600;
  color: var(--text-primary);
}

.patient-weight__arrow {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1;
}

.patient-weight__arrow--inline {
  margin-left: 0.35rem;
}

.patient-weight__arrow--down {
  color: #2e7d32;
}

.patient-weight__arrow--up {
  color: #c62828;
}

.patient-weight__arrow--flat {
  color: var(--text-faint);
}

[data-theme='dark'] .patient-weight__arrow--down {
  color: #66bb6a;
}

[data-theme='dark'] .patient-weight__arrow--up {
  color: #ef5350;
}

.patient-weight__delta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.detail-weight {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.patient-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.profile-icon-btn {
  --profile-btn-fg: var(--accent-strong);
  --profile-btn-bg: color-mix(in srgb, var(--accent-strong) 12%, var(--bg-surface));
  --profile-btn-border: color-mix(in srgb, var(--accent-strong) 38%, var(--border));
  --profile-btn-badge: var(--accent-strong);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid var(--profile-btn-border);
  border-radius: 8px;
  background: var(--profile-btn-bg);
  color: var(--profile-btn-fg);
  cursor: pointer;
  font-family: inherit;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;
}

.profile-icon-btn--appointment {
  --profile-btn-fg: var(--accent-strong);
  --profile-btn-bg: color-mix(in srgb, var(--accent-strong) 14%, var(--bg-surface));
  --profile-btn-border: color-mix(in srgb, var(--accent-strong) 42%, var(--border));
  --profile-btn-badge: var(--accent-strong);
}

.profile-icon-btn--recommendations {
  --profile-btn-fg: #2e7d32;
  --profile-btn-bg: color-mix(in srgb, #2e7d32 14%, var(--bg-surface));
  --profile-btn-border: color-mix(in srgb, #2e7d32 40%, var(--border));
  --profile-btn-badge: #388e3c;
}

[data-theme='dark'] .profile-icon-btn--recommendations {
  --profile-btn-fg: #81c784;
  --profile-btn-bg: color-mix(in srgb, #81c784 16%, var(--bg-surface));
  --profile-btn-border: color-mix(in srgb, #81c784 38%, var(--border));
  --profile-btn-badge: #66bb6a;
}

.profile-icon-btn--history {
  --profile-btn-fg: #6a1b9a;
  --profile-btn-bg: color-mix(in srgb, #6a1b9a 12%, var(--bg-surface));
  --profile-btn-border: color-mix(in srgb, #6a1b9a 38%, var(--border));
  --profile-btn-badge: #7b1fa2;
}

[data-theme='dark'] .profile-icon-btn--history {
  --profile-btn-fg: #ce93d8;
  --profile-btn-bg: color-mix(in srgb, #ce93d8 14%, var(--bg-surface));
  --profile-btn-border: color-mix(in srgb, #ce93d8 36%, var(--border));
  --profile-btn-badge: #ba68c8;
}

.profile-icon-btn:hover {
  filter: brightness(1.06);
  border-color: var(--profile-btn-fg);
}

.profile-icon-btn:focus-visible {
  outline: 2px solid var(--profile-btn-fg);
  outline-offset: 2px;
}

.profile-icon-btn__svg {
  display: block;
}

.profile-icon-badge {
  position: absolute;
  top: -0.35rem;
  right: -0.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 1.125rem;
  height: 1.125rem;
  padding: 0;
  border-radius: 50%;
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: #fff;
  background: var(--profile-btn-badge, var(--accent-strong));
  border: 2px solid var(--bg-surface);
}

.profile-icon-badge--dot {
  min-width: 0.55rem;
  width: 0.55rem;
  height: 0.55rem;
  padding: 0;
  top: -0.15rem;
  right: -0.15rem;
}

.edit-toggle {
  background: transparent;
  border: 1px solid #555;
  color: var(--text-secondary);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
}

.edit-toggle:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.patient-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0 0;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}

.detail dt {
  font-size: 0.75rem;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
}

.detail dd {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.patient-form {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
  display: grid;
  gap: 1rem;
}

.form-row label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.form-row input,
.form-row select {
  width: 100%;
  padding: 0.5rem 0.65rem;
  background: var(--bg-input);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: inherit;
}

.save-btn {
  justify-self: start;
  background: var(--accent-strong);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
}

.save-btn:disabled {
  opacity: 0.6;
}
</style>
