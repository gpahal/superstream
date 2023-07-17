'use client'

import * as React from 'react'

import { ChevronDownIcon } from 'lucide-react'

import { useWalletContext, WalletAdapter } from '@/lib/solana/wallet'
import { cn } from '@/lib/styles'
import { useDisclosure } from '@/hooks/use-disclosure'
import { Button } from '@/components/lib/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/lib/collapsible'

import { WalletAdapterImage } from './wallet-adapter-image'

export function ConnectWallet() {
  const { adapters, connect } = useWalletContext()

  const [installedAdapters, otherAdapters] = React.useMemo(() => {
    return [adapters.installed, [...adapters.loadable, ...adapters.notDetected]]
  }, [adapters])

  const getStartedAdapter = React.useMemo(() => {
    return installedAdapters.length > 0
      ? installedAdapters[0]!
      : otherAdapters.length > 0
      ? otherAdapters[0]!
      : undefined
  }, [installedAdapters, otherAdapters])

  return (
    <div className="mx-auto mt-4 max-w-lg">
      <h1 className="text-center text-2xl font-semibold sm:text-3xl">
        {installedAdapters.length > 0
          ? 'Connect a Solana wallet to continue'
          : "You'll need a Solana wallet to continue"}
      </h1>
      {installedAdapters.length > 0 ? (
        <div className="mx-auto mt-8 flex max-w-md flex-col items-center">
          <WalletAdapterList installedAdapters={installedAdapters} otherAdapters={otherAdapters} />
        </div>
      ) : (
        <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-center">
          <div className="mb-6 flex w-full flex-col items-center">
            <WalletLogo />
            <Button
              variant="primary"
              size="xl"
              className="mt-10 w-full max-w-xs"
              onClick={() => {
                if (getStartedAdapter) {
                  connect(getStartedAdapter.name)
                } else if (window) {
                  window.open('https://phantom.app/', '_blank')
                }
              }}
            >
              Get started
            </Button>
          </div>
          <WalletAdapterList otherAdapters={otherAdapters} />
        </div>
      )}
    </div>
  )
}

type WalletAdapterListProps = {
  installedAdapters?: WalletAdapter[]
  otherAdapters: WalletAdapter[]
}

function WalletAdapterList({ installedAdapters, otherAdapters }: WalletAdapterListProps) {
  const { isOpen, setIsOpen } = useDisclosure()

  return (!installedAdapters || installedAdapters.length === 0) && otherAdapters.length === 0 ? null : (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mx-auto my-0.5 w-full max-w-sm overflow-hidden rounded-lg bg-bg text-fg shadow-sm ring-1 ring-inset ring-neutral-6"
    >
      {installedAdapters && installedAdapters.length > 0 ? (
        <div className="flex w-full flex-col gap-3">
          <ul className="w-full">
            {installedAdapters.map((adapter) => (
              <WalletAdapterListItem key={adapter.name} adapter={adapter} isInstalled={true} />
            ))}
            <CollapsibleContent>
              {otherAdapters.map((adapter) => (
                <WalletAdapterListItem key={adapter.name} adapter={adapter} />
              ))}
            </CollapsibleContent>
          </ul>
          {otherAdapters.length > 0 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <span className="mr-1 text-sm">{`${isOpen ? 'Less' : 'More'} options`}</span>
                <ChevronDownIcon
                  className={cn('ml-1 h-4 w-4 transition-transform', isOpen && 'rotate-180 transform')}
                />
              </Button>
            </CollapsibleTrigger>
          )}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <span className="mr-1 text-sm">{`${isOpen ? 'Hide' : 'Already have a wallet? View'} options`}</span>
              <ChevronDownIcon className={cn('ml-1 h-4 w-4 transition-transform', isOpen && 'rotate-180 transform')} />
            </Button>
          </CollapsibleTrigger>
          <ul className="w-full">
            <CollapsibleContent>
              {otherAdapters.map((adapter) => (
                <WalletAdapterListItem key={adapter.name} adapter={adapter} />
              ))}
            </CollapsibleContent>
          </ul>
        </div>
      )}
    </Collapsible>
  )
}

type WalletAdapterListItemProps = {
  adapter: WalletAdapter
  isInstalled?: boolean
}

