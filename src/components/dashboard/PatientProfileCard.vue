<template>
  <div class="patient-card">
    <div class="patient-header">
      <div class="patient-avatar" aria-hidden="true">{{ initials }}</div>
      <div class="patient-info">
        <h2 class="patient-name">{{ profile.displayName }}</h2>
        <p v-if="ageLabel" class="patient-meta">{{ ageLabel }}</p>
        <p v-if="trackingLabel" class="patient-meta">{{ trackingLabel }}</p>
      </div>
      <button type="button" class="edit-toggle" @click="editing = !editing">
        {{ editing ? 'Cancel' : 'Edit profile' }}
      </button>
    </div>

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
import type { BiologicalSex, PatientProfile } from '@/models/types'

const props = defineProps<{
  profile: PatientProfile
  trackingSince: string | null
  daysTracked: number
}>()

const emit = defineEmits<{
  updated: [profile: PatientProfile]
}>()

const editing = ref(false)
const saving = ref(false)

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

const trackingLabel = computed(() => {
  if (!props.trackingSince) {
    return 'Start your health journal to begin tracking'
  }
  return `Health tracking for ${props.daysTracked} days · since ${format(parseISO(props.trackingSince), 'MMM d, yyyy')}`
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
