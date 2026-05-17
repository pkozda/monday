<template>
  <div class="hypotheses-view">
    <SectionHeader
      title="Hypotheses"
      subtitle="Evidence-based health hypotheses and analysis"
    />

    <div v-if="loading" class="loading">Loading hypotheses…</div>

    <div v-else-if="hypotheses.length === 0" class="empty-state">
      <p>No hypotheses yet. Generate hypotheses from the Dashboard after adding journal entries.</p>
      <router-link to="/" class="link-cta">Go to Dashboard</router-link>
    </div>

    <div v-else class="hypotheses-container">
      <HypothesisCard
        v-for="hypothesis in hypotheses"
        :key="hypothesis.id"
        :hypothesis="hypothesis"
        :journal-entries="journalEntries"
        :patient="patient"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SectionHeader from '@/components/SectionHeader.vue'
import HypothesisCard from '@/components/HypothesisCard.vue'
import { getHypotheses } from '@/api/mockApi'
import { getHealthEntries } from '@/api/healthApi'
import { getPatientProfile } from '@/api/patientApi'
import type { HealthEntry, Hypothesis, PatientProfile } from '@/models/types'

const loading = ref(true)
const hypotheses = ref<Hypothesis[]>([])
const journalEntries = ref<HealthEntry[]>([])
const patient = ref<PatientProfile | null>(null)

onMounted(async () => {
  try {
    const [hyps, entries, profile] = await Promise.all([
      getHypotheses(),
      getHealthEntries(),
      getPatientProfile(),
    ])
    hypotheses.value = hyps
    journalEntries.value = entries
    patient.value = profile
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hypotheses-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.link-cta {
  display: inline-block;
  margin-top: 0.75rem;
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.link-cta:hover {
  text-decoration: underline;
}

.hypotheses-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
