'use client'

import { getErrorMessage } from '@gpahal/std/error'

import { ErrorComponent } from '@/components/error'

export default function RootErrorPage({ error }: { error: Error }) {
  return (
    <ErrorComponent statusCode={500} homeHref="/" homeLabel="Homepage" title={`Error: ${getErrorMessage(error)}`} />
  )
}
