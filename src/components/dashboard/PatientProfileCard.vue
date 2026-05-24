<template>
  <div class="patient-card">
    <div class="patient-header">
      <div class="patient-avatar" aria-hidden="true">{{ initials }}</div>
      <div class="patient-info">
        <h2 class="patient-name">{{ profile.displayName }}</h2>
        <div v-if="headerChips.length" class="patient-chips">
          <span
            v-for="chip in headerChips"
            :key="chip.id"
            class="patient-chip"
            :class="chip.chipClass"
          >
            <ProfileFieldIcon :name="chip.icon" :size="13" />
            <span class="patient-chip__text">{{ chip.text }}</span>
            <span
              v-if="chip.trend"
              class="patient-chip__trend"
              :class="`patient-chip__trend--${chip.trend}`"
              :title="chip.trendTitle"
              :aria-label="chip.trendTitle"
            >
              {{ weightArrowFor(chip.trend) }}
            </span>
          </span>
        </div>
        <p v-if="trackingLabel" class="patient-tracking">
          <ProfileFieldIcon name="journal" :size="13" class="patient-tracking__icon" />
          <span>{{ trackingLabel }}</span>
        </p>
      </div>
      <div class="patient-actions">
        <button
          type="button"
          class="profile-icon-btn profile-icon-btn--appointment"
          :aria-label="t('profile.appointmentTitle')"
          :title="appointmentTitle"
          @click="appointmentOpen = true"
        >
          <svg
            class="profile-icon-btn__svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
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
          :aria-label="t('profile.recommendationsTitle')"
          :title="recommendationsTitle"
          @click="recommendationsOpen = true"
        >
          <svg
            class="profile-icon-btn__svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 2.5l2.35 6.85H21.4l-5.75 4.15 2.2 6.85L12 16.9 6.15 20.35l2.2-6.85L2.6 9.35h7.05L12 2.5z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="profile-icon-btn profile-icon-btn--history"
          :aria-label="t('profile.addHealthHistory')"
          :title="t('profile.addHealthHistoryHint')"
          @click="anamnesisOpen = true"
        >
          <svg
            class="profile-icon-btn__svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2z"
            />
          </svg>
        </button>
        <button type="button" class="edit-toggle" @click="editing = !editing">
          <ProfileFieldIcon v-if="!editing" name="pencil" :size="14" />
          <span>{{ editing ? t('profile.cancelEdit') : t('profile.editProfile') }}</span>
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
      :show-doctor-notes="showAppointmentDoctorNotes"
      :doctor-notes-disabled="appointmentDoctorNotesDisabled"
      :doctor-notes-loading="appointmentDoctorNotesLoading"
      :doctor-notes-view="appointmentDoctorNotesView"
      :doctor-notes-content="appointmentDoctorNotesContent"
      :doctor-notes-specialty="appointmentDoctorNotesSpecialty"
      :doctor-notes-title="appointmentDoctorNotesTitle"
      :doctor-notes-intro="appointmentDoctorNotesIntro"
      :doctor-notes-generating-label="appointmentDoctorNotesGeneratingLabel"
      @close="onAppointmentModalClose"
      @generate-doctor-notes="onAppointmentDoctorNotes"
      @doctor-notes-back="emit('appointment-doctor-notes-back')"
      @update:doctor-notes-specialty="onAppointmentDoctorNotesSpecialtyUpdate"
      @doctor-notes-specialty-change="emit('appointment-doctor-notes-specialty-change', $event)"
    />

    <HealthRecommendationsModal
      :open="recommendationsOpen"
      :recommendations="recommendations"
      @close="recommendationsOpen = false"
    />

    <form v-if="editing" class="patient-form" @submit.prevent="save">
      <div class="form-row">
        <label for="displayName">{{ t('profile.displayName') }}</label>
        <input id="displayName" v-model="draft.displayName" type="text" required />
      </div>
      <div class="form-row">
        <label for="dateOfBirth">{{ t('profile.dateOfBirth') }}</label>
        <input id="dateOfBirth" v-model="draft.dateOfBirth" type="date" />
      </div>
      <div class="form-row">
        <label for="biologicalSex">{{ t('profile.biologicalSex') }}</label>
        <select id="biologicalSex" v-model="draft.biologicalSex">
          <option value="">{{ t('profile.sexNotSpecified') }}</option>
          <option value="female">{{ t('profile.sexFemale') }}</option>
          <option value="male">{{ t('profile.sexMale') }}</option>
          <option value="other">{{ t('profile.sexOther') }}</option>
          <option value="prefer_not_to_say">{{ t('profile.sexPreferNot') }}</option>
        </select>
      </div>
      <div class="form-row">
        <label for="bloodType">{{ t('profile.bloodType') }}</label>
        <input
          id="bloodType"
          v-model="draft.bloodType"
          type="text"
          placeholder="e.g. A+"
        />
      </div>
      <div class="form-row form-row--pair">
        <div class="form-row__cell">
          <label for="heightCm">{{ t('profile.height') }}</label>
          <input
            id="heightCm"
            v-model="draft.heightCm"
            type="number"
            inputmode="decimal"
            min="50"
            max="250"
            step="1"
            :placeholder="t('profile.heightPlaceholder')"
          />
        </div>
        <div class="form-row__cell">
          <label for="weightKg">{{ t('profile.weight') }}</label>
          <input
            id="weightKg"
            v-model="draft.weightKg"
            type="number"
            inputmode="decimal"
            min="20"
            max="400"
            step="0.1"
            :placeholder="t('profile.weightPlaceholder')"
          />
        </div>
      </div>
      <button type="submit" class="save-btn" :disabled="saving">
        {{ saving ? t('common.saving') : t('profile.saveProfile') }}
      </button>
    </form>

    <div v-else class="patient-details">
      <div
        v-if="showDemographicsRow"
        class="patient-details__row patient-details__row--triple"
      >
        <ProfileDetailTile
          v-if="profile.dateOfBirth"
          :label="t('profile.dateOfBirth')"
          :value="formattedDob"
          icon="calendar"
          tone="accent"
          variant="surface"
        />
        <ProfileDetailTile
          v-if="profile.biologicalSex"
          :label="t('profile.sexLabel')"
          :value="sexLabel"
          icon="user"
          tone="violet"
          variant="surface"
        />
        <ProfileDetailTile
          v-if="profile.bloodType"
          :label="t('profile.bloodType')"
          :value="profile.bloodType"
          icon="droplet"
          tone="rose"
          variant="surface"
        />
      </div>

      <ProfileBodyMetricsCard
        v-if="showBodyMetricsCard"
        :bmi="profileBmi"
        :height-label="profileHeightLabel || null"
        :weight-label="profileWeightLabel || null"
        :journal-weight-label="weightSummary.currentLabel"
        :journal-trend="weightSummary.trend"
        :journal-trend-title="weightTrendTitle"
        :journal-delta-text="weightDeltaText"
      />

      <p class="patient-details-footer">
        <ProfileFieldIcon name="clock" :size="14" class="patient-details-footer__icon" />
        <span>{{ t('profile.profileCreated') }} · {{ formattedCreated }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, withDefaults } from 'vue'
