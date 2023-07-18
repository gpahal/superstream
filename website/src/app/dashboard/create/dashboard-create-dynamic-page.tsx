'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

const DashboardLayoutContent = dynamic(() => import('../dashboard-layout-content'), {
  ssr: false,
})
const DashboardCreatePageContent = dynamic(() => import('./dashboard-create-page-content'), {
  ssr: false,
})

export function DashboardCreateDynamicPage() {
  return (
    <DashboardLayoutContent>
      <DashboardCreatePageContent />
    </DashboardLayoutContent>
  )
}
