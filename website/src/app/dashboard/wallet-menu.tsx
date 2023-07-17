import * as React from 'react'

import { shortenPublicKeyBase58, useWalletContext, Wallet } from '@/lib/solana/wallet'
import { useToastContext } from '@/components/lib/toast'

export type WalletAction = {
  label: string
  onClick: () => void | Promise<void>
}

export type WalletMenuProps = {
  children: (props: {
    wallet: Wallet
    shortenedWalletAddress: string
    walletActions: WalletAction[]
  }) => React.ReactNode
}

export function WalletMenu({ children }: WalletMenuProps) {
  const { addToast } = useToastContext()

  const { wallet, disconnect } = useWalletContext()

  const walletAddress = React.useMemo(() => wallet?.publicKey.toBase58(), [wallet?.publicKey])
  const shortenedWalletAddress = React.useMemo(
    () => (walletAddress ? shortenPublicKeyBase58(walletAddress) : undefined),
    [walletAddress],
  )

  const copyWalletAddress = React.useCallback(async () => {
    if (walletAddress) {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(walletAddress)
        addToast({ title: 'Copied address successfully' })
      } else {
        addToast({ title: `Wallet address: ${walletAddress}` })
      }
    }
  }, [addToast, walletAddress])

  const walletActions: WalletAction[] = React.useMemo(
    () => [
      { label: 'Copy address', onClick: copyWalletAddress },
      { label: 'Disconnect', onClick: disconnect },
    ],
    [copyWalletAddress, disconnect],
  )

  if (!wallet || !shortenedWalletAddress) {
    return null
  }

  return children({
    wallet,
    shortenedWalletAddress,
    walletActions,
  })
}
