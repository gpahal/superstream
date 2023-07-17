import { ErrorComponent } from '@/components/error'

export default function DashboardNotFoundPage() {
  return <ErrorComponent statusCode={404} homeHref="/dashboard" homeLabel="Dashboard" />
}
