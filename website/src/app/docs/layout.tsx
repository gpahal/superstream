import * as React from 'react'
import type { Metadata } from 'next'

import { getFlattenedContentCollectionToc } from '@/lib/content'
import { getDocsSearchDocuments, getFlattenedDocs } from '@/lib/docs.server'
import { generatePageMetadata } from '@/lib/metadata'
import { DASHBOARD_NAV_LINK_ITEM, GITHUB_NAV_LINK_ITEM, HOMEPAGE_NAV_LINK_ITEM } from '@/lib/nav'
import { Layout } from '@/components/layout'
import { NavListHorizontal, NavListHorizontalLinkItems } from '@/components/nav'
import { ThemeButton } from '@/components/theme'

import { DocsLayoutBottomSheet } from './docs-layout-bottom-sheet'
import { DocsNavTocVertical } from './docs-nav-toc-vertical'
import { DocsSearchButton, DocsSearchProvider } from './docs-search'

export const metadata: Metadata = generatePageMetadata({
  pathname: '/docs',
  title: 'Superstream Documentation',
  description: 'Build apps that stream money in real-time using the Superstream protocol',
  imagePath: '/docs?v=5',
})

const NAV_LINK_ITEMS = [HOMEPAGE_NAV_LINK_ITEM, DASHBOARD_NAV_LINK_ITEM, GITHUB_NAV_LINK_ITEM]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const docsSearchDocuments = getDocsSearchDocuments()
  const docs = getFlattenedDocs()
  const docsToc = getFlattenedContentCollectionToc(docs)

  return (
    <DocsSearchProvider docsSearchDocuments={docsSearchDocuments} docs={docs}>
      <Layout
        navProps={{
          logoHref: '/docs',
          logoSubtitle: 'Docs',
        }}
        topNavProps={{
          children: (
            <div className="flex flex-1 items-center justify-end gap-6">
              <NavListHorizontal>
                <NavListHorizontalLinkItems linkItems={NAV_LINK_ITEMS} />
              </NavListHorizontal>
              <div className="flex items-center gap-3">
                <DocsSearchButton />
                <ThemeButton />
              </div>
            </div>
          ),
        }}
        bottomNavProps={{
          children: (
            <div className="flex grow flex-row items-center gap-5">
              <DocsSearchButton className="grow" />
              <DocsLayoutBottomSheet docsToc={docsToc} linkItems={NAV_LINK_ITEMS} label="Quick links" />
            </div>
          ),
        }}
      >
        <div className="relative flex h-full w-full flex-row">
          <div className="hidden md:relative md:block">
            <div className="sticky left-0 top-[3.5rem] -ml-0.5 h-[calc(100vh-3.5rem)] overflow-y-auto pl-0.5">
              <DocsNavTocVertical docsToc={docsToc} className="h-full w-[16.25rem] px-2 py-6 lg:w-[16.75rem] lg:py-8" />
            </div>
          </div>
          {children}
        </div>
      </Layout>
    </DocsSearchProvider>
  )
}
