import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { web3 } from '@coral-xyz/anchor'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import { isUrl } from '@gpahal/std/url'

import { useLocalStorage } from '@/hooks/use-local-storage'

export enum ClusterType {
  MAINNET_BETA = 'Mainnet Beta',
  DEVNET = 'Devnet',
  TESTNET = 'Testnet',
  CUSTOM_RPC_URL = 'Custom RPC URL',
}

export type Cluster = {
  type: ClusterType
  endpoint: string
}

export const MAINNET_BETA_CLUSTER: Cluster = {
  type: ClusterType.MAINNET_BETA,
  endpoint: web3.clusterApiUrl('mainnet-beta'),
}

export const DEVNET_CLUSTER: Cluster = {
  type: ClusterType.DEVNET,
  endpoint: web3.clusterApiUrl('devnet'),
}

export const TESTNET_CLUSTER: Cluster = {
  type: ClusterType.TESTNET,
  endpoint: web3.clusterApiUrl('testnet'),
}

export function createCustomRpcUrlCluster(endpoint: string): Cluster {
  return {
    type: ClusterType.CUSTOM_RPC_URL,
    endpoint,
  }
}

export const LOCALNET_CLUSTER: Cluster = createCustomRpcUrlCluster('http://localhost:8899')

export const DEFAULT_CLUSTER = DEVNET_CLUSTER

export function areClustersEqual(a: Cluster, b: Cluster): boolean {
  return a.type === b.type && a.endpoint === b.endpoint
}

export function getWeb3ClusterNameOrUrl(cluster: Cluster): web3.Cluster | URL {
  switch (cluster.type) {
    case ClusterType.MAINNET_BETA:
      return 'mainnet-beta'
    case ClusterType.DEVNET:
      return 'devnet'
    case ClusterType.TESTNET:
      return 'testnet'
    default:
      return new URL(cluster.endpoint)
  }
}

export function getWalletAdapterNetwork(cluster: Cluster): WalletAdapterNetwork | undefined {
  switch (cluster.type) {
    case ClusterType.MAINNET_BETA:
      return WalletAdapterNetwork.Mainnet
    case ClusterType.DEVNET:
      return WalletAdapterNetwork.Devnet
    case ClusterType.TESTNET:
      return WalletAdapterNetwork.Testnet
    default:
      return undefined
  }
}

export function serializeCluster(cluster: Cluster): string {
  switch (cluster.type) {
    case ClusterType.MAINNET_BETA:
      return 'mainnet-beta'
    case ClusterType.DEVNET:
      return 'devnet'
    case ClusterType.TESTNET:
      return 'testnet'
    default:
      return cluster.endpoint
  }
}

export function deserializeCluster(value?: string | null): Cluster | undefined {
  if (!value) {
    return undefined
  }

  switch (value) {
    case 'mainnet-beta':
      return MAINNET_BETA_CLUSTER
    case 'devnet':
      return DEVNET_CLUSTER
    case 'testnet':
      return TESTNET_CLUSTER
    default:
      return isUrl(value) ? createCustomRpcUrlCluster(value) : undefined
  }
}

export function getClusterDisplayName(cluster: Cluster): string {
  if (cluster.type !== ClusterType.CUSTOM_RPC_URL) {
    return cluster.type
  }
  return `${cluster.type} (${cluster.endpoint})`
}

export enum ClusterStatusType {
  UNKNOWN,
  ERROR,
  SUCCESS,
}

export type ClusterStatus =
  | {
      type: 'unknown'
    }
  | {
      type: 'success'
    }
  | {
      type: 'error'
      reason: string
    }

export const CLUSTER_QUERY_PARAM = 'cluster'

export type ClusterContextValue = {
  cluster: Cluster
  setCluster: (cluster: Cluster) => void
}

const ClusterContext = React.createContext({} as ClusterContextValue)

export type ClusterProviderProps = {
  children: React.ReactNode
}

export function ClusterProvider({ children }: ClusterProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [clusterLocalStorage, setClusterLocalStorage] = useLocalStorage(CLUSTER_QUERY_PARAM, '')

  const cluster = React.useMemo(
    () =>
      deserializeCluster(searchParams.get(CLUSTER_QUERY_PARAM)) ||
      deserializeCluster(clusterLocalStorage) ||
      DEFAULT_CLUSTER,
    [clusterLocalStorage, searchParams],
  )

  const setCluster = React.useCallback(
    (newCluster: Cluster, replace?: boolean) => {
      const serializedCluster = serializeCluster(newCluster)
      setClusterLocalStorage(serializedCluster)

      const newSearchParams = new URLSearchParams(Array.from(searchParams.entries()))
      newSearchParams.set(CLUSTER_QUERY_PARAM, serializedCluster)
      const search = newSearchParams.toString()
      const query = search ? `?${search}` : ''
      const path = `${pathname}${query}`
      if (replace) {
        router.replace(path)
      } else {
        router.push(path)
      }
    },
    [setClusterLocalStorage, searchParams, pathname, router],
  )

  React.useEffect(() => {
    if (serializeCluster(cluster) !== searchParams.get(CLUSTER_QUERY_PARAM)) {
      setCluster(cluster, true)
    }
  }, [cluster, searchParams, setCluster])

  const value = React.useMemo(() => ({ cluster, setCluster }), [cluster, setCluster])

  return <ClusterContext.Provider value={value}>{children}</ClusterContext.Provider>
}

export function useClusterContext(): ClusterContextValue {
  return React.useContext(ClusterContext)
}

export function useCluster(): Cluster {
  return useClusterContext().cluster
}

export function useClusterStatus(): ClusterStatus {
  const cluster = useCluster()
  const [clusterStatus, setClusterStatus] = React.useState<ClusterStatus>({ type: 'unknown' })

  React.useEffect(() => {
    void fetchClusterStatus(cluster).then(setClusterStatus)
  }, [cluster])

  return clusterStatus
}

export async function fetchClusterStatus(cluster: Cluster): Promise<ClusterStatus> {
  const endpoint = cluster.endpoint
  const connection = new web3.Connection(endpoint, 'recent')
  try {
    await connection.getLatestBlockhash()
    return {
      type: 'success',
    }
  } catch (e) {
    console.error('Error fetching cluster status', e)
    return {
      type: 'error',
      reason: `Unable to make request to ${cluster.endpoint}`,
    }
  }
}
