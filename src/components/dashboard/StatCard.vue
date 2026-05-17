<template>
  <div
    class="stat-card"
    :class="[
      `stat-card--${variant}`,
      { 'stat-card--alert': alert },
    ]"
  >
    <div class="stat-card-top">
      <div class="stat-icon" aria-hidden="true">
        <svg
          v-if="variant === 'journal'"
          class="stat-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M8 4h8a2 2 0 0 1 2 2v14l-6-3-6 3V6a2 2 0 0 1 2-2z" />
          <path d="M12 7v4M10 9h4" />
        </svg>
        <svg
          v-else-if="variant === 'activity'"
          class="stat-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4M8 14h2v4H8zM14 12h2v6h-2z" />
        </svg>
        <svg
          v-else-if="variant === 'conditions'"
          class="stat-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 21s-6-4.35-6-9a6 6 0 0 1 12 0c0 4.65-6 9-6 9z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
        <svg
          v-else-if="variant === 'severity'"
          class="stat-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 19h16M6 16l3-9 3 5 3-7 3 11" />
        </svg>
        <svg
          v-else-if="variant === 'timeline'"
          class="stat-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 6h16M4 12h10M4 18h14" />
          <circle cx="19" cy="12" r="2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="18" r="2" fill="currentColor" stroke="none" />
        </svg>
        <svg
          v-else-if="variant === 'hypotheses'"
          class="stat-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
        </svg>
        <svg
          v-else
          class="stat-icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3 2 20h20L12 3z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      </div>
      <span class="stat-label">{{ label }}</span>
    </div>
    <span class="stat-value">{{ value }}</span>
    <span v-if="hint" class="stat-hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
export type StatCardVariant =
  | 'journal'
  | 'activity'
  | 'conditions'
  | 'severity'
  | 'timeline'
  | 'hypotheses'
  | 'attention'

withDefaults(
  defineProps<{
    label: string
    value: string | number
    hint?: string
    alert?: boolean
    variant?: StatCardVariant
  }>(),
  {
    variant: 'journal',
  }
)
</script>

<style scoped>
.stat-card {
  --stat-accent: var(--accent);
  position: relative;
  border: 1px solid color-mix(in srgb, var(--stat-accent) 30%, var(--border));
  border-radius: 10px;
  padding: 1.1rem 1.15rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: color-mix(in srgb, var(--stat-accent) 12%, var(--bg-surface));
  min-width: 0;
  transition: border-color 0.2s;
}

.stat-card:hover {
  border-color: color-mix(in srgb, var(--stat-accent) 45%, var(--border));
}

.stat-card-top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.stat-icon {
  flex-shrink: 0;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--stat-accent);
  background: color-mix(in srgb, var(--stat-accent) 20%, transparent);
}

.stat-icon-svg {
  width: 1.35rem;
  height: 1.35rem;
}

.stat-card--journal {
  --stat-accent: #42a5f5;
}

.stat-card--activity {
  --stat-accent: #26a69a;
}

.stat-card--conditions {
  --stat-accent: #ab47bc;
}

.stat-card--severity {
  --stat-accent: #ffa726;
}

.stat-card--timeline {
  --stat-accent: #5c6bc0;
}

.stat-card--hypotheses {
  --stat-accent: #66bb6a;
}

.stat-card--attention {
  --stat-accent: #ef5350;
}

.stat-card--alert {
  --stat-accent: #ef5350;
  border-color: color-mix(in srgb, var(--stat-accent) 45%, var(--error-border));
  background: color-mix(in srgb, var(--stat-accent) 16%, var(--error-bg));
}

.stat-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  line-height: 1.3;
}

.stat-value {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.stat-card--alert .stat-value {
  color: var(--error-text);
}

.stat-hint {
  font-size: 0.78rem;
  color: var(--text-faint);
  line-height: 1.35;
}
</style>
