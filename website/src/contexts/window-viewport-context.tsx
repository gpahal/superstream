'use client'

import * as React from 'react'

import { isBrowser } from '@/lib/env'

export type Viewport = {
  width: number
  height: number
  pageLeft: number
  pageTop: number
  scale: number
}

function getZeroViewport(): Viewport {
  return {
    width: 0,
    height: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1,
  }
}

type WindowViewportContextValue = {
  viewport: Viewport
}

const WindowViewportContext = React.createContext({} as WindowViewportContextValue)

export type WindowViewportProviderProps = {
  children: React.ReactNode
}

export function WindowViewportProvider({ children }: WindowViewportProviderProps) {
  const [viewport, setViewport] = React.useState(getZeroViewport())

  const updateWindowViewport = React.useCallback(() => {
    const newViewport = getWindowViewport()
    setViewport(newViewport)
  }, [])

  React.useEffect(() => {
    updateWindowViewport()

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateWindowViewport)
      window.visualViewport.addEventListener('scroll', updateWindowViewport)
    }
    window.addEventListener('resize', updateWindowViewport)
    window.addEventListener('scroll', updateWindowViewport)

    window.addEventListener('touchmove', updateWindowViewport)
    window.addEventListener('touchend', updateWindowViewport)

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateWindowViewport)
        window.visualViewport.removeEventListener('scroll', updateWindowViewport)
      }
      window.removeEventListener('resize', updateWindowViewport)
      window.removeEventListener('scroll', updateWindowViewport)

      window.removeEventListener('touchmove', updateWindowViewport)
      window.removeEventListener('touchend', updateWindowViewport)
    }
  }, [updateWindowViewport])

  const value = React.useMemo(
    () => ({ viewport }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewport.width, viewport.height, viewport.pageLeft, viewport.pageTop, viewport.scale],
  )

  return <WindowViewportContext.Provider value={value}>{children}</WindowViewportContext.Provider>
}

export function useWindowViewportContext() {
  return React.useContext(WindowViewportContext)
}

export function useWindowViewport() {
  return useWindowViewportContext().viewport
}

function getWindowViewport(): Viewport {
  return isBrowser
    ? {
        width: window.visualViewport?.width || window.innerWidth,
        height: window.visualViewport?.height || window.innerHeight,
        pageLeft: window.visualViewport?.pageLeft || window.scrollX,
        pageTop: window.visualViewport?.pageTop || window.scrollY,
        scale: window.visualViewport?.scale || 1,
      }
    : getZeroViewport()
}
