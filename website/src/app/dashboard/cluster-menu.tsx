import * as React from 'react'

import {
  DEVNET_CLUSTER,
  LOCALNET_CLUSTER,
  serializeCluster,
  TESTNET_CLUSTER,
  useClusterContext,
  useClusterStatus,
  type Cluster,
  type ClusterStatus,
} from '@/lib/solana/cluster'
import { useToastContext } from '@/components/lib/toast'

export type ClusterConfig = {
  label: string
  cluster: Cluster
  serialized: string
}

const CLUSTER_CONFIGS: ClusterConfig[] = [
  { label: 'Devnet', cluster: DEVNET_CLUSTER, serialized: serializeCluster(DEVNET_CLUSTER) },
  { label: 'Testnet', cluster: TESTNET_CLUSTER, serialized: serializeCluster(TESTNET_CLUSTER) },
  { label: 'Localnet', cluster: LOCALNET_CLUSTER, serialized: serializeCluster(LOCALNET_CLUSTER) },
]

export type ClusterMenuProps = {
  children: (props: {
    clusterConfigs: ClusterConfig[]
    clusterConfig: ClusterConfig
    setClusterConfig: (newClusterConfig: ClusterConfig) => void
    clusterStatus: ClusterStatus
  }) => React.ReactNode
}

export function ClusterMenu({ children }: ClusterMenuProps) {
  const { addToast } = useToastContext()

  const { cluster, setCluster } = useClusterContext()
  const clusterStatus = useClusterStatus()
  const serializedCluster = React.useMemo(() => serializeCluster(cluster), [cluster])
  const clusterConfig = React.useMemo(
    () => CLUSTER_CONFIGS.find((cc) => serializedCluster === cc.serialized) || CLUSTER_CONFIGS[0]!,
    [serializedCluster],
  )

  const setClusterConfig = React.useCallback(
    (newClusterConfig: ClusterConfig) => {
      setCluster(newClusterConfig.cluster)
      addToast({ title: `Changed cluster to: ${newClusterConfig.label}` })
    },
    [setCluster, addToast],
  )

  return children({
    clusterConfigs: CLUSTER_CONFIGS,
    clusterConfig,
    setClusterConfig,
    clusterStatus,
  })
}
