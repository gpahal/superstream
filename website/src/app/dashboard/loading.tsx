import { Spinner } from '@/components/lib/spinner'

export default function DashboardLoadingPage() {
  return (
    <div className="mt-10 flex w-full items-center justify-center">
      <Spinner />
    </div>
  )
}
