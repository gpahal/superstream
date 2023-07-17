import * as React from 'react'

import { web3 } from '@coral-xyz/anchor'
import { getErrorMessage } from '@gpahal/std/error'
import { shorten } from '@gpahal/std/string'
import {
  Adapter,
  MessageSignerWalletAdapter as MessageSignerWalletAdapterLib,
  SignerWalletAdapter as SignerWalletAdapterLib,
  WalletError,
  WalletName,
  WalletReadyState,
} from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  useWallet as useWalletLib,
  WalletProvider as WalletProviderLib,
} from '@solana/wallet-adapter-react'

import { useCluster } from '@/lib/solana/cluster'
import { useToastContext } from '@/components/lib/toast'

export class WalletNotFoundError extends WalletError {
  override name = 'WalletNotFoundError'

  constructor(walletName: WalletName, error: unknown) {
    super(`${walletName} wallet not found`, error)
  }
}

export class WalletConnectError extends WalletError {
  override name = 'WalletConnectError'

  constructor(walletName: WalletName, error: unknown) {
    super(`Unable to connect to ${walletName} wallet`, error)
  }
}

export type WalletConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting'

export type WalletAdapter = Adapter

export type Wallet = Omit<Adapter, 'publicKey'> & {
  publicKey: web3.PublicKey
}
export type SignerWallet = Omit<SignerWalletAdapterLib, 'publicKey'> & {
  publicKey: web3.PublicKey
}
export type MessageSignerWallet = Omit<MessageSignerWalletAdapterLib, 'publicKey'> & {
  publicKey: web3.PublicKey
}

export type WalletContextBaseValue = {
  adapters: {
    installed: WalletAdapter[]
    loadable: WalletAdapter[]
    notDetected: WalletAdapter[]
  }

  connect: (walletName: WalletName) => void
  disconnect: () => Promise<void>
}

export type WalletContextValue = WalletContextBaseValue &
  (
    | {
        connectionStatus: 'connected'
        wallet: Wallet
      }
    | {
        connectionStatus: Exclude<WalletConnectionStatus, 'connected'>
        wallet: undefined
      }
  )

const WalletContext = React.createContext({} as WalletContextValue)

export type WalletProviderProps = {
  children: React.ReactNode
}

export function WalletProvider(props: WalletProviderProps) {
  const { addToast } = useToastContext()

  const cluster = useCluster()
  const wallets = React.useMemo(() => [], [])

  const onError = React.useCallback(
    (error: WalletError) => {
      addToast({
        variant: 'error',
        title: error.message,
        description: error.error ? getErrorMessage(error.error) : undefined,
      })
    },
    [addToast],
  )

  return (
    <ConnectionProvider endpoint={cluster.endpoint}>
      <WalletProviderLib wallets={wallets} onError={onError}>
        <WalletProviderInternal onError={onError} {...props} />
      </WalletProviderLib>
    </ConnectionProvider>
  )
}

export type WalletProviderInternalProps = WalletProviderProps & {
  onError: (error: WalletError) => void
}

function WalletProviderInternal({ onError, children }: WalletProviderInternalProps) {
  const {
    wallets: walletsLib,
    wallet: walletLib,
    publicKey,
    select: selectLib,
    connect: connectLib,
    disconnect: disconnectLib,
  } = useWalletLib()

  const [connectionStatus, setConnectionStatus] = React.useState<WalletConnectionStatus>(
    walletLib ? 'connecting' : 'disconnected',
  )

  const adapters = React.useMemo(() => {
    const installed: WalletAdapter[] = []
    const loadable: WalletAdapter[] = []
    const notDetected: WalletAdapter[] = []

    for (const wallet of walletsLib) {
      if (wallet.readyState === WalletReadyState.Installed) {
        installed.push(wallet.adapter)
      } else if (wallet.readyState === WalletReadyState.Loadable) {
        loadable.push(wallet.adapter)
      } else if (wallet.readyState === WalletReadyState.NotDetected) {
        notDetected.push(wallet.adapter)
      }
    }

    return { installed, loadable, notDetected }
  }, [walletsLib])

  const walletAndConnectionStatus:
    | {
        connectionStatus: 'connected'
        wallet: Wallet
      }
    | {
        connectionStatus: Exclude<WalletConnectionStatus, 'connected'>
        wallet: undefined
      } = React.useMemo(() => {
    if (connectionStatus === 'connected') {
      if (walletLib?.adapter && publicKey) {
        return {
          connectionStatus: 'connected',
          wallet: walletLib.adapter as Wallet,
        }
      } else {
        return {
          connectionStatus: 'connecting',
          wallet: undefined,
        }
      }
    } else {
      return {
        connectionStatus,
        wallet: undefined,
      }
    }
  }, [connectionStatus, publicKey, walletLib?.adapter])

  const connect = React.useCallback(
    (walletName: WalletName) => {
      setConnectionStatus('connecting')
      try {
        const wallet = walletsLib.find((wallet) => wallet.adapter.name === walletName)
        if (wallet == null) {
          if (onError) {
            onError(new WalletNotFoundError(walletName, undefined))
          }
          throw new Error(`${walletName} wallet not found`)
        }
        selectLib(walletName)
      } catch (e) {
        setConnectionStatus('disconnected')
      }
    },
    [onError, selectLib, walletsLib],
  )

  const connectOnSelection = React.useCallback(async () => {
    if (connectionStatus === 'connecting' && walletLib) {
      try {
        await connectLib()
        setConnectionStatus('connected')
      } catch (e) {
        if (onError) {
          onError(new WalletConnectError(walletLib.adapter.name, e))
        }
        setConnectionStatus('disconnected')
      }
    }
  }, [connectLib, connectionStatus, onError, walletLib])

  React.useEffect(() => {
    void connectOnSelection()
  }, [connectOnSelection])

  const disconnect = React.useCallback(async () => {
    setConnectionStatus('disconnecting')
    try {
      await disconnectLib()
      selectLib(null)
    } catch {
      // ignore
    } finally {
      setConnectionStatus('disconnected')
    }
  }, [disconnectLib, selectLib])

  const value = React.useMemo(
    () => ({
      adapters,
      ...walletAndConnectionStatus,
      connect,
      disconnect,
    }),
    [adapters, walletAndConnectionStatus, connect, disconnect],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWalletContext(): WalletContextValue {
  return React.useContext(WalletContext)
}

export function useWallet(): Wallet | undefined {
  return React.useContext(WalletContext).wallet
}

export function useSignerWallet(): SignerWallet | undefined {
  const wallet = useWallet()
  return isSignerWallet(wallet) ? wallet : undefined
}

export function useMessageSignerWallet(): MessageSignerWallet | undefined {
  const wallet = useWallet()
  return isMessageSignerWallet(wallet) ? wallet : undefined
}

function isSignerWallet(wallet?: Wallet | null): wallet is SignerWallet {
  return (
    wallet != null &&
    'signTransaction' in wallet &&
    wallet.signTransaction != null &&
    'signAllTransactions' in wallet &&
    wallet.signAllTransactions != null
  )
}

function isMessageSignerWallet(wallet?: Wallet | null): wallet is MessageSignerWallet {
  return wallet != null && 'signMessage' in wallet && wallet.signMessage != null
}

export function shortenPublicKeyBase58(base58: string): string {
  return shorten(base58)
}

export function shortenPublicKey(publicKey: web3.PublicKey): string {
  return shortenPublicKeyBase58(publicKey.toBase58())
}
