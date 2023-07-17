import * as React from 'react'

import { createSuperstreamClient, SuperstreamClient } from '@superstream/client'

import { getWeb3ClusterNameOrUrl, useCluster } from '@/lib/solana/cluster'
import { useSignerWallet } from '@/lib/solana/wallet'

export type SuperstreamClientContextValue = {
  client?: SuperstreamClient
}

const SuperstreamClientContext = React.createContext({} as SuperstreamClientContextValue)

export type SuperstreamClientProviderProps = {
  children: React.ReactNode
}

export function SuperstreamClientProvider({ children }: SuperstreamClientProviderProps) {
  const cluster = useCluster()
  const wallet = useSignerWallet()
  const client = React.useMemo(
    () => (wallet ? createSuperstreamClient(getWeb3ClusterNameOrUrl(cluster), wallet) : undefined),
    [cluster, wallet],
  )

  const value = React.useMemo(() => ({ client }), [client])

  return <SuperstreamClientContext.Provider value={value}>{children}</SuperstreamClientContext.Provider>
}

export function useSuperstreamClient(): SuperstreamClient | undefined {
  return React.useContext(SuperstreamClientContext).client
}
