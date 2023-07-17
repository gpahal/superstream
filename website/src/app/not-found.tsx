import { ErrorComponent } from '@/components/error'

export default function RootNotFoundPage() {
  return <ErrorComponent statusCode={404} homeHref="/" homeLabel="Homepage" />
}
