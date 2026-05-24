<template>
  <button
    type="button"
    class="nav-icon-btn"
    :class="{ 'nav-icon-btn--active': active }"
    :aria-expanded="ariaExpanded"
    :aria-label="ariaLabel"
    :title="title"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  ariaLabel: string
  ariaExpanded?: boolean
  active?: boolean
  title?: string
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.nav-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--bg-muted);
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.nav-icon-btn:hover {
  background: var(--bg-surface);
  border-color: var(--accent);
}

.nav-icon-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.nav-icon-btn--active {
  background: color-mix(in srgb, var(--accent-strong) 12%, var(--bg-muted));
  border-color: var(--accent);
  color: var(--accent-strong);
}

.nav-icon-btn :deep(svg) {
  width: 1.1rem;
  height: 1.1rem;
}
</style>
