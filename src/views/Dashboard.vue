<template>
  <div class="dashboard">
    <SectionHeader 
      title="Dashboard" 
      subtitle="High-level overview of your health status"
    />

    <div v-if="loading" class="loading">Loading...</div>
    
    <div v-else>
      <section class="dashboard-section">
        <SectionHeader title="Current Clinical Model" />
        <MedicalCard
          v-if="clinicalModel"
          :title="clinicalModel.title"
          :summary="clinicalModel.summary"
          :factors="clinicalModel.factors"
        />
      </section>

      <section class="dashboard-section">
        <SectionHeader title="Key Conditions" />
        <div class="conditions-placeholder">
          <p>Key conditions will be displayed here based on clinical model analysis.</p>
        </div>
      </section>

      <section class="dashboard-section">
        <SectionHeader title="Active Hypotheses" />
        <div v-if="hypotheses.length > 0" class="hypotheses-preview">
          <HypothesisCard
            v-for="hypothesis in hypotheses.slice(0, 3)"
            :key="hypothesis.id"
            :hypothesis="hypothesis"
          />
        </div>
        <div v-else class="empty-state">
          <p>No active hypotheses at this time.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SectionHeader from '@/components/SectionHeader.vue'
import MedicalCard from '@/components/MedicalCard.vue'
import HypothesisCard from '@/components/HypothesisCard.vue'
import { getClinicalModel, getHypotheses } from '@/api/mockApi'
import type { ClinicalModel, Hypothesis } from '@/models/types'

const loading = ref(true)
const clinicalModel = ref<ClinicalModel | null>(null)
const hypotheses = ref<Hypothesis[]>([])

onMounted(async () => {
  try {
    const [model, hyps] = await Promise.all([
      getClinicalModel(),
      getHypotheses(),
    ])
    clinicalModel.value = model
    hypotheses.value = hyps
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-section {
  margin-bottom: 3rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.conditions-placeholder {
  background: #1e1e1e;
  border: 1px dashed #444;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: #999;
}

.hypotheses-preview {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}
</style>
