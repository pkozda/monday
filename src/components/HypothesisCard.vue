<template>
  <article
    class="hypothesis-card"
    :class="{
      'hypothesis-card--critical': detail.isCritical,
      'hypothesis-card--expanded': expanded,
    }"
  >
    <button
      type="button"
      class="hypothesis-trigger"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <div class="hypothesis-header">
        <h3 class="hypothesis-title">{{ hypothesis.title }}</h3>
        <div class="hypothesis-badges">
          <span v-if="detail.isCritical" class="critical-badge">Needs clinician</span>
          <span class="hypothesis-confidence" :class="confidenceClass">
            {{ hypothesis.confidence }}
          </span>
        </div>
      </div>
      <span class="hypothesis-chevron" :class="{ 'hypothesis-chevron--open': expanded }" />
    </button>

    <div v-if="detail.isCritical && !expanded" class="critical-banner">
      <p>{{ detail.criticalReason }}</p>
      <button type="button" class="btn-doctor-notes" @click.stop="openDoctorNotes">
        Prepare notes for doctor
      </button>
    </div>

    <div v-show="expanded" class="hypothesis-body">
      <section class="hypothesis-section">
        <h4 class="section-label">What this means</h4>
        <p class="hypothesis-summary">{{ detail.summary }}</p>
      </section>

      <section class="hypothesis-section">
        <h4 class="section-label">What to do next</h4>
        <ul class="recommendations-list">
          <li v-for="(rec, i) in detail.recommendations" :key="i">{{ rec }}</li>
        </ul>
      </section>

      <section v-if="detail.evidenceEntries.length" class="hypothesis-section">
        <h4 class="section-label">
          Supporting journal entries ({{ detail.evidenceEntries.length }})
        </h4>
        <ul class="evidence-list">
          <li v-for="entry in detail.evidenceEntries" :key="entry.id">
            <span class="evidence-line">{{ formatEvidenceLine(entry) }}</span>
            <span class="evidence-desc">{{ entry.description }}</span>
          </li>
        </ul>
      </section>

      <div v-if="detail.isCritical" class="hypothesis-actions">
        <button type="button" class="btn-doctor-notes" @click="openDoctorNotes">
          Prepare notes for doctor
        </button>
      </div>
    </div>

    <DoctorNotesModal
      :open="doctorNotesOpen"
      :content="doctorNotesContent"
      @close="doctorNotesOpen = false"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DoctorNotesModal from '@/components/DoctorNotesModal.vue'
import { generateDoctorNotes } from '@/services/doctorNotes'
import {
  buildHypothesisDetail,
  formatEvidenceLine,
} from '@/services/hypothesisDetail'
import type { HealthEntry, Hypothesis, PatientProfile } from '@/models/types'

const props = defineProps<{
  hypothesis: Hypothesis
  journalEntries: HealthEntry[]
  patient?: PatientProfile | null
}>()

const expanded = ref(false)
const doctorNotesOpen = ref(false)

const detail = computed(() =>
  buildHypothesisDetail(props.hypothesis, props.journalEntries)
)

const doctorNotesContent = computed(() =>
  generateDoctorNotes(
    props.hypothesis,
    props.patient ?? null,
    props.journalEntries
  )
)

const confidenceClass = computed(() => {
  const map: Record<string, string> = {
    Exploratory: 'confidence--exploratory',
    Supported: 'confidence--supported',
    'Strongly Supported': 'confidence--strong',
  }
  return map[props.hypothesis.confidence] || ''
})

function openDoctorNotes() {
  doctorNotesOpen.value = true
}
</script>

<style scoped>
.hypothesis-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.hypothesis-card--critical {
  border-color: var(--urgency-urgent-text);
}

.hypothesis-trigger {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem 1.25rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: inherit;
}

.hypothesis-trigger:hover {
  background: var(--bg-muted);
}

.hypothesis-header {
  flex: 1;
  min-width: 0;
}

.hypothesis-title {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary);
  line-height: 1.35;
}

.hypothesis-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.critical-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--urgency-urgent-bg);
  color: var(--urgency-urgent-text);
  border: 1px solid var(--urgency-urgent-text);
}

.hypothesis-confidence {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  white-space: nowrap;
}

.confidence--exploratory {
  background: var(--confidence-exploratory-bg);
  color: var(--confidence-exploratory-text);
}

.confidence--supported {
  background: var(--confidence-supported-bg);
  color: var(--confidence-supported-text);
}

.confidence--strong {
  background: var(--confidence-strong-bg);
  color: var(--confidence-strong-text);
}

.hypothesis-chevron {
  flex-shrink: 0;
  width: 0.5rem;
  height: 0.5rem;
  margin-top: 0.45rem;
  border-right: 2px solid var(--text-muted);
  border-bottom: 2px solid var(--text-muted);
  transform: rotate(45deg);
  transition: transform 0.2s;
}

.hypothesis-chevron--open {
  transform: rotate(-135deg);
  margin-top: 0.6rem;
}

.critical-banner {
  margin: 0 1.25rem 1rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background: var(--urgency-urgent-bg);
  border: 1px solid var(--urgency-urgent-text);
}

.critical-banner p {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: var(--urgency-urgent-text);
  line-height: 1.45;
}

.hypothesis-body {
  padding: 0 1.25rem 1.25rem;
  border-top: 1px solid var(--border);
}

.hypothesis-section {
  padding-top: 1rem;
}

.section-label {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
}

.hypothesis-summary {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.recommendations-list {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.recommendations-list li + li {
  margin-top: 0.35rem;
}

.evidence-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.evidence-list li {
  padding: 0.65rem 0.75rem;
  background: var(--bg-muted);
  border-radius: 6px;
  border: 1px solid var(--border);
}

.evidence-line {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.evidence-desc {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.hypothesis-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.critical-banner .btn-doctor-notes {
  display: inline-flex;
  align-items: center;
  background: var(--urgency-urgent-text);
  color: #fff;
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  width: auto;
  white-space: nowrap;
}

.critical-banner .btn-doctor-notes:hover {
  filter: brightness(1.08);
}

.hypothesis-actions .btn-doctor-notes {
  display: inline-flex;
  align-items: center;
  background: var(--urgency-urgent-text);
  color: #fff;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  width: auto;
}

.hypothesis-actions .btn-doctor-notes:hover {
  filter: brightness(1.08);
}

.hypothesis-card--expanded .hypothesis-trigger {
  padding-bottom: 0.75rem;
}
</style>
