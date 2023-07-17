import * as React from 'react'

import { BN } from '@coral-xyz/anchor'

import { formatDurationSeconds, formatTimeFromMillis, parseCountAndTimePeriodToMillis, TimePeriod } from '@/lib/date'
import { useSuperstreamClient } from '@/lib/solana/superstream'
import { useInterval } from '@/hooks/use-interval'

export function getCurrentTimeInBn(): BN {
  return convertTimeInMillisToBnSecs(Date.now())
}

export function convertTimeInMillisToBnSecs(millis: number): BN {
  return new BN(Math.floor(millis / 1000))
}

export function parseCountAndTimePeriodToBnSeconds(count: number, timePeriod: TimePeriod): BN {
  const millis = parseCountAndTimePeriodToMillis(count, timePeriod)
  return convertTimeInMillisToBnSecs(millis)
}

export function formatDurationFromBnSeconds(secs: BN): string {
  return formatDurationSeconds(secs.toNumber())
}

export function formatTimeFromBnSeconds(t: BN): string {
  return formatTimeFromMillis(t.toNumber() * 1000)
}

export type OnChainTimeContextValue = {
  onChainTime?: BN
  refreshOnChainTime: () => Promise<void>
}

const OnChainTimeContext = React.createContext({} as OnChainTimeContextValue)

export type OnChainTimeProviderProps = {
  onChainTimeRefreshDelay?: number
  computedOnChainTimeRefreshDelay?: number
  children: React.ReactNode
}

export function OnChainTimeProvider({
  onChainTimeRefreshDelay = 60000,
  computedOnChainTimeRefreshDelay = 1000,
  children,
}: OnChainTimeProviderProps) {
  const [localTime, setLocalTime] = React.useState(Date.now())
  const [fetchedOnChainTime, setFetchedOnChainTime] = React.useState<BN | undefined>(undefined)
  const [onChainTime, setOnChainTime] = React.useState<BN | undefined>(undefined)
  const client = useSuperstreamClient()

  const refreshOnChainTime = React.useCallback(async () => {
    if (!client) {
      return
    }

    try {
      const newTime = await client.getCurrentTime()
      setLocalTime(Date.now())
      setFetchedOnChainTime(newTime)
      setOnChainTime(newTime)
    } catch (e) {
      console.error('Error fetching current on-chain time', e)
      setLocalTime(Date.now())
      setFetchedOnChainTime(undefined)
      setOnChainTime(undefined)
    }
  }, [client])

  const refreshOnChainTimeSync = React.useCallback(() => {
    void refreshOnChainTime()
  }, [refreshOnChainTime])

  const refreshComputedOnChainTime = React.useCallback(() => {
    setOnChainTime(
      fetchedOnChainTime ? fetchedOnChainTime.add(convertTimeInMillisToBnSecs(Date.now() - localTime)) : undefined,
    )
  }, [localTime, fetchedOnChainTime])

  React.useEffect(refreshOnChainTimeSync, [refreshOnChainTimeSync])

  useInterval(refreshOnChainTimeSync, onChainTimeRefreshDelay)
  useInterval(refreshComputedOnChainTime, computedOnChainTimeRefreshDelay)

  const value = React.useMemo(() => ({ onChainTime, refreshOnChainTime }), [onChainTime, refreshOnChainTime])

  return <OnChainTimeContext.Provider value={value}>{children}</OnChainTimeContext.Provider>
}

export function useOnChainTimeContext(): OnChainTimeContextValue {
  return React.useContext(OnChainTimeContext)
}
