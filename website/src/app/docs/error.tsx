'use client'

import { ErrorComponent } from '@/components/error'

export default function DocsErrorPage() {
  return <ErrorComponent statusCode={500} homeHref="/docs" homeLabel="Documentation" />
}
