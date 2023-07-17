import { BN } from '@coral-xyz/anchor'
import { Stream } from '@superstream/client'

export type StreamFilter = (stream: Stream, at: BN) => boolean

const NO_OP_STREAM_FILTER_FN: StreamFilter = () => true

export function andStreamFilters(filters: StreamFilter[]): StreamFilter {
  if (filters.length === 0) {
    return NO_OP_STREAM_FILTER_FN
  } else if (filters.length === 1) {
    return filters[0]!
  }

  return (stream: Stream, at: BN) => {
    for (const f of filters) {
      if (!f(stream, at)) {
        return false
      }
    }
    return true
  }
}

export function orStreamFilters(filters: StreamFilter[]): StreamFilter {
  if (filters.length === 0) {
    return NO_OP_STREAM_FILTER_FN
  } else if (filters.length === 1) {
    return filters[0]!
  }

  return (stream: Stream, at: BN): boolean => {
    for (const f of filters) {
      if (f(stream, at)) {
        return true
      }
    }
    return false
  }
}

export type StreamFilterCategory = {
  id: string
  label: string
  values: string[]
  setValues: (values: string[]) => void
  filter: StreamFilter
  options: {
    label: string
    value: string
  }[]
}

export type StreamSort = (a: Stream, b: Stream, at: BN) => number

function reverseStreamSortWithoutAt(sort: (a: Stream, b: Stream) => number): (a: Stream, b: Stream) => number {
  return (a: Stream, b: Stream): number => -sort(a, b)
}

export function reverseStreamSort(sort: StreamSort): StreamSort {
  return (a: Stream, b: Stream, at: BN): number => -sort(a, b, at)
}

export function streamSortByName(a: Stream, b: Stream): number {
  if (a.name < b.name) {
    return -1
  } else if (a.name > b.name) {
    return 1
  } else {
    return 0
  }
}

export const DEFAULT_STREAM_SORT = reverseStreamSortWithoutAt(Stream.compareFnCreatedAt)

const NO_OP_STREAM_SORT_FN = () => -1

export function andStreamSorts(sortFns: StreamSort[]): StreamSort {
  if (sortFns.length === 0) {
    return NO_OP_STREAM_SORT_FN
  } else if (sortFns.length === 1) {
    return sortFns[0]!
  }

  return (a: Stream, b: Stream, at: BN): number => {
    for (const f of sortFns) {
      const res = f(a, b, at)
      if (res !== 0) {
        return res
      }
    }
    return 0
  }
}

export type StreamSortCategory = {
  values: string[]
  setValues: (values: string[]) => void
  options: {
    label: string
    value: string
    sort: StreamSort
  }[]
}
