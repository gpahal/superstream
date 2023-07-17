import * as React from 'react'

import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'

export function useInterval(callback: () => void | Promise<void>, delay: number | null) {
  const savedCallback = React.useRef(callback)

  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])

  React.useEffect(() => {
    if (!delay && delay !== 0) {
      return
    }

    const id = setInterval((() => savedCallback.current()) as () => void, delay)
    return () => clearInterval(id)
  }, [delay])
}
