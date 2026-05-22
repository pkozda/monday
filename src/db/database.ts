import Dexie, { type Table } from 'dexie'
import type {
  ClinicalModel,
  TimelineEvent,
  Hypothesis,
  HealthEntry,
  PatientProfile,
  DoctorAppointment,
} from '@/models/types'

export class MondayDatabase extends Dexie {
  clinicalModels!: Table<ClinicalModel, string>
  timelineEvents!: Table<TimelineEvent, string>
  hypotheses!: Table<Hypothesis, string>
  healthEntries!: Table<HealthEntry, string>
  patientProfiles!: Table<PatientProfile, string>
  appointments!: Table<DoctorAppointment, string>

  constructor() {
    super('MondayDB')
    this.version(1).stores({
      clinicalModels: 'id',
      timelineEvents: 'id, date, type',
      hypotheses: 'id, confidence',
    })
    this.version(2).stores({
      clinicalModels: 'id',
      timelineEvents: 'id, date, type',
      hypotheses: 'id, confidence',
      healthEntries: 'id, eventDate, entryType, conditionArea, createdAt',
    })
    this.version(3).stores({
      clinicalModels: 'id',
      timelineEvents: 'id, date, type',
      hypotheses: 'id, confidence',
      healthEntries: 'id, eventDate, entryType, conditionArea, createdAt',
      patientProfiles: 'id',
    })
    this.version(4).stores({
      clinicalModels: 'id',
      timelineEvents: 'id, date, type',
      hypotheses: 'id, confidence',
      healthEntries: 'id, eventDate, entryType, conditionArea, createdAt',
      patientProfiles: 'id',
      appointments: 'id, scheduledAt, createdAt',
    })
  }
}

export const db = new MondayDatabase()
