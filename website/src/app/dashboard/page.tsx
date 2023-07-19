import * as React from 'react'
import type { Metadata } from 'next'

import { generatePageMetadata } from '@/lib/metadata'

import { DashboardDynamicPage } from './dashboard-dynamic-page'

export const runtime = 'edge'

export const metadata: Metadata = generatePageMetadata({
  pathname: '/dashboard',
  title: 'Superstream Dashboard',
  description: 'Manage all your real-time payment streams in one place and create new ones in less than 2 mins',
  imagePath: '/dashboard?v=5',
})

export default function DashboardPage() {
  return <DashboardDynamicPage />
}
