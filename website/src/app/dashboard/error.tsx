'use client'

import { getErrorMessage } from '@gpahal/std/error'

import { ErrorComponent } from '@/components/error'

export default function DashboardErrorPage({ error }: { error: Error }) {
  return (
    <ErrorComponent
      statusCode={500}
      homeHref="/dashboard"
      homeLabel="Dashboard"
      title={`Error: ${getErrorMessage(error)}`}
    />
  )
}
