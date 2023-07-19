import * as React from 'react'

import { MenuIcon } from 'lucide-react'

import { isFunction } from '@gpahal/std/function'

import { cn } from '@/lib/styles'
import { Body } from '@/components/lib/body'
import { Button } from '@/components/lib/button'
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/lib/dialog'
import { Nav, NavProps } from '@/components/nav'

export type LayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  navProps: NavProps
  topNavProps?: Partial<NavProps>
  bottomNavProps?: Partial<NavProps>
}

export function Layout({ navProps, topNavProps, bottomNavProps, className, ...props }: LayoutProps) {
  const { containerClassName: topNavContainerClassName, ...allTopNavProps } = { ...navProps, ...(topNavProps || {}) }
  const { containerClassName: bottomNavContainerClassName, ...allBottomNavProps } = {
    ...navProps,
    ...(bottomNavProps || {}),
  }

  const showOnlyOnTop = navProps.showOnlyOnTop

  return (
    <div className="relative">
      <Nav containerClassName={cn('hidden md:block', topNavContainerClassName)} {...allTopNavProps} />
      <div
        className={cn('relative flex min-h-[calc(100vh-3.5rem-1px)] w-full flex-1 flex-col transition-all', className)}
        {...props}
      />
      {!showOnlyOnTop && (
        <Nav containerClassName={cn('md:hidden', bottomNavContainerClassName)} {...allBottomNavProps} />
      )}
    </div>
  )
}

export type LayoutBottomSheetProps = Omit<DialogContentProps, 'variant'>

export function LayoutBottomSheet({ children, ...props }: LayoutBottomSheetProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button aria-label="Menu" variant="ghost" shape="square">
          <MenuIcon className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent variant="bottom-sheet" {...props}>
        {({ close }) => (
          <>
            <DialogHeader>
              <DialogTitle>Menu</DialogTitle>
            </DialogHeader>
            <Body className="-mx-5">{(isFunction(children) ? children({ close }) : children) as React.ReactNode}</Body>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
