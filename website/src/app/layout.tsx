import * as React from 'react'
import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/react'

import { monoFont, sansSerifFont } from '@/lib/fonts'
import { WEBSITE_URL } from '@/lib/metadata'
import { cn } from '@/lib/styles'
import { Toaster } from '@/components/lib/toaster'

import { RootProviders } from './root-providers'
import { RootScripts } from './root-scripts'

import '@/styles/global.css'

export const metadata: Metadata = {
  metadataBase: WEBSITE_URL,
  applicationName: 'Superstream',
  appleWebApp: {
    capable: true,
    title: 'Superstream',
  },
  manifest: '/metadata/site.webmanifest',
  themeColor: '#ffffff',
  icons: [
    {
      rel: 'shortcut icon',
      type: 'image/svg+xml',
      url: '/metadata/favicon.svg',
    },
    {
      rel: 'shortcut icon',
      type: 'image/x-icon',
      url: '/metadata/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/metadata/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/metadata/favicon-16x16.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/metadata/apple-touch-icon.png',
    },
    {
      rel: 'mask-icon',
      type: 'image/svg+xml',
      url: '/metadata/safari-pinned-tab.svg',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      color: '#30a46e',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <RootScripts />
      </head>
      <RootProviders>
        <body className={cn(sansSerifFont.variable, monoFont.variable)} suppressHydrationWarning>
          <main>{children}</main>
          <Toaster />
          <Analytics />
        </body>
      </RootProviders>
    </html>
  )
}
