'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

const DashboardLayoutContent = dynamic(() => import('./dashboard-layout-content'), {
  ssr: false,
})
const DashboardPageContent = dynamic(() => import('./dashboard-page-content'), {
  ssr: false,
})

export function DashboardDynamicPage() {
  return (
    <DashboardLayoutContent>
      <DashboardPageContent />
    </DashboardLayoutContent>
  )
}
