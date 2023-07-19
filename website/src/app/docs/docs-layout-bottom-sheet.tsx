'use client'

import * as React from 'react'

import type { FlattenedDoc } from '@/lib/docs'
import type { Toc } from '@/lib/toc'
import { LayoutBottomSheet } from '@/components/layout'
import { NavTocVerticalLinkItems, type NavTocVerticalLinkItemsProps } from '@/components/nav'
import { ThemeNavTocVericalItems } from '@/components/theme'

import { DocsNavTocVertical } from './docs-nav-toc-vertical'

export type DocsLayoutBottomSheetProps = NavTocVerticalLinkItemsProps & {
  docsToc: Toc<FlattenedDoc>
  onItemClick?: React.MouseEventHandler
}

export function DocsLayoutBottomSheet({ docsToc, onItemClick, onClick, ...props }: DocsLayoutBottomSheetProps) {
  return (
    <LayoutBottomSheet>
      {({ close }) => (
        <DocsNavTocVertical
          docsToc={docsToc}
          onItemClick={onItemClick}
          topChildren={
            <NavTocVerticalLinkItems
              label="Quick links"
              onClick={(e) => {
                onItemClick?.(e)
                onClick?.(e)
                close()
              }}
              {...props}
            />
          }
          bottomChildren={<ThemeNavTocVericalItems onThemeItemClick={close} />}
        />
      )}
    </LayoutBottomSheet>
  )
}
