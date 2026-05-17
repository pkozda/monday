<template>
  <div class="stat-card" :class="{ 'stat-card--alert': alert }">
    <span class="stat-label">{{ label }}</span>
    <span class="stat-value">{{ value }}</span>
    <span v-if="hint" class="stat-hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
  alert?: boolean
}>()
</script>

<style scoped>
.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stat-card--alert {
  border-color: var(--error-border);
  background: var(--error-bg);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-card--alert .stat-value {
  color: var(--error-text);
}

.stat-hint {
  font-size: 0.8rem;
  color: var(--text-faint);
}
</style>
