<template>
  <div class="section-header">
    <h2 class="section-title">{{ title }}</h2>
    <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #e0e0e0;
}

.section-subtitle {
  font-size: 0.95rem;
  color: #999;
  margin: 0;
}
</style>
