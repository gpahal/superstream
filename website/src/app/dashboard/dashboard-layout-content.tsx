'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'

import {
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleEllipsisIcon,
  ExternalLinkIcon,
  XCircleIcon,
} from 'lucide-react'

import { trim } from '@gpahal/std/string'

import {
  DASHBOARD_CREATE_STREAM_NAV_LINK_ITEM,
  DASHBOARD_STREAMS_NAV_LINK_ITEM,
  DOCS_NAV_LINK_ITEM,
  GITHUB_NAV_LINK_ITEM,
  HOMEPAGE_NAV_LINK_ITEM,
} from '@/lib/nav'
import { ClusterProvider } from '@/lib/solana/cluster'
import { StreamsProvider, useStreamsContext } from '@/lib/solana/streams'
import { SuperstreamClientProvider } from '@/lib/solana/superstream'
import { TokenAccountsProvider, useTokenAccountsContext } from '@/lib/solana/token-accounts'
import { TokensProvider, useTokensContext } from '@/lib/solana/tokens'
import { useWalletContext, WalletProvider } from '@/lib/solana/wallet'
import { cn } from '@/lib/styles'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { Button } from '@/components/lib/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIconWrapper,
  DropdownMenuTrigger,
} from '@/components/lib/dropdown-menu'
import { Link } from '@/components/lib/link'
import { Spinner } from '@/components/lib/spinner'
import { Layout, LayoutBottomSheet } from '@/components/layout'
import {
  getActiveNavListHorizontalItemClassName,
  getActiveNavTocVerticalItemClassName,
  NavListHorizontal,
  NavListHorizontalItem,
  NavListHorizontalLinkItems,
  NavTocVertical,
  NavTocVerticalItems,
  NavTocVerticalLinkItems,
  NavVerticalSeparator,
} from '@/components/nav'

import { ClusterMenu } from './cluster-menu'
import { ConnectWallet } from './connect-wallet'
import { WalletAdapterImage } from './wallet-adapter-image'
import { WalletAction, WalletMenu } from './wallet-menu'

const NAV_LINK_ITEMS = [DASHBOARD_STREAMS_NAV_LINK_ITEM, DASHBOARD_CREATE_STREAM_NAV_LINK_ITEM]

const NAV_QUICK_LINK_ITEMS = [HOMEPAGE_NAV_LINK_ITEM, DOCS_NAV_LINK_ITEM, GITHUB_NAV_LINK_ITEM]

export type DashboardLayoutContentProps = {
  children: React.ReactNode
}

export default function DashboardLayoutContent({ children }: DashboardLayoutContentProps) {
  return (
    <ClusterProvider>
      <TokensProvider>
        <WalletProvider>
          <TokenAccountsProvider>
            <SuperstreamClientProvider>
              <StreamsProvider>
                <DashboardLayoutWithoutProviders>{children}</DashboardLayoutWithoutProviders>
              </StreamsProvider>
            </SuperstreamClientProvider>
          </TokenAccountsProvider>
        </WalletProvider>
      </TokensProvider>
    </ClusterProvider>
  )
}

