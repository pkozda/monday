<template>
  <section class="profile-metrics-section" aria-labelledby="profile-metrics-heading">
    <h3 id="profile-metrics-heading" class="profile-section__title">
      {{ t('profile.bodyMetricsTitle') }}
    </h3>

    <dl v-if="hasAnyMetric" class="profile-metrics-row">
      <div v-if="heightLabel" class="profile-metrics-row__item">
        <dt class="profile-metrics-row__term">{{ t('profile.height') }}</dt>
        <dd class="profile-metrics-row__value">{{ heightLabel }}</dd>
      </div>
      <div v-if="weightLabel" class="profile-metrics-row__item">
        <dt class="profile-metrics-row__term">{{ t('profile.weight') }}</dt>
        <dd class="profile-metrics-row__value">{{ weightLabel }}</dd>
      </div>
      <div v-if="journalWeightLabel" class="profile-metrics-row__item">
        <dt class="profile-metrics-row__term">{{ t('profile.currentWeight') }}</dt>
        <dd class="profile-metrics-row__value">
          <span class="profile-metrics-row__journal">
            {{ journalWeightLabel }}
            <span
              v-if="journalTrend"
              class="profile-metrics-row__trend"
              :class="`profile-metrics-row__trend--${journalTrend}`"
              :title="journalTrendTitle"
            >
              {{ trendArrow }}
            </span>
          </span>
          <span v-if="journalDeltaText" class="profile-metrics-row__delta">
            {{ journalDeltaText }}
          </span>
        </dd>
      </div>
    </dl>

    <ProfileBmiScale v-if="bmi != null" :bmi="bmi" />
    <p v-else-if="heightLabel && weightLabel" class="profile-metrics-section__note">
      {{ t('profile.bmiUnavailable') }}
    </p>
    <p v-else class="profile-metrics-section__note">
      {{ t('profile.bmiAddHeightWeight') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProfileBmiScale from '@/components/dashboard/ProfileBmiScale.vue'

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
.profile-metrics-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem 1.25rem;
  margin: 0 0 0.85rem;
  padding: 0;
}

@media (max-width: 640px) {
  .profile-metrics-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

.profile-metrics-row__item {
  min-width: 0;
}

.profile-metrics-row__term {
  margin: 0 0 0.15rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  line-height: 1.35;
}

.profile-metrics-row__value {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.profile-metrics-row__journal {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.profile-metrics-row__trend {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
}

.profile-metrics-row__trend--down {
  color: #2e7d32;
}

.profile-metrics-row__trend--up {
  color: #c62828;
}

.profile-metrics-row__trend--flat {
  color: var(--text-faint);
}

[data-theme='dark'] .profile-metrics-row__trend--down {
  color: #66bb6a;
}

[data-theme='dark'] .profile-metrics-row__trend--up {
  color: #ef5350;
}

.profile-metrics-row__delta {
  display: block;
  margin-top: 0.12rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-muted);
}

.profile-metrics-section__note {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--text-muted);
}
</style>
