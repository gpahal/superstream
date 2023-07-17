import * as React from 'react'

import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'

export function useEventCallback<Args extends unknown[], R>(fn: (...args: Args) => R) {
  const ref = React.useRef<typeof fn>(() => {
    throw new Error('Cannot call an event handler while rendering')
  })

  useIsomorphicLayoutEffect(() => {
    ref.current = fn
  }, [fn])

  return React.useCallback((...args: Args) => ref.current(...args), [ref])
}
