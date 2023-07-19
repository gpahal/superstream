'use client'

import * as React from 'react'

import { LayoutBottomSheet as LayoutBottomSheetLib } from '@/components/layout'
import { NavTocVertical, NavTocVerticalLinkItems, type NavTocVerticalLinkItemsProps } from '@/components/nav'

export type HomeLayoutBottomSheetProps = NavTocVerticalLinkItemsProps

export function HomeLayoutBottomSheet({ onClick, ...props }: HomeLayoutBottomSheetProps) {
  return (
    <LayoutBottomSheetLib>
      {({ close }) => (
        <NavTocVertical>
          <NavTocVerticalLinkItems
            onClick={(e) => {
              onClick?.(e)
              close()
            }}
            {...props}
          />
        </NavTocVertical>
      )}
    </LayoutBottomSheetLib>
  )
}
