<template>
  <div class="profile-bmi-scale">
    <div class="profile-bmi-scale__head">
      <span class="profile-bmi-scale__value">{{ formattedBmi }}</span>
      <span
        class="profile-bmi-scale__badge"
        :class="`profile-bmi-scale__badge--${category.id}`"
      >
        {{ categoryLabel }}
      </span>
    </div>

    <p class="profile-bmi-scale__hint">{{ categoryHint }}</p>

    <div
      class="profile-bmi-scale__track"
      role="img"
      :aria-label="trackAriaLabel"
    >
      <div
        v-for="segment in segments"
        :key="segment.id"
        class="profile-bmi-scale__segment"
        :class="`profile-bmi-scale__segment--${segment.id}`"
        :style="{ flex: segment.flex }"
      />
      <span
        class="profile-bmi-scale__marker"
        :class="`profile-bmi-scale__marker--${category.id}`"
        :style="{ left: `${markerPercent}%` }"
        aria-hidden="true"
      />
    </div>

    <div class="profile-bmi-scale__legend">
      <span
        v-for="segment in segments"
        :key="`legend-${segment.id}`"
        class="profile-bmi-scale__legend-item"
        :class="{ 'profile-bmi-scale__legend-item--active': segment.id === category.id }"
      >
        <span
          class="profile-bmi-scale__legend-dot"
          :class="`profile-bmi-scale__legend-dot--${segment.id}`"
        />
        {{ segment.shortLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BMI_CATEGORIES,
  BMI_SCALE_MAX,
  BMI_SCALE_MIN,
  bmiScalePositionPercent,
  getBmiCategory,
  type BmiCategoryId,
} from '@/utils/profileAnthropometrics'

const props = defineProps<{
  bmi: number
}>()

const { t } = useI18n()

const category = computed(() => getBmiCategory(props.bmi))

const formattedBmi = computed(() =>
  Number.isInteger(props.bmi) ? String(props.bmi) : props.bmi.toFixed(1)
)

const categoryLabel = computed(() => t(`profile.bmiCategory.${category.value.id}`))

const categoryHint = computed(() => t(`profile.bmiHint.${category.value.id}`))

const markerPercent = computed(() => bmiScalePositionPercent(props.bmi))

const segments = computed(() => {
  const span = BMI_SCALE_MAX - BMI_SCALE_MIN
  return BMI_CATEGORIES.map((cat) => {
    const segMin = Math.max(cat.min, BMI_SCALE_MIN)
    const segMax = Math.min(cat.max, BMI_SCALE_MAX)
    const width = Math.max(0, segMax - segMin)
    return {
      id: cat.id as BmiCategoryId,
      flex: width / span,
      shortLabel: t(`profile.bmiCategoryShort.${cat.id}`),
    }
  }).filter((s) => s.flex > 0)
})

const trackAriaLabel = computed(() =>
  t('profile.bmiScaleAria', {
    value: formattedBmi.value,
    category: categoryLabel.value,
  })
)
</script>

<style scoped>
.profile-bmi-scale {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.profile-bmi-scale__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.6rem;
}

.profile-bmi-scale__value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.profile-bmi-scale__badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.3;
}

.profile-bmi-scale__badge--underweight {
  color: #0277bd;
  background: color-mix(in srgb, #0277bd 16%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #0277bd 35%, var(--border));
}

.profile-bmi-scale__badge--normal {
  color: #2e7d32;
  background: color-mix(in srgb, #2e7d32 14%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #2e7d32 32%, var(--border));
}

.profile-bmi-scale__badge--overweight {
  color: #ef6c00;
  background: color-mix(in srgb, #ef6c00 14%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #ef6c00 32%, var(--border));
}

.profile-bmi-scale__badge--obese {
  color: #c62828;
  background: color-mix(in srgb, #c62828 14%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #c62828 32%, var(--border));
}

[data-theme='dark'] .profile-bmi-scale__badge--underweight {
  color: #81d4fa;
}

[data-theme='dark'] .profile-bmi-scale__badge--normal {
  color: #81c784;
}

[data-theme='dark'] .profile-bmi-scale__badge--overweight {
  color: #ffb74d;
}

[data-theme='dark'] .profile-bmi-scale__badge--obese {
  color: #ef9a9a;
}

.profile-bmi-scale__hint {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.35;
  color: var(--text-muted);
}

.profile-bmi-scale__track {
  position: relative;
  display: flex;
  height: 0.45rem;
  margin: 0.1rem 0 0.05rem;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.profile-bmi-scale__segment {
  min-width: 2px;
  height: 100%;
}

.profile-bmi-scale__segment--underweight {
  background: linear-gradient(90deg, #4fc3f7, #29b6f6);
}

.profile-bmi-scale__segment--normal {
  background: linear-gradient(90deg, #66bb6a, #43a047);
}

.profile-bmi-scale__segment--overweight {
  background: linear-gradient(90deg, #ffb74d, #fb8c00);
}

.profile-bmi-scale__segment--obese {
  background: linear-gradient(90deg, #ef5350, #e53935);
}

.profile-bmi-scale__marker {
  position: absolute;
  top: 50%;
  width: 0.65rem;
  height: 0.65rem;
  margin-left: -0.325rem;
  transform: translateY(-50%);
  border-radius: 50%;
  background: var(--bg-surface);
  border: 2px solid var(--text-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.profile-bmi-scale__marker--underweight {
  border-color: #0288d1;
}

.profile-bmi-scale__marker--normal {
  border-color: #388e3c;
}

.profile-bmi-scale__marker--overweight {
  border-color: #f57c00;
}

.profile-bmi-scale__marker--obese {
  border-color: #d32f2f;
}

.profile-bmi-scale__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.65rem;
}

.profile-bmi-scale__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6rem;
  color: var(--text-faint);
  line-height: 1.2;
}

.profile-bmi-scale__legend-item--active {
  color: var(--text-secondary);
  font-weight: 600;
}

.profile-bmi-scale__legend-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.profile-bmi-scale__legend-dot--underweight {
  background: #29b6f6;
}

.profile-bmi-scale__legend-dot--normal {
  background: #43a047;
}

.profile-bmi-scale__legend-dot--overweight {
  background: #fb8c00;
}

.profile-bmi-scale__legend-dot--obese {
  background: #e53935;
}
</style>
