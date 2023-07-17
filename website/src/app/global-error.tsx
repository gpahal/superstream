'use client'

import { getErrorMessage } from '@gpahal/std/error'
import { Analytics } from '@vercel/analytics/react'

import { monoFont, sansSerifFont } from '@/lib/fonts'
import { cn } from '@/lib/styles'
import { ErrorComponent } from '@/components/error'

import { RootProviders } from './root-providers'
import { RootScripts } from './root-scripts'

export default function RootErrorPage({ error }: { error: Error }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <RootScripts />
      </head>
      <RootProviders>
        <body className={cn(sansSerifFont.variable, monoFont.variable)} suppressHydrationWarning>
          <main>
            <ErrorComponent
              statusCode={500}
              homeHref="/"
              homeLabel="Homepage"
              title={`Error: ${getErrorMessage(error)}`}
            />
          </main>
          <Analytics />
        </body>
      </RootProviders>
    </html>
  )
}
