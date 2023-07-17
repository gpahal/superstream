import { ErrorComponent } from '@/components/error'

export default function DocsNotFoundPage() {
  return <ErrorComponent statusCode={404} homeHref="/docs" homeLabel="Documentation" />
}
