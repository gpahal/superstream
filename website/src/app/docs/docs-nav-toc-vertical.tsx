'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'

import { trim } from '@gpahal/std/string'

import type { FlattenedDoc } from '@/lib/docs'
import { PROGRAM_API_NAV_LINK_ITEM, TS_SDK_API_NAV_LINK_ITEM } from '@/lib/nav'
import { getFirstLeafTocItem, type Toc } from '@/lib/toc'
import { Link } from '@/components/lib/link'
import {
  getActiveNavTocVerticalItemClassName,
  NavTocVerticalItems,
  NavTocVertical as NavTocVerticalLib,
  NavTocVerticalLinkItems,
} from '@/components/nav'

const NAV_APIS_LINK_ITEMS = [PROGRAM_API_NAV_LINK_ITEM, TS_SDK_API_NAV_LINK_ITEM]

export type DocsNavTocVerticalProps = {
  docsToc: Toc<FlattenedDoc>
  onItemClick?: React.MouseEventHandler
  className?: string
  topChildren?: React.ReactNode
  bottomChildren?: React.ReactNode
}

export function DocsNavTocVertical({
  docsToc,
  onItemClick,
  className,
  topChildren,
  bottomChildren,
}: DocsNavTocVerticalProps) {
  const pathname = trim(usePathname(), '/')
  const firstDocPath = getFirstLeafTocItem(docsToc)?.path

  return (
    <NavTocVerticalLib className={className}>
      {topChildren}
      <NavTocVerticalItems
        toc={docsToc}
        getItemKey={(doc) => doc.path}
        renderLabel={(doc) => doc.data.frontmatter.label}
        renderItem={(doc) => (
          <Link
            href={`/docs/${doc.path}`}
            activeLinkState={pathname === 'docs' && doc.path === firstDocPath ? { isActive: true } : undefined}
            onClick={onItemClick}
            className={getActiveNavTocVerticalItemClassName}
          >
            {doc.data.frontmatter.label}
          </Link>
        )}
      />
      <NavTocVerticalLinkItems linkItems={NAV_APIS_LINK_ITEMS} label="API references" />
      {bottomChildren}
    </NavTocVerticalLib>
  )
}
