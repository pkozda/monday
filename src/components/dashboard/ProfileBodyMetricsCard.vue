<template>
  <div class="profile-body-metrics">
    <div class="profile-body-metrics__header">
      <div class="profile-body-metrics__title-icon" aria-hidden="true">
        <ProfileFieldIcon name="bmi" :size="18" />
      </div>
      <h3 class="profile-body-metrics__title">{{ t('profile.bodyMetricsTitle') }}</h3>
    </div>

    <div v-if="hasAnyMetric" class="profile-body-metrics__stats">
      <div v-if="heightLabel" class="profile-body-metrics__stat">
        <ProfileFieldIcon name="height" :size="14" class="profile-body-metrics__stat-icon" />
        <div>
          <p class="profile-body-metrics__stat-label">{{ t('profile.height') }}</p>
          <p class="profile-body-metrics__stat-value">{{ heightLabel }}</p>
        </div>
      </div>
      <div v-if="weightLabel" class="profile-body-metrics__stat">
        <ProfileFieldIcon name="weight" :size="14" class="profile-body-metrics__stat-icon" />
        <div>
          <p class="profile-body-metrics__stat-label">{{ t('profile.weight') }}</p>
          <p class="profile-body-metrics__stat-value">{{ weightLabel }}</p>
        </div>
      </div>
      <div v-if="journalWeightLabel" class="profile-body-metrics__stat">
        <ProfileFieldIcon name="journal" :size="14" class="profile-body-metrics__stat-icon" />
        <div>
          <p class="profile-body-metrics__stat-label">{{ t('profile.currentWeight') }}</p>
          <p class="profile-body-metrics__stat-value">
            <span class="profile-body-metrics__journal-value">
              {{ journalWeightLabel }}
              <span
                v-if="journalTrend"
                class="profile-body-metrics__trend"
                :class="`profile-body-metrics__trend--${journalTrend}`"
                :title="journalTrendTitle"
              >
                {{ trendArrow }}
              </span>
            </span>
            <span v-if="journalDeltaText" class="profile-body-metrics__delta">
              {{ journalDeltaText }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <ProfileBmiScale v-if="bmi != null" :bmi="bmi" class="profile-body-metrics__scale" />
    <p v-else-if="heightLabel && weightLabel" class="profile-body-metrics__note">
      {{ t('profile.bmiUnavailable') }}
    </p>
    <p v-else class="profile-body-metrics__note">
      {{ t('profile.bmiAddHeightWeight') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProfileBmiScale from '@/components/dashboard/ProfileBmiScale.vue'
import ProfileFieldIcon from '@/components/dashboard/ProfileFieldIcon.vue'

const props = defineProps<{
  bmi: number | null
  heightLabel?: string | null
  weightLabel?: string | null
  journalWeightLabel?: string | null
  journalTrend?: 'up' | 'down' | 'flat' | null
  journalTrendTitle?: string
  journalDeltaText?: string | null
}>()

const { t } = useI18n()

const hasAnyMetric = computed(
  () =>
    Boolean(props.heightLabel) ||
    Boolean(props.weightLabel) ||
    Boolean(props.journalWeightLabel)
)

const trendArrow = computed(() => {
  switch (props.journalTrend) {
    case 'down':
      return '↓'
    case 'up':
      return '↑'
    case 'flat':
      return '→'
    default:
      return ''
  }
})
</script>

<style scoped>
.profile-body-metrics {
  padding: 0.75rem 0.85rem 0.8rem;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, #f57f17 28%, var(--border));
  background: linear-gradient(
    160deg,
    color-mix(in srgb, #f57f17 11%, var(--bg-surface)) 0%,
    color-mix(in srgb, var(--accent-strong) 6%, var(--bg-muted)) 100%
  );
  box-shadow: 0 2px 10px color-mix(in srgb, #f57f17 12%, transparent);
}

[data-theme='dark'] .profile-body-metrics {
  border-color: color-mix(in srgb, #ffb74d 32%, var(--border));
  background: linear-gradient(
    160deg,
    color-mix(in srgb, #ffb74d 10%, var(--bg-surface)) 0%,
    color-mix(in srgb, var(--accent-strong) 8%, var(--bg-muted)) 100%
  );
}

.profile-body-metrics__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
}

.profile-body-metrics__title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 7px;
  color: #ef6c00;
  background: color-mix(in srgb, #f57f17 18%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, #f57f17 35%, var(--border));
}

[data-theme='dark'] .profile-body-metrics__title-icon {
  color: #ffb74d;
}

.profile-body-metrics__title {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.profile-body-metrics__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.4rem;
  margin-bottom: 0.55rem;
}

.profile-body-metrics__stat {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.4rem 0.5rem;
  border-radius: 7px;
  background: color-mix(in srgb, var(--bg-surface) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 90%, transparent);
}

.profile-body-metrics__stat-icon {
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: var(--text-muted);
}

.profile-body-metrics__stat-label {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
  line-height: 1.25;
}

.profile-body-metrics__stat-value {
  margin: 0.08rem 0 0;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.35;
}

.profile-body-metrics__journal-value {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.profile-body-metrics__trend {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
}

.profile-body-metrics__trend--down {
  color: #2e7d32;
}

.profile-body-metrics__trend--up {
  color: #c62828;
}

.profile-body-metrics__trend--flat {
  color: var(--text-faint);
}

.profile-body-metrics__delta {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-muted);
}

.profile-body-metrics__scale {
  padding-top: 0.15rem;
  border-top: 1px solid color-mix(in srgb, #f57f17 18%, var(--border));
}

.profile-body-metrics__note {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--text-muted);
}
</style>
