<template>
  <div class="hypotheses-view">
    <SectionHeader 
      title="Hypotheses" 
      subtitle="Evidence-based health hypotheses and analysis"
    />

    <div v-if="loading" class="loading">Loading hypotheses...</div>
    
    <div v-else-if="hypotheses.length === 0" class="empty-state">
      <p>No hypotheses available at this time.</p>
    </div>

    <div v-else class="hypotheses-container">
      <HypothesisCard
        v-for="hypothesis in hypotheses"
        :key="hypothesis.id"
        :hypothesis="hypothesis"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SectionHeader from '@/components/SectionHeader.vue'
import HypothesisCard from '@/components/HypothesisCard.vue'
import { getHypotheses } from '@/api/mockApi'
import type { Hypothesis } from '@/models/types'

const loading = ref(true)
const hypotheses = ref<Hypothesis[]>([])

onMounted(async () => {
  try {
    hypotheses.value = await getHypotheses()
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
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.hypotheses-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