import { useI18n } from 'vue-i18n'
import { format, parseISO, differenceInYears } from 'date-fns'
import { savePatientProfile } from '@/api/patientApi'
import { useLocale } from '@/composables/useLocale'
import type { AppLocale } from '@/i18n'
import { dateFnsLocaleFor } from '@/utils/dateLocale'
import AnamnesisModal from '@/components/dashboard/AnamnesisModal.vue'
import HealthRecommendationsModal from '@/components/dashboard/HealthRecommendationsModal.vue'
import ProfileBodyMetricsCard from '@/components/dashboard/ProfileBodyMetricsCard.vue'
import ProfileDetailTile from '@/components/dashboard/ProfileDetailTile.vue'
import ProfileFieldIcon, {
  type ProfileFieldIconName,
} from '@/components/dashboard/ProfileFieldIcon.vue'
import UpcomingAppointmentModal from '@/components/dashboard/UpcomingAppointmentModal.vue'
import { formatFriendlyDayCount } from '@/services/formatDuration'
import { summarizeWeightTrend } from '@/services/weightTrend'
import {
  formatProfileBmi,
  parseOptionalPositiveNumber,
} from '@/utils/profileAnthropometrics'
import type { DoctorSpecialtyId } from '@/services/doctorSpecialty'
import type {
  BiologicalSex,
  DoctorAppointment,
  HealthEntry,
  HealthRecommendation,
  PatientProfile,
} from '@/models/types'

