import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import type { DoctorAppointment } from '@/models/types'

export function appointmentDayKey(iso: string): string {
  const d = parseISO(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return format(d, 'yyyy-MM-dd')
}

export function isUpcomingAppointment(appt: DoctorAppointment, now = new Date()): boolean {
  return parseISO(appt.scheduledAt).getTime() >= now.getTime()
}

export function providerDisplayName(appt: DoctorAppointment): string {
  const clinic = appt.clinicName?.trim()
  if (clinic) return `${appt.doctorName.trim()} · ${clinic}`
  return appt.doctorName.trim()
}

export function formatAppointmentDateTime(iso: string): string {
  const d = parseISO(iso)
  if (Number.isNaN(d.getTime())) return iso
  return format(d, 'EEE, MMM d, yyyy · h:mm a')
}

export function formatAppointmentTime(iso: string): string {
  const d = parseISO(iso)
  if (Number.isNaN(d.getTime())) return ''
  return format(d, 'h:mm a')
}

export function formatAppointmentShortDate(iso: string): string {
  const d = parseISO(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return format(d, 'MMM d, yyyy')
}

export function splitAppointments(
  appointments: DoctorAppointment[],
  now = new Date()
): { upcoming: DoctorAppointment[]; past: DoctorAppointment[] } {
  const upcoming: DoctorAppointment[] = []
  const past: DoctorAppointment[] = []
  for (const appt of appointments) {
    if (isUpcomingAppointment(appt, now)) upcoming.push(appt)
    else past.push(appt)
  }
  upcoming.sort(
    (a, b) =>
      parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime()
  )
  past.sort(
    (a, b) =>
      parseISO(b.scheduledAt).getTime() - parseISO(a.scheduledAt).getTime()
  )
  return { upcoming, past }
}

export function findNearestUpcoming(
  appointments: DoctorAppointment[],
  now = new Date()
): DoctorAppointment | null {
  const { upcoming } = splitAppointments(appointments, now)
  return upcoming[0] ?? null
}

export function appointmentsByDay(
  appointments: DoctorAppointment[]
): Map<string, DoctorAppointment[]> {
  const map = new Map<string, DoctorAppointment[]>()
  for (const appt of appointments) {
    const key = appointmentDayKey(appt.scheduledAt)
    const list = map.get(key) ?? []
    list.push(appt)
    map.set(key, list)
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime()
    )
  }
  return map
}

export interface CalendarCell {
  date: Date
  inMonth: boolean
  dayKey: string
  isToday: boolean
  appointmentCount: number
}

export function buildMonthGrid(
  month: Date,
  byDay: Map<string, DoctorAppointment[]>
): CalendarCell[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map((date) => {
    const dayKey = format(date, 'yyyy-MM-dd')
    return {
      date,
      inMonth: isSameMonth(date, month),
      dayKey,
      isToday: isToday(date),
      appointmentCount: byDay.get(dayKey)?.length ?? 0,
    }
  })
}

export function shiftMonth(month: Date, delta: number): Date {
  return delta < 0 ? subMonths(month, -delta) : addMonths(month, delta)
}

export function reminderLeadText(iso: string, now = new Date()): string {
  const d = parseISO(iso)
  if (Number.isNaN(d.getTime())) return formatAppointmentDateTime(iso)
  if (isSameDay(d, now)) {
    return `Today at ${format(d, 'h:mm a')}`
  }
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (isSameDay(d, tomorrow)) {
    return `Tomorrow at ${format(d, 'h:mm a')}`
  }
  return format(d, "EEE, MMM d 'at' h:mm a")
}

export function combineDateAndTime(date: string, time: string): string {
  const local = new Date(`${date}T${time}`)
  if (Number.isNaN(local.getTime())) {
    throw new Error('Invalid date or time')
  }
  return local.toISOString()
}

export function defaultAppointmentDateTime(): { date: string; time: string } {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return {
    date: format(d, 'yyyy-MM-dd'),
    time: format(d, 'HH:mm'),
  }
}
