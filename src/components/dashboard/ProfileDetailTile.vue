<template>
  <div class="profile-detail-tile" :class="variantClass">
    <div class="profile-detail-tile__icon" :class="`profile-detail-tile__icon--${tone}`">
      <ProfileFieldIcon :name="icon" :size="16" />
    </div>
    <div class="profile-detail-tile__body">
      <p class="profile-detail-tile__label">{{ label }}</p>
      <div class="profile-detail-tile__value">
        <slot>{{ value }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProfileFieldIcon, {
  type ProfileFieldIconName,
} from '@/components/dashboard/ProfileFieldIcon.vue'

const props = withDefaults(
  defineProps<{
    label: string
    value?: string
    icon: ProfileFieldIconName
    tone?: 'accent' | 'rose' | 'violet' | 'teal' | 'amber' | 'sky' | 'neutral'
    variant?: 'default' | 'surface'
  }>(),
  { tone: 'accent', variant: 'default' }
)

const variantClass = computed(() =>
  props.variant === 'surface' ? 'profile-detail-tile--surface' : ''
)
</script>

<style scoped>
.profile-detail-tile {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.6rem 0.7rem;
  background: var(--bg-muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-height: 100%;
  box-sizing: border-box;
}

.profile-detail-tile--surface {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--accent-strong) 7%, var(--bg-surface)),
    var(--bg-surface)
  );
  border-color: color-mix(in srgb, var(--accent-strong) 18%, var(--border));
  box-shadow: 0 1px 4px color-mix(in srgb, var(--shadow) 65%, transparent);
}

.profile-detail-tile__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 7px;
  flex-shrink: 0;
}

.profile-detail-tile__icon--accent {
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 14%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, var(--accent-strong) 28%, var(--border));
}

.profile-detail-tile__icon--rose {
  color: #c62828;
  background: color-mix(in srgb, #c62828 12%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #c62828 28%, var(--border));
}

.profile-detail-tile__icon--violet {
  color: #6a1b9a;
  background: color-mix(in srgb, #6a1b9a 12%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #6a1b9a 28%, var(--border));
}

.profile-detail-tile__icon--teal {
  color: #00695c;
  background: color-mix(in srgb, #00695c 12%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #00695c 28%, var(--border));
}

.profile-detail-tile__icon--amber {
  color: #f57f17;
  background: color-mix(in srgb, #f57f17 14%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #f57f17 30%, var(--border));
}

.profile-detail-tile__icon--sky {
  color: #0277bd;
  background: color-mix(in srgb, #0277bd 12%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #0277bd 28%, var(--border));
}

.profile-detail-tile__icon--neutral {
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px solid var(--border);
}

[data-theme='dark'] .profile-detail-tile__icon--rose {
  color: #ef9a9a;
}

[data-theme='dark'] .profile-detail-tile__icon--violet {
  color: #ce93d8;
}

[data-theme='dark'] .profile-detail-tile__icon--teal {
  color: #80cbc4;
}

[data-theme='dark'] .profile-detail-tile__icon--amber {
  color: #ffcc80;
}

[data-theme='dark'] .profile-detail-tile__icon--sky {
  color: #81d4fa;
}

.profile-detail-tile__body {
  min-width: 0;
  flex: 1;
}

.profile-detail-tile__label {
  margin: 0 0 0.12rem;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
  line-height: 1.3;
}

.profile-detail-tile__value {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}
</style>