const props = withDefaults(
  defineProps<{
    profile: PatientProfile
    journalEntries: HealthEntry[]
    trackingSince: string | null
    daysTracked: number
    recommendations: HealthRecommendation[]
    nearestAppointment: DoctorAppointment | null
    showAppointmentDoctorNotes?: boolean
    appointmentDoctorNotesDisabled?: boolean
    appointmentDoctorNotesLoading?: boolean
    appointmentDoctorNotesView?: boolean
    appointmentDoctorNotesContent?: string
    appointmentDoctorNotesSpecialty?: DoctorSpecialtyId
    appointmentDoctorNotesTitle?: string
    appointmentDoctorNotesIntro?: string
    appointmentDoctorNotesGeneratingLabel?: string
  }>(),
  {
    showAppointmentDoctorNotes: false,
    appointmentDoctorNotesDisabled: false,
    appointmentDoctorNotesLoading: false,
    appointmentDoctorNotesView: false,
    appointmentDoctorNotesContent: '',
    appointmentDoctorNotesSpecialty: 'primary_care',
  }
)

const emit = defineEmits<{
  updated: [profile: PatientProfile]
  journalImported: [count: number]
  'appointment-doctor-notes': []
  'appointment-doctor-notes-back': []
  'appointment-modal-close': []
  'update:appointment-doctor-notes-specialty': [value: DoctorSpecialtyId]
  'appointment-doctor-notes-specialty-change': [value: DoctorSpecialtyId]
}>()

const { t } = useI18n()
const { locale } = useLocale()

const dfLocale = computed(() => dateFnsLocaleFor(locale.value as AppLocale))

const editing = ref(false)
const saving = ref(false)
const anamnesisOpen = ref(false)
const appointmentOpen = ref(false)
const recommendationsOpen = ref(false)

const appointmentTitle = computed(() =>
  props.nearestAppointment
    ? t('profile.appointmentTitle')
    : t('profile.appointmentNone')
)

function onAppointmentDoctorNotes() {
  emit('appointment-doctor-notes')
}

function onAppointmentDoctorNotesSpecialtyUpdate(value: DoctorSpecialtyId) {
  emit('update:appointment-doctor-notes-specialty', value)
}

function onAppointmentModalClose() {
  appointmentOpen.value = false
  emit('appointment-modal-close')
}

const recommendationsTitle = computed(() => {
  const n = props.recommendations.length
  if (n === 0) return t('profile.recommendationsTitle')
  return t('profile.recommendationsCount', { count: n })
})

function onAnamnesisImported(count: number) {
  emit('journalImported', count)
}

const draft = reactive({
  displayName: '',
  dateOfBirth: '',
  biologicalSex: '' as BiologicalSex | '',
  bloodType: '',
  heightCm: '',
  weightKg: '',
})

watch(
  () => props.profile,
  (p) => {
    draft.displayName = p.displayName
    draft.dateOfBirth = p.dateOfBirth ?? ''
    draft.biologicalSex = p.biologicalSex ?? ''
    draft.bloodType = p.bloodType ?? ''
    draft.heightCm = p.heightCm != null ? String(p.heightCm) : ''
    draft.weightKg = p.weightKg != null ? String(p.weightKg) : ''
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
  return t('profile.yearsOld', { years })
})

const weightSummary = computed(() =>
  summarizeWeightTrend(props.journalEntries)
)

