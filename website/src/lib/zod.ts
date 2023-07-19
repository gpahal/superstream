import { z } from 'zod'

import { findTimePeriod, parseTimePeriodCount, type TimePeriod } from '@/lib/date'

export function zStringRequired(name: string, skipTrimCheck?: boolean) {
  return z
    .string({ required_error: `${name} is required` })
    .refine((s) => (skipTrimCheck ? s : s.trim()).length > 0, `${name} is required`)
}

export function zTimePeriodCount<T extends string | null | undefined>(
  schema: z.ZodType<T>,
  name: string,
  refineFn?: (timePeriodCount: number) => boolean,
  refineError?: string,
) {
  return schema
    .refine((s) => {
      if (!s) {
        return true
      }

      const parsedTimePeriodCount = parseTimePeriodCount(s)
      return parsedTimePeriodCount != null
    }, `${name} should be a positive number`)
    .refine(
      (s) => {
        try {
          return !refineFn || !s || refineFn(parseTimePeriodCount(s)!)
        } catch {
          return false
        }
      },
      refineError || `${name} is an invalid`,
    )
}

export function zTimePeriod<T extends string | null | undefined>(
  schema: z.ZodType<T>,
  name: string,
  refineFn?: (timePeriodCount: TimePeriod) => boolean,
  refineError?: string,
) {
  return schema
    .refine((s) => {
      if (!s) {
        return true
      }

      const parsedTimePeriod = findTimePeriod(s)
      return parsedTimePeriod != null
    }, `${name} should be a valid time period`)
    .refine(
      (s) => {
        try {
          return !refineFn || !s || refineFn(findTimePeriod(s)!)
        } catch {
          return false
        }
      },
      refineError || `${name} is an invalid`,
    )
}
