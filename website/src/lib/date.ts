import { format, formatDuration, intervalToDuration } from 'date-fns'

export const SEC_MILLIS = 1000
export const MIN_MILLIS = 60 * SEC_MILLIS
export const HR_MILLIS = 60 * MIN_MILLIS
export const DAY_MILLIS = 24 * HR_MILLIS
export const WEEK_MILLIS = 7 * DAY_MILLIS

export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm'

export type TimePeriod = {
  label: string
  value: string
}

export const TIME_PERIODS: TimePeriod[] = [
  { label: 'seconds', value: 'sec' },
  { label: 'minutes', value: 'min' },
  { label: 'hours', value: 'hr' },
  { label: 'days', value: 'day' },
  { label: 'weeks', value: 'week' },
]

export const TIME_PERIOD_MAP = new Map([
  ['sec', SEC_MILLIS],
  ['min', MIN_MILLIS],
  ['hr', HR_MILLIS],
  ['day', DAY_MILLIS],
  ['week', WEEK_MILLIS],
])

export function parseTimePeriodCount(count: string): number | undefined {
  count = count.trim()
  if (!count) {
    return undefined
  }

  try {
    const countInt = parseInt(count, 10)
    return !isNaN(countInt) && countInt >= 0 ? countInt : undefined
  } catch (e) {
    console.error(`Invalid time period count '${count}'`, e)
    return undefined
  }
}

export function findTimePeriod(s: string): TimePeriod | undefined {
  return TIME_PERIODS.find((tp) => tp.value === s) || undefined
}

export function parseCountStringAndTimePeriodToMillis(count: string, timePeriod: TimePeriod): number | undefined {
  const countInt = parseTimePeriodCount(count)
  if (countInt == null) {
    return undefined
  }
  return parseCountAndTimePeriodToMillis(countInt, timePeriod)
}

export function parseCountAndTimePeriodToMillis(count: number, timePeriod: TimePeriod): number {
  let newTimePeriod = 0
  try {
    newTimePeriod = count * (TIME_PERIOD_MAP.get(timePeriod.value) || 0)
  } catch (e) {
    console.error(`Invalid time period count '${count}'`, e)
  }
  return newTimePeriod
}

export function formatDurationMillis(millis: number): string {
  const format = ['years', 'months', 'days']
  if (millis < 5 * DAY_MILLIS) {
    format.push('hours')
    if (millis < 5 * HR_MILLIS) {
      format.push('minutes')
      if (millis < 5 * MIN_MILLIS) {
        format.push('seconds')
      }
    }
  }
  return formatDuration(intervalToDuration({ start: 0, end: millis }), { format })
}

export function formatDurationSeconds(secs: number): string {
  return formatDurationMillis(secs * 1000)
}

export function formatTimeFromMillis(millis: number): string {
  return format(millis, DATE_TIME_FORMAT)
}

export async function sleep(millis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millis))
}
