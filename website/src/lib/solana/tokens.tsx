import * as React from 'react'

import { BN } from '@coral-xyz/anchor'
import { ENV, TokenListProvider as TokenListProviderLib, type TokenInfo } from '@solana/spl-token-registry'
import Decimal from 'decimal.js'

import { getErrorMessage } from '@gpahal/std/error'

import { ClusterType, useCluster, type Cluster } from '@/lib/solana/cluster'

const clusterTypeToENV: Map<ClusterType, ENV> = new Map<ClusterType, ENV>([
  [ClusterType.MAINNET_BETA, ENV.MainnetBeta],
  [ClusterType.DEVNET, ENV.Devnet],
  [ClusterType.TESTNET, ENV.Testnet],
])

const LOCAL_TOKENS_MAP = new Map([
  [
    'ACzKYJCSNqMxLXdkoZeejcnvLyvhZWxienqkCs6bjGNS',
    {
      chainId: 101,
      address: 'ACzKYJCSNqMxLXdkoZeejcnvLyvhZWxienqkCs6bjGNS',
      symbol: 'USD',
      name: 'US Dollar',
      decimals: 2,
      tags: ['currency'],
    },
  ],
  [
    '4irR1JLPPgCEtktDAVgUUTrbjsuCQTGKY4EidD7SD76b',
    {
      chainId: 101,
      address: '4irR1JLPPgCEtktDAVgUUTrbjsuCQTGKY4EidD7SD76b',
      symbol: 'USDT',
      name: 'US Dollar Temporary',
      decimals: 2,
      tags: ['currency'],
    },
  ],
])

export class Tokens {
  private readonly tokens: Map<number, Map<string, TokenInfo>>

  constructor(tokenList?: TokenInfo[]) {
    this.tokens = new Map()
    if (tokenList) {
      for (const token of tokenList) {
        let m = this.tokens.get(token.chainId)
        if (!m) {
          m = new Map()
          this.tokens.set(token.chainId, m)
        }
        m.set(token.address, token)
      }
    }
  }

  getClusterTokens(cluster: Cluster): Map<string, TokenInfo> {
    if (cluster.type === ClusterType.CUSTOM_RPC_URL) {
      return LOCAL_TOKENS_MAP
    }

    const env = clusterTypeToENV.get(cluster.type)
    return env ? this.tokens.get(env) || new Map<string, TokenInfo>() : new Map<string, TokenInfo>()
  }
}

async function fetchTokens(cluster: Cluster): Promise<Tokens> {
  const env = clusterTypeToENV.get(cluster.type)
  if (env) {
    const container = await new TokenListProviderLib().resolve()
    return new Tokens(container.filterByChainId(env).getList())
  } else {
    return new Tokens()
  }
}

export type TokensContextValue = {
  isLoading: boolean
  tokens: Tokens
  error: string
  refresh: () => Promise<void>
}

const TokensContext = React.createContext({} as TokensContextValue)

export type TokensProviderProps = {
  children: React.ReactNode
}

export function TokensProvider({ children }: TokensProviderProps) {
  const cluster = useCluster()
  const [state, setState] = React.useState<Omit<TokensContextValue, 'refresh'>>({
    isLoading: true,
    tokens: new Tokens(),
    error: '',
  })

  const loadTokens = React.useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: '',
    }))

    try {
      setState({
        isLoading: false,
        tokens: await fetchTokens(cluster),
        error: '',
      })
    } catch (e) {
      console.error('Unable to load tokens', e)
      setState({
        isLoading: false,
        tokens: new Tokens(),
        error: `Unable to load token list: ${getErrorMessage(e)}`,
      })
    }
  }, [cluster])

  React.useEffect(() => {
    void loadTokens()
  }, [loadTokens])

  const refresh = React.useCallback(async () => {
    await loadTokens()
  }, [loadTokens])

  const value = React.useMemo(() => ({ ...state, refresh }), [state, refresh])

  return <TokensContext.Provider value={value}>{children}</TokensContext.Provider>
}

export function useTokensContext(): TokensContextValue {
  return React.useContext(TokensContext)
}

export function useClusterTokens(): Map<string, TokenInfo> {
  const cluster = useCluster()
  return React.useContext(TokensContext).tokens.getClusterTokens(cluster)
}

export function parseTokenAmount(tokenAmount: string, tokenInfo?: TokenInfo): BN | undefined {
  if (!tokenAmount) {
    return undefined
  }

  try {
    let d = new Decimal(tokenAmount.trim())
    if (tokenInfo) {
      d = d.mul(new Decimal(10).pow(tokenInfo.decimals))
    }
    return new BN(Math.floor(d.floor().toNumber()))
  } catch (e) {
    console.error(`Unable to parse token amount '${tokenAmount}'`, e)
    return undefined
  }
}

export function formatTokenAmount(tokenAmount: BN, tokenInfo?: TokenInfo, withoutSymbol?: boolean): string {
  if (tokenAmount.isZero()) {
    return '0'
  }

  try {
    let d = new Decimal(tokenAmount.toNumber())
    if (tokenInfo) {
      d = d.div(new Decimal(10).pow(tokenInfo.decimals))
      return `${d.toString()}${withoutSymbol ? '' : ` ${tokenInfo.symbol}`}`
    }
    return d.toString()
  } catch (e) {
    console.error(`Unable to format token amount '${tokenAmount.toString()}'`, e)
    return '0'
  }
}
