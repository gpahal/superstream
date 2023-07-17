'use client'

import { ThemeProvider } from '@/contexts/theme'
import { WindowViewportProvider } from '@/contexts/window-viewport-context'

export type RootProvidersProps = {
  children: React.ReactNode
}

export function RootProviders({ children }: RootProvidersProps) {
  return (
    <WindowViewportProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </WindowViewportProvider>
  )
}