function weightArrowFor(trend: 'up' | 'down' | 'flat') {
  switch (trend) {
    case 'down':
      return '↓'
    case 'up':
      return '↑'
    case 'flat':
      return '→'
  }
}

const weightArrow = computed(() =>
  weightSummary.value.trend ? weightArrowFor(weightSummary.value.trend) : ''
)

type HeaderChip = {
  id: string
  icon: ProfileFieldIconName
  text: string
  chipClass?: string
  trend?: 'up' | 'down' | 'flat'
  trendTitle?: string
}

const weightDeltaText = computed(() => {
  const delta = weightSummary.value.deltaKg
  if (delta === null || weightSummary.value.trend === null) return null
  const abs = Math.abs(delta)
  const formatted = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  if (weightSummary.value.trend === 'down') {
    return t('profile.weightDown', { value: formatted })
  }
  if (weightSummary.value.trend === 'up') {
    return t('profile.weightUp', { value: formatted })
  }
  return t('profile.weightFlat')
})

const weightTrendTitle = computed(() => {
  const { trend, previousLabel, previousDate } = weightSummary.value
  if (!trend || !previousLabel) return ''
  const date = previousDate
    ? format(parseISO(previousDate), 'PP', { locale: dfLocale.value })
    : t('profile.previousEntry')
  if (trend === 'down') {
    return t('profile.weightDownTitle', { label: previousLabel, date })
  }
  if (trend === 'up') {
    return t('profile.weightUpTitle', { label: previousLabel, date })
  }
  return t('profile.weightFlatTitle', { label: previousLabel, date })
})

const trackingLabel = computed(() => {
  if (!props.trackingSince) {
    return t('profile.trackingStart')
  }
  const span = formatFriendlyDayCount(props.daysTracked)
  const since = format(parseISO(props.trackingSince), 'PP', {
    locale: dfLocale.value,
  })
  return t('profile.trackingSpan', { span, since })
})

const headerChips = computed((): HeaderChip[] => {
  const chips: HeaderChip[] = []
  if (ageLabel.value) {
    chips.push({ id: 'age', icon: 'cake', text: ageLabel.value })
  }
  if (weightSummary.value.currentLabel) {
    chips.push({
      id: 'weight',
      icon: 'weight',
      text: weightSummary.value.currentLabel,
      chipClass: 'patient-chip--weight',
      trend: weightSummary.value.trend ?? undefined,
      trendTitle: weightTrendTitle.value || undefined,
    })
  }
  return chips
})

const formattedDob = computed(() =>
  props.profile.dateOfBirth
    ? format(parseISO(props.profile.dateOfBirth), 'PP', { locale: dfLocale.value })
    : ''
)

const formattedCreated = computed(() =>
  format(parseISO(props.profile.createdAt), 'PP', { locale: dfLocale.value })
)

const sexLabel = computed(() => {
  const map: Record<BiologicalSex, string> = {
    female: t('profile.sexFemale'),
    male: t('profile.sexMale'),
    other: t('profile.sexOther'),
    prefer_not_to_say: t('profile.sexPreferNot'),
  }
  return props.profile.biologicalSex
    ? map[props.profile.biologicalSex]
    : ''
})

const profileHeightLabel = computed(() => {
  if (props.profile.heightCm == null) return ''
  const value = Math.round(props.profile.heightCm)
  return t('profile.heightValue', { value })
})

const profileWeightLabel = computed(() => {
  if (props.profile.weightKg == null) return ''
  const rounded = Math.round(props.profile.weightKg * 10) / 10
  const value = Number.isInteger(rounded) ? rounded : rounded.toFixed(1)
  return t('profile.weightValue', { value })
})

const profileBmi = computed(() => {
  const { weightKg, heightCm } = props.profile
  if (weightKg == null || heightCm == null) return null
  return formatProfileBmi(weightKg, heightCm)
})

const showDemographicsRow = computed(
  () =>
    Boolean(props.profile.dateOfBirth) ||
    Boolean(props.profile.biologicalSex) ||
    Boolean(props.profile.bloodType)
)