function DashboardLayoutWithoutProviders({ children }: DashboardLayoutContentProps) {
  const pathname = trim(usePathname(), '/')
  const isMounted = useIsMounted()

  const { wallet, connectionStatus } = useWalletContext()
  const isWalletLoading = connectionStatus === 'connecting' || connectionStatus === 'disconnecting'
  const isWalletConnected = !!wallet && connectionStatus === 'connected'

  const { isLoading: isTokensLoading } = useTokensContext()
  const { isLoading: isTokenAccountsLoading } = useTokenAccountsContext()
  const { isLoading: isStreamsLoading } = useStreamsContext()

  const needsStreams = pathname === 'dashboard'
  const needsTokenAccounts = pathname === 'dashboard/create'

  const isDataLoading =
    isWalletConnected &&
    (isTokensLoading || (needsStreams && isStreamsLoading) || (needsTokenAccounts && isTokenAccountsLoading))

  let fetchingStr = ''
  if (!isWalletLoading && isDataLoading) {
    if (needsTokenAccounts) {
      fetchingStr = 'tokens'
    }
    if (needsStreams) {
      if (needsTokenAccounts) {
        fetchingStr += ' and '
      }
      fetchingStr += 'streams'
    }
  }

  return (
    <Layout
      navProps={{ logoHref: '/dashboard' }}
      topNavProps={{
        children: isWalletConnected ? (
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center">
              <NavVerticalSeparator className="mr-[1.9375rem]" />
              <NavListHorizontal>
                <NavListHorizontalLinkItems linkItems={NAV_LINK_ITEMS} />
                <NavListHorizontalItem itemKey="quick-links">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="link-hover-highlighted"
                        className={cn(getActiveNavListHorizontalItemClassName({ isActive: false }), 'h-auto p-0')}
                      >
                        More
                        <ChevronDownIcon className="ml-0.5 mt-0.5 h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44">
                      {NAV_QUICK_LINK_ITEMS.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} target={item.isExternal ? '_blank' : undefined}>
                            {item.label}
                            {item.isExternal && (
                              <DropdownMenuItemIconWrapper className="ml-auto">
                                <ExternalLinkIcon className="text-fg-subtle/80" />
                              </DropdownMenuItemIconWrapper>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavListHorizontalItem>
              </NavListHorizontal>
            </div>
            <div className="flex items-center space-x-3">
              <ClusterMenu>
                {({ clusterConfigs, clusterConfig, setClusterConfig, clusterStatus }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">
                        <span className="inline-flex items-center gap-2.5">
                          <span className="h-4 w-4 shrink-0">
                            {clusterStatus.type === 'success' ? (
                              <CheckCircleIcon className="h-4 w-4 text-primary-9" />
                            ) : clusterStatus.type === 'error' ? (
                              <XCircleIcon className="h-4 w-4 text-error-9" />
                            ) : (
                              <CircleEllipsisIcon className="h-4 w-4 text-fg-subtle/80" />
                            )}
                          </span>
                          <span>{clusterConfig.label}</span>
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {clusterConfigs.map((config) => (
                        <DropdownMenuItem
                          key={config.label}
                          onClick={() => {
                            setClusterConfig(config)
                          }}
                        >
                          <span className="line-clamp-1">{config.label}</span>
                          {config.label === clusterConfig.label && (
                            <DropdownMenuItemIconWrapper className="ml-auto">
                              <CheckIcon className="text-fg-subtle/80" />
                            </DropdownMenuItemIconWrapper>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </ClusterMenu>
              <WalletMenu>
                {({ wallet, shortenedWalletAddress, walletActions }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">
                        <span className="inline-flex items-center gap-2.5">
                          <span className="h-4 w-4 shrink-0">
                            <WalletAdapterImage adapter={wallet} className="mr-2.5 h-4 w-4" />
                          </span>
                          <span>{shortenedWalletAddress}</span>
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {walletActions.map((action) => (
                        <DropdownMenuItem
                          key={action.label}
                          onClick={async () => {
                            await action.onClick()
                          }}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </WalletMenu>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-end">
            <NavListHorizontal>
              <NavListHorizontalLinkItems linkItems={NAV_QUICK_LINK_ITEMS} />
            </NavListHorizontal>
          </div>
        ),
      }}
      bottomNavProps={{
        children: (
          <div className={cn('flex flex-1 items-center', isWalletConnected ? 'justify-between' : 'justify-end')}>
            {isWalletConnected && (
              <div className="flex items-center">
                <NavVerticalSeparator className="mr-[1.9375rem]" />
                <NavListHorizontal>
                  <NavListHorizontalLinkItems linkItems={NAV_LINK_ITEMS} />
                </NavListHorizontal>
              </div>
            )}
            <div className="flex flex-row items-center">
              <LayoutBottomSheet>
                {({ close }) => (
                  <NavTocVertical>
                    <NavTocVerticalLinkItems label="Quick links" linkItems={NAV_QUICK_LINK_ITEMS} onClick={close} />
                    <ClusterMenu>
                      {({ clusterConfigs, clusterConfig, setClusterConfig, clusterStatus }) => (
                        <NavTocVerticalItems
                          toc={[
                            {
                              item: {
                                label: 'Choose a cluster',
                                cluster: clusterConfig.cluster,
                                serialized: clusterConfig.serialized,
                              },
                              children: clusterConfigs.map((config) => ({ item: config, children: [] })),
                            },
                          ]}
                          getItemKey={(config) => config.label}
                          renderLabel={(config) => config.label}
                          renderItem={(config) => (
                            <Button
                              variant="ghost"
                              className={cn(
                                getActiveNavTocVerticalItemClassName({ isActive: false }),
                                'h-auto w-full py-0',
                              )}
                              onClick={() => {
                                setClusterConfig(config)
                                close()
                              }}
                            >
                              <span
                                className={cn(
                                  getActiveNavTocVerticalItemClassName({ isActive: false }),
                                  'inline-flex w-full justify-between px-0',
                                )}
                              >
                                <span className="line-clamp-1">{config.label}</span>
                                {config.label === clusterConfig.label &&
                                  (clusterStatus.type === 'success' ? (
                                    <CheckCircleIcon className="h-[1.05rem] w-[1.05rem] text-primary-9" />
                                  ) : clusterStatus.type === 'error' ? (
                                    <XCircleIcon className="h-[1.05rem] w-[1.05rem] text-error-9" />
                                  ) : (
                                    <CircleEllipsisIcon className="h-[1.05rem] w-[1.05rem] text-fg-subtle" />
                                  ))}
                              </span>
                            </Button>
                          )}
                        />
                      )}
                    </ClusterMenu>
                    <WalletMenu>
                      {({ wallet, shortenedWalletAddress, walletActions }) => (
                        <NavTocVerticalItems
                          toc={[
                            {
                              item: {
                                label: `${wallet.name} wallet: ${shortenedWalletAddress}`,
                                onClick: () => {
                                  // ignore
                                },
                              } as WalletAction,
                              children: walletActions.map((action) => ({ item: action, children: [] })),
                            },
                          ]}
                          getItemKey={(action) => action.label}
                          renderLabel={(action) => action.label}
                          renderItem={(action) => (
                            <Button
                              variant="ghost"
                              className={cn(
                                getActiveNavTocVerticalItemClassName({ isActive: false }),
                                'h-auto w-full py-0',
                              )}
                              onClick={async () => {
                                await action.onClick()
                                close()
                              }}
                            >
                              <span
                                className={cn(
                                  getActiveNavTocVerticalItemClassName({ isActive: false }),
                                  'inline-flex w-full px-0',
                                )}
                              >
                                {action.label}
                              </span>
                            </Button>
                          )}
                        />
                      )}
                    </WalletMenu>
                  </NavTocVertical>
                )}
              </LayoutBottomSheet>
            </div>
          </div>
        ),
      }}
      className="bg-bg-emphasis"
    >
      <div className="mx-auto h-full w-full max-w-7xl px-6 py-4">
        {isWalletLoading || isDataLoading || !isMounted ? (
          <div className="mt-10 flex w-full flex-col items-center justify-center">
            <Spinner />
            {!isWalletLoading && !isMounted && fetchingStr && <div>{`Fetching your ${fetchingStr}...`}</div>}
          </div>
        ) : isWalletConnected ? (
          children
        ) : (
          <ConnectWallet />
        )}
      </div>
    </Layout>
  )
}