function WalletAdapterListItem({ adapter, isInstalled }: WalletAdapterListItemProps) {
  const { connect } = useWalletContext()

  return (
    <li className="w-full">
      <Button variant="ghost" onClick={() => connect(adapter.name)} className="h-12 w-full rounded-none">
        <span className="inline-flex w-full justify-between px-0">
          <span className="inline-flex items-center gap-4">
            <span className="shrink-0">
              <WalletAdapterImage adapter={adapter} className="h-6 w-6" />
            </span>
            {adapter.name}
          </span>
          {isInstalled && <span className="text-fg/60">Detected</span>}
        </span>
      </Button>
    </li>
  )
}

function WalletLogo() {
  return (
    <svg width="97" height="96" viewBox="0 0 97 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="48.5" cy="48" r="48" fill="url(#paint0_linear_880_5115)" fillOpacity="0.1" />
      <circle cx="48.5" cy="48" r="47" stroke="url(#paint1_linear_880_5115)" strokeOpacity="0.4" strokeWidth="2" />
      <g clipPath="url(#clip0_880_5115)">
        <path
          d="M65.5769 28.1523H31.4231C27.6057 28.1523 24.5 31.258 24.5 35.0754V60.9215C24.5 64.7389 27.6057 67.8446 31.4231 67.8446H65.5769C69.3943 67.8446 72.5 64.7389 72.5 60.9215V35.0754C72.5 31.258 69.3943 28.1523 65.5769 28.1523ZM69.7308 52.1523H59.5769C57.2865 52.1523 55.4231 50.289 55.4231 47.9985C55.4231 45.708 57.2864 43.8446 59.5769 43.8446H69.7308V52.1523ZM69.7308 41.0754H59.5769C55.7595 41.0754 52.6539 44.1811 52.6539 47.9985C52.6539 51.8159 55.7595 54.9215 59.5769 54.9215H69.7308V60.9215C69.7308 63.2119 67.8674 65.0754 65.5769 65.0754H31.4231C29.1327 65.0754 27.2692 63.212 27.2692 60.9215V35.0754C27.2692 32.785 29.1326 30.9215 31.4231 30.9215H65.5769C67.8673 30.9215 69.7308 32.7849 69.7308 35.0754V41.0754Z"
          fill="url(#paint2_linear_880_5115)"
        />
        <path
          d="M61.4231 46.6172H59.577C58.8123 46.6172 58.1924 47.2371 58.1924 48.0018C58.1924 48.7665 58.8123 49.3863 59.577 49.3863H61.4231C62.1878 49.3863 62.8077 48.7664 62.8077 48.0018C62.8077 47.2371 62.1878 46.6172 61.4231 46.6172Z"
          fill="url(#paint3_linear_880_5115)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_880_5115"
          x1="3.41664"
          y1="98.0933"
          x2="103.05"
          y2="8.42498"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="0.14" stopColor="#8A53F4" />
          <stop offset="0.42" stopColor="#6377D6" />
          <stop offset="0.79" stopColor="#24B0A7" />
          <stop offset="0.99" stopColor="#00D18C" />
          <stop offset="1" stopColor="#00D18C" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_880_5115"
          x1="3.41664"
          y1="98.0933"
          x2="103.05"
          y2="8.42498"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="0.14" stopColor="#8A53F4" />
          <stop offset="0.42" stopColor="#6377D6" />
          <stop offset="0.79" stopColor="#24B0A7" />
          <stop offset="0.99" stopColor="#00D18C" />
          <stop offset="1" stopColor="#00D18C" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_880_5115"
          x1="25.9583"
          y1="68.7101"
          x2="67.2337"
          y2="23.7879"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="0.14" stopColor="#8A53F4" />
          <stop offset="0.42" stopColor="#6377D6" />
          <stop offset="0.79" stopColor="#24B0A7" />
          <stop offset="0.99" stopColor="#00D18C" />
          <stop offset="1" stopColor="#00D18C" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_880_5115"
          x1="58.3326"
          y1="49.4467"
          x2="61.0002"
          y2="45.4453"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9945FF" />
          <stop offset="0.14" stopColor="#8A53F4" />
          <stop offset="0.42" stopColor="#6377D6" />
          <stop offset="0.79" stopColor="#24B0A7" />
          <stop offset="0.99" stopColor="#00D18C" />
          <stop offset="1" stopColor="#00D18C" />
        </linearGradient>
        <clipPath id="clip0_880_5115">
          <rect width="48" height="48" fill="white" transform="translate(24.5 24)" />
        </clipPath>
      </defs>
    </svg>
  )
}
