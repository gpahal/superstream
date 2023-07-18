import * as React from 'react'
import { Metadata } from 'next'

import { generatePageMetadata } from '@/lib/metadata'

import { DashboardCreateDynamicPage } from './dashboard-create-dynamic-page'

export const runtime = 'edge'

export const metadata: Metadata = generatePageMetadata({
  pathname: '/dashboard/create',
  title: 'Create a new stream - Superstream Dashboard',
  description: 'Create a new real-time payment stream in less than 2 mins powered',
  imagePath: '/dashboard/create?v=5',
})

export default function DashboardCreatePage() {
  return <DashboardCreateDynamicPage />
}
