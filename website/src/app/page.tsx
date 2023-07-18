import { Metadata } from 'next'

import dashboardScreenshot from '@public/images/dashboard-screenshot.png'

import { generatePageMetadata } from '@/lib/metadata'
import { DASHBOARD_NAV_LINK_ITEM, DOCS_NAV_LINK_ITEM, GITHUB_NAV_LINK_ITEM } from '@/lib/nav'
import { H1, H2, H3 } from '@/components/lib/heading'
import { Image } from '@/components/lib/image'
import { Layout } from '@/components/layout'
import { Logo } from '@/components/logo'
import { NavListHorizontal, NavListHorizontalLinkItems } from '@/components/nav'

import { GetStartedButton, GetStartedProvider } from './get-started'
import { HomeLayoutBottomSheet } from './home-layout-bottom-sheet'

export const runtime = 'edge'

export const metadata: Metadata = generatePageMetadata({
  pathname: '/',
})

const NAV_LINK_ITEMS = [DOCS_NAV_LINK_ITEM, DASHBOARD_NAV_LINK_ITEM, GITHUB_NAV_LINK_ITEM]

export default function HomePage() {
  return (
    <GetStartedProvider>
      <Layout
        navProps={{
          hideLogo: true,
          className: 'max-w-[80rem]',
        }}
        topNavProps={{
          children: (
            <div className="flex flex-1 items-center justify-between gap-6">
              <NavListHorizontal>
                <NavListHorizontalLinkItems linkItems={NAV_LINK_ITEMS} />
              </NavListHorizontal>
              <GetStartedButton />
            </div>
          ),
        }}
        bottomNavProps={{
          children: (
            <div className="flex flex-1 items-center justify-between">
              <GetStartedButton />
              <div className="flex flex-row items-center">
                <HomeLayoutBottomSheet linkItems={NAV_LINK_ITEMS} label="Quick links" />
              </div>
            </div>
          ),
        }}
      >
        <div className="relative mt-12 flex h-full w-full flex-col overflow-x-hidden lg:mt-0">
          <div className="overflow-hidden lg:relative">
            <div className="mx-auto max-w-[80rem]">
              <div className="mx-auto w-full items-start px-6 md:max-w-3xl lg:mx-0 lg:flex lg:h-full lg:min-h-[calc(100vh-3.5rem-1px)] lg:w-[55%] lg:max-w-7xl lg:flex-col lg:pb-20 lg:pr-0 lg:pt-24">
                <div className="hidden flex-[3] lg:block" />

                <div className="mx-auto lg:mx-0">
                  <div className="mx-auto ml-1 flex flex-row items-center justify-center space-x-2 lg:hidden">
                    <Logo variant="primary" className="h-16 w-16 flex-shrink-0" />
                    <H1 className="-mt-0.5 text-4xl font-bold">Superstream</H1>
                  </div>
                  <div className="-ml-2 hidden w-auto flex-row items-center space-x-2 lg:flex">
                    <Logo variant="primary" className="h-16 w-16 flex-shrink-0" />
                    <H1 className="-mt-0.5 text-4xl font-bold">Superstream</H1>
                  </div>
                </div>

                <div className="mt-12 w-full lg:mx-0">
                  <div className="mx-auto mt-6 w-full md:max-w-xl lg:mx-0 lg:max-w-2xl">
                    <H2 className="block text-center text-2xl font-semibold md:text-3xl lg:text-left">
                      Real-time payment streams on Solana
                    </H2>
                    <H3 className="mt-1 text-center text-lg font-normal text-fg-subtle md:text-xl lg:text-left">
                      Manage payroll, token distributions, vesting, subscriptions, rewards and any composable stream -
                      transparently and efficiently
                    </H3>
                  </div>
                  <div className="mx-auto mt-8 flex w-full flex-row items-center justify-center space-x-4 lg:mx-0 lg:justify-start">
                    <GetStartedButton size="xl" className="w-44" />
                  </div>
                </div>

                <div className="hidden flex-[3] lg:block" />
              </div>
            </div>

            <div className="px-8 md:mx-auto md:max-w-3xl">
              <div className="py-12 md:relative md:mt-12 lg:absolute lg:inset-y-0 lg:right-0 lg:my-6 lg:w-[45%] lg:py-[3.4rem]">
                <div className="hidden md:block">
                  <div className="absolute inset-y-0 left-[55%] w-screen rounded-l-2xl bg-neutral-2/90 lg:left-80 lg:right-0 lg:w-full" />
                  <svg
                    className="absolute left-0 top-[1.4rem] -mr-3 inline w-full lg:left-[35%] lg:right-auto lg:m-0 lg:w-auto"
                    width={303}
                    height={294}
                    fill="none"
                    viewBox="0 0 303 294"
                  >
                    <defs>
                      <pattern
                        id="837c3e70-6c3a-44e6-8854-cc48c737b659"
                        x={0}
                        y={0}
                        width={20}
                        height={20}
                        patternUnits="userSpaceOnUse"
                      >
                        <rect x={0} y={0} width={4} height={4} className="text-neutral-5/60" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width={404} height={392} fill="url(#837c3e70-6c3a-44e6-8854-cc48c737b659)" />
                  </svg>
                </div>
                <div className="relative -mr-40 pl-4 md:mx-auto md:max-w-3xl md:px-0 lg:h-full lg:max-w-none lg:pl-12">
                  <Image
                    src={dashboardScreenshot}
                    alt="Dashboard screenshot"
                    priority
                    className="w-full min-w-[90rem] rounded-md object-contain object-left-top shadow-xl ring-1 ring-fg/5 lg:h-full lg:min-h-[25rem] lg:w-auto lg:max-w-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </GetStartedProvider>
  )
}
