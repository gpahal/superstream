import { web3 } from '@coral-xyz/anchor'

export enum Cluster {
  MAINNET_BETA = 'mainnet-beta',
  DEVNET = 'devnet',
  TESTNET = 'testnet',
  LOCALNET = 'localnet',
}

export const DEFAULT_CLUSTER = Cluster.DEVNET

export function parseCluster(clusterStr?: unknown): Cluster {
  if (clusterStr == null) {
    return DEFAULT_CLUSTER
  } else if (typeof clusterStr !== 'string') {
    throw new Error(`Invalid cluster: '${String(clusterStr)}'`)
  }

  switch (clusterStr) {
    case Cluster.MAINNET_BETA:
      return Cluster.MAINNET_BETA
    case Cluster.DEVNET:
      return Cluster.DEVNET
    case Cluster.TESTNET:
      return Cluster.TESTNET
    case Cluster.LOCALNET:
      return Cluster.LOCALNET
  }
  throw new Error(`Invalid cluster: '${clusterStr}'`)
}

export function clusterToWeb3Cluster(cluster: Cluster): web3.Cluster | URL {
  switch (cluster) {
    case Cluster.MAINNET_BETA:
      return 'mainnet-beta'
    case Cluster.DEVNET:
      return 'devnet'
    case Cluster.TESTNET:
      return 'testnet'
    case Cluster.LOCALNET:
      return new URL('http://localhost:8899')
    default:
      throw new Error('Invalid cluster')
  }
}
