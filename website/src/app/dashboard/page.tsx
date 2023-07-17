import * as React from 'react'
import { Metadata } from 'next'

import { generatePageMetadata } from '@/lib/metadata'

import { DashboardPageContent } from './dashboard-page-content'

export const runtime = 'edge'

export const metadata: Metadata = generatePageMetadata({
  pathname: '/dashboard',
  title: 'Superstream Dashboard',
  description: 'Manage all your real-time payment streams in one place and create new ones in less than 2 mins',
  imagePath: '/dashboard?v=2',
})

export default function DashboardPage() {
  return <DashboardPageContent />
}
