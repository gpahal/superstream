import * as React from 'react'

import { useInterval } from '@/hooks/use-interval'

export function useCurrentTime(refreshDelay = 1000): number {
  const [currentTime, setCurrentTime] = React.useState(Date.now())
  const refreshCurrentTime = React.useCallback(() => setCurrentTime(Date.now()), [])
  useInterval(refreshCurrentTime, refreshDelay)
  return currentTime
}