const showBodyMetricsCard = computed(
  () =>
    props.profile.heightCm != null ||
    props.profile.weightKg != null ||
    profileBmi.value != null ||
    Boolean(weightSummary.value.currentLabel)
)

async function save() {
  saving.value = true
  try {
    const updated = await savePatientProfile({
      displayName: draft.displayName.trim(),
      dateOfBirth: draft.dateOfBirth || undefined,
      biologicalSex: draft.biologicalSex || undefined,
      bloodType: draft.bloodType.trim() || undefined,
      heightCm: parseOptionalPositiveNumber(draft.heightCm),
      weightKg: parseOptionalPositiveNumber(draft.weightKg),
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
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1rem 1.1rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-surface) 100%);
}

.patient-header {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.patient-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    var(--accent-strong),
    color-mix(in srgb, var(--accent-strong) 65%, #1a237e)
  );
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 3px 10px color-mix(in srgb, var(--accent-strong) 30%, transparent);
}

.patient-info {
  flex: 1;
  min-width: 160px;
}

.patient-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.2rem;
  color: var(--text-primary);
}

.patient-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.35rem;
}

.patient-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  max-width: 100%;
  padding: 0.2rem 0.45rem 0.2rem 0.38rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--text-secondary);
  background: var(--bg-muted);
  border: 1px solid var(--border);
}

.patient-chip--weight {
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 10%, var(--bg-muted));
  border-color: color-mix(in srgb, var(--accent-strong) 30%, var(--border));
}

.patient-chip__text {
  min-width: 0;
}

.patient-tracking {
  display: flex;
  align-items: flex-start;
  gap: 0.38rem;
  margin: 0.4rem 0 0;
  padding: 0.38rem 0.55rem;
  font-size: 0.74rem;
  line-height: 1.4;
  color: var(--text-muted);
  background: var(--bg-muted);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.patient-tracking__icon {
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: var(--text-faint);
}

.patient-chip__trend {
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1;
}

.patient-chip__trend--down {
  color: #2e7d32;
}

.patient-chip__trend--up {
  color: #c62828;
}

.patient-chip__trend--flat {
  color: var(--text-faint);
}

[data-theme='dark'] .patient-chip__trend--down {
  color: #66bb6a;
}

[data-theme='dark'] .patient-chip__trend--up {
  color: #ef5350;
}

.patient-weight__arrow {
  font-size: 1rem;
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

.detail-weight__delta {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted);
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
  width: 2.15rem;
  height: 2.15rem;
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
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  color: var(--text-secondary);
  padding: 0.35rem 0.65rem;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background-color 0.15s ease;
}

.edit-toggle:hover {
  border-color: var(--accent-strong);
  color: var(--text-primary);
  background: color-mix(in srgb, var(--accent-strong) 8%, var(--bg-surface));
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.85rem 0 0;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border);
}

.patient-details__row {
  display: grid;
  gap: 0.5rem;
}

.patient-details__row--triple {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 640px) {
  .patient-details__row--triple {
    grid-template-columns: 1fr;
  }
}

.patient-details-footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0.05rem 0 0;
  padding: 0.25rem 0.05rem 0;
  font-size: 0.72rem;
  color: var(--text-faint);
  line-height: 1.4;
}

.patient-details-footer__icon {
  flex-shrink: 0;
  opacity: 0.85;
}

.patient-form {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border);
  display: grid;
  gap: 0.75rem;
}

.form-row label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.28rem;
}

.form-row input,
.form-row select {
  width: 100%;
  padding: 0.42rem 0.55rem;
  font-size: 0.88rem;
  background: var(--bg-input);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: inherit;
  box-sizing: border-box;
}

.form-row--pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
}

.form-row__cell {
  min-width: 0;
}

@media (max-width: 480px) {
  .form-row--pair {
    grid-template-columns: 1fr;
  }
}

.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: start;
  background: var(--accent-strong);
  color: #fff;
  border: none;
  padding: 0.45rem 0.95rem;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.save-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.save-btn:disabled {
  opacity: 0.6;
}
</style>
