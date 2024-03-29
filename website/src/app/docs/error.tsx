'use client'

import { getErrorMessage } from '@gpahal/std/error'

import { ErrorComponent } from '@/components/error'

export default function DashboardErrorPage({ error }: { error: Error }) {
  return (
    <ErrorComponent
      statusCode={500}
      homeHref="/docs"
      homeLabel="Documentation"
      title={`Error: ${getErrorMessage(error)}`}
    />
  )
}
