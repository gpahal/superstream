import * as React from 'react'

import { WalletAdapter } from '@/lib/solana/wallet'

export type WalletAdapterImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  adapter: WalletAdapter
}

export function WalletAdapterImage({ adapter, ...props }: WalletAdapterImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return adapter.icon ? <img src={adapter.icon} alt={`${adapter.name} icon`} {...props} /> : null
}
