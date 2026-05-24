<template>
  <svg
    class="profile-field-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      v-if="name === 'calendar'"
      d="M7 3v2M17 3v2M4 9h16M6 5h12a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-else-if="name === 'user'"
      d="M12 12a4 4 0 100-8 4 4 0 000 8zM6 20a6 6 0 0112 0"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
    />
    <path
      v-else-if="name === 'droplet'"
      d="M12 3c3.5 4.2 6 7.1 6 10.5a6 6 0 11-12 0C6 10.1 8.5 7.2 12 3z"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linejoin="round"
    />
    <path
      v-else-if="name === 'height'"
      d="M12 4v16M9 7l3-3 3 3M9 17l3 3 3-3"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-else-if="name === 'weight'"
      d="M12 3a5 5 0 015 5c0 3.5-5 13-5 13S7 11.5 7 8a5 5 0 015-5zM12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linejoin="round"
    />
    <path
      v-else-if="name === 'bmi'"
      d="M4 19V5M4 19h16M8 15l3-4 3 3 4-6"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-else-if="name === 'journal'"
      d="M8 4h8a2 2 0 012 2v14l-6-3-6 3V6a2 2 0 012-2zM12 8v4M10 10h4"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linejoin="round"
    />
    <path
      v-else-if="name === 'clock'"
      d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
    />
    <path
      v-else-if="name === 'cake'"
      d="M12 8v1M8 9h8M7 13h10M9 17h6M8 9c0-1.5 1-2.5 2-3h4c1 0.5 2 1.5 2 3"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-else-if="name === 'pencil'"
      d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-else
      d="M12 3l1.8 5.5H19l-4.6 3.3 1.8 5.5L12 14l-4.2 3.3 1.8-5.5L5 8.5h5.2L12 3z"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
export type ProfileFieldIconName =
  | 'calendar'
  | 'user'
  | 'droplet'
  | 'height'
  | 'weight'
  | 'bmi'
  | 'journal'
  | 'clock'
  | 'cake'
  | 'pencil'
  | 'sparkle'

withDefaults(
  defineProps<{
    name: ProfileFieldIconName
    size?: number
  }>(),
  { size: 18 }
)
</script>

<style scoped>
.profile-field-icon {
  display: block;
  flex-shrink: 0;
}
</style>
