import * as React from 'react'

import { AnchorProvider, IdlAccounts, web3 } from '@coral-xyz/anchor'
import { SPL_TOKEN_PROGRAM_ID, splTokenProgram } from '@coral-xyz/spl-token'
import { TokenInfo } from '@solana/spl-token-registry'

import { Cluster, useCluster } from '@/lib/solana/cluster'
import { Tokens, useTokensContext } from '@/lib/solana/tokens'
import { SignerWallet, useSignerWallet } from '@/lib/solana/wallet'

export type SplTokenProgram = ReturnType<typeof splTokenProgram>
export type SplToken = SplTokenProgram['idl']
export type TokenAccount = IdlAccounts<SplToken>['account']

const knownTokenSymbols = [
  'SOL',
  'USDC',
  'usdt',
  'USDT',
  'wUSDT_v1',
  'soUSDT',
  'USDTet',
  'aeUSDT',
  'USDTpo',
  'apUSDT',
  'USDTav',
  'aaUSDT',
  'USDTbs',
  'abUSDT',
  'ahUSDT',
  'sUSDT-9',
  'sUSDT-8',
  'tUSDT',
]

function getTokenSymbolRank(tokenInfo: TokenInfo): number {
  return knownTokenSymbols.indexOf(tokenInfo.symbol) + 1
}

export class TokenAccountDetails {
  readonly publicKey: web3.PublicKey
  readonly data: TokenAccount
  readonly tokenInfo?: TokenInfo

  constructor(publicKey: web3.PublicKey, data: TokenAccount, tokenInfo?: TokenInfo) {
    this.publicKey = publicKey
    this.data = data
    this.tokenInfo = tokenInfo
  }

  static compareFn(a: TokenAccountDetails, b: TokenAccountDetails): number {
    if (a.data.mint.equals(b.data.mint)) {
      return 0
    }

    if (a.tokenInfo && b.tokenInfo) {
      const rankA = getTokenSymbolRank(a.tokenInfo)
      const rankB = getTokenSymbolRank(b.tokenInfo)
      if (rankA && rankB) {
        if (rankA < rankB) {
          return -1
        } else {
          return 1
        }
      } else if (rankB) {
        return 1
      } else {
        return -1
      }
    } else if (!b.tokenInfo) {
      return -1
    } else {
      return 1
    }
  }
}

async function fetchTokenAccountDetails(
  cluster: Cluster,
  tokens: Tokens,
  wallet: SignerWallet,
  connection: web3.Connection,
): Promise<TokenAccountDetails[]> {
  const provider = new AnchorProvider(connection, wallet, {})
  const coder = splTokenProgram({ provider }).coder

  const rawTokenAccounts = (
    await connection.getTokenAccountsByOwner(wallet.publicKey, { programId: SPL_TOKEN_PROGRAM_ID })
  ).value
  if (!rawTokenAccounts || rawTokenAccounts.length === 0) {
    return []
  }

  const m = tokens.getClusterTokens(cluster)
  if (!m || m.size === 0) {
    return rawTokenAccounts.map(
      (account) =>
        new TokenAccountDetails(account.pubkey, coder.accounts.decode<TokenAccount>('account', account.account.data)),
    )
  }

  const tokenAccounts = rawTokenAccounts.map((account) => ({
    publicKey: account.pubkey,
    data: coder.accounts.decode<TokenAccount>('account', account.account.data),
  }))

  return tokenAccounts.map((account) => {
    const address = account.data.mint.toString()
    const token = m.get(address)
    return new TokenAccountDetails(account.publicKey, account.data, token)
  })
}

export type TokenAccountsContextValue = {
  isLoading: boolean
  tokenAccounts: TokenAccountDetails[]
  error: string
  refresh: () => Promise<void>
}

const TokenAccountsContext = React.createContext({} as TokenAccountsContextValue)

export type TokenAccountsProviderProps = {
  children: React.ReactNode
}

export function TokenAccountsProvider({ children }: TokenAccountsProviderProps) {
  const cluster = useCluster()
  const { isLoading: isTokensLoading, tokens } = useTokensContext()
  const wallet = useSignerWallet()
  const [state, setState] = React.useState<Omit<TokenAccountsContextValue, 'refresh'>>({
    isLoading: true,
    tokenAccounts: [],
    error: '',
  })

  const connection = React.useMemo(() => new web3.Connection(cluster.endpoint), [cluster])

  const loadTokens = React.useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }))

    if (!wallet || isTokensLoading) {
      return
    }

    try {
      const tokenAccounts = await fetchTokenAccountDetails(cluster, tokens, wallet, connection)
      tokenAccounts.sort(TokenAccountDetails.compareFn)

      setState({
        isLoading: false,
        tokenAccounts,
        error: '',
      })
    } catch (e) {
      console.error('Unable to load token accounts', e)
      setState({
        isLoading: false,
        tokenAccounts: [],
        error: `Unable to load token accounts${e instanceof Error ? `: ${e.message}` : ''}`,
      })
    }
  }, [cluster, isTokensLoading, tokens, wallet, connection])

  React.useEffect(() => {
    void loadTokens()
  }, [loadTokens])

  const refresh = React.useCallback(async () => {
    await loadTokens()
  }, [loadTokens])

  const value = React.useMemo(() => ({ ...state, refresh }), [state, refresh])

  return <TokenAccountsContext.Provider value={value}>{children}</TokenAccountsContext.Provider>
}

export function useTokenAccountsContext(): TokenAccountsContextValue {
  return React.useContext(TokenAccountsContext)
}
