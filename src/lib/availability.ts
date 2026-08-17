import { getSetting, setSetting } from './settings'

const SETTING_KEY = 'visit_availability'

export interface Availability {
  /** Weekdays the studio takes visitors: 0 = Sunday … 6 = Saturday. */
  weekdays: number[]
  /** Slot start times in 24h "HH:MM", in the order they are offered. */
  times: string[]
  /** How many dates to offer at once. */
  maxDates: number
  /** How far ahead to look when filling those dates. */
  daysAhead: number
}

/** Matches what the site offered while these lists were hard-coded. */
export const DEFAULT_AVAILABILITY: Availability = {
  weekdays: [1, 2, 3, 4, 5],
  times: ['10:00', '13:30', '15:00', '17:30'],
  maxDates: 4,
  daysAhead: 21,
}

export const WEEKDAY_LABELS: Record<'fr' | 'en', string[]> = {
  fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}

export const isValidTime = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim())

/** Keeps a stored blob usable even if it was written by an older shape. */
export function normalizeAvailability(input: unknown): Availability {
  const raw = (input ?? {}) as Partial<Availability>

  const weekdays = Array.isArray(raw.weekdays)
    ? Array.from(
        new Set(raw.weekdays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))
      ).sort((a, b) => a - b)
    : DEFAULT_AVAILABILITY.weekdays

  const times = Array.isArray(raw.times)
    ? Array.from(
        new Set(
          raw.times.filter((t): t is string => typeof t === 'string' && isValidTime(t))
        )
      ).sort()
    : DEFAULT_AVAILABILITY.times

  const maxDates = Number.isInteger(raw.maxDates)
    ? Math.min(Math.max(raw.maxDates as number, 1), 14)
    : DEFAULT_AVAILABILITY.maxDates

  const daysAhead = Number.isInteger(raw.daysAhead)
    ? Math.min(Math.max(raw.daysAhead as number, 1), 120)
    : DEFAULT_AVAILABILITY.daysAhead

  return { weekdays, times, maxDates, daysAhead }
}

export async function getAvailability(): Promise<Availability> {
  const stored = await getSetting(SETTING_KEY)
  if (!stored) return DEFAULT_AVAILABILITY

  try {
    return normalizeAvailability(JSON.parse(stored))
  } catch {
    console.error('visit_availability is not valid JSON; using defaults')
    return DEFAULT_AVAILABILITY
  }
}

export async function saveAvailability(input: unknown): Promise<Availability> {
  const availability = normalizeAvailability(input)
  await setSetting(SETTING_KEY, JSON.stringify(availability))
  return availability
}

/** "10:00" -> "10 h 00" (fr) / "10:00 am" (en). */
export function formatSlotTime(time: string, lang: 'fr' | 'en'): string {
  const [hours, minutes] = time.split(':').map(Number)

  if (lang === 'en') {
    const suffix = hours < 12 ? 'am' : 'pm'
    const hour12 = hours % 12 === 0 ? 12 : hours % 12
    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`
  }

  return `${hours} h ${String(minutes).padStart(2, '0')}`
}

/**
 * Local calendar date, not `toISOString()`. Slicing a UTC string rolls over to
 * the next day during a Québec evening, which would label a slot with one date
 * while keying it with another.
 */
const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`

export interface VisitDay {
  key: string
  label: string
}

/**
 * The next open dates, starting tomorrow, restricted to the weekdays Manon
 * accepts visitors. Returns fewer than `maxDates` when the window holds fewer.
 */
export function upcomingVisitDays(
  availability: Availability,
  lang: 'fr' | 'en',
  from: Date = new Date()
): VisitDay[] {
  const locale = lang === 'en' ? 'en-CA' : 'fr-CA'
  const days: VisitDay[] = []

  for (let offset = 1; offset <= availability.daysAhead; offset++) {
    if (days.length >= availability.maxDates) break

    const date = new Date(from)
    date.setDate(date.getDate() + offset)
    if (!availability.weekdays.includes(date.getDay())) continue

    days.push({
      key: localDateKey(date),
      label: date.toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
    })
  }

  return days
}
