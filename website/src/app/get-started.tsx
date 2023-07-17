'use client'

import * as React from 'react'

import { cn } from '@/lib/styles'
import { DisclosureState, useDisclosure } from '@/hooks/use-disclosure'
import { Body } from '@/components/lib/body'
import { Button, ButtonProps } from '@/components/lib/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/lib/dialog'
import { H3 } from '@/components/lib/heading'
import { Link, LinkProps } from '@/components/lib/link'
import { buttonStyles } from '@/components/lib/styles'

type GetStartedContextValue = DisclosureState

const GetStartedContext = React.createContext({} as GetStartedContextValue)

export type GetStartedProviderProps = {
  children: React.ReactNode
}

export function GetStartedProvider({ children }: GetStartedProviderProps) {
  const disclosureState = useDisclosure()

  return (
    <GetStartedContext.Provider value={disclosureState}>
      {children}
      <GetStartedDialog />
    </GetStartedContext.Provider>
  )
}

function GetStartedDialog() {
  const { isOpen, setIsOpen } = React.useContext(GetStartedContext)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Get started</DialogTitle>
        </DialogHeader>
        <Body>
          <div className="flex w-full flex-col divide-y divide-neutral-6 lg:flex-row lg:items-stretch lg:divide-x lg:divide-y-0">
            <GetStartedSection
              title="Manage and create new payment streams"
              description="Manage all your real-time payment streams in one place and create new ones in less than 2 mins"
              linkProps={{
                href: '/dashboard',
                children: 'Go to dashboard',
              }}
            />
            <GetStartedSection
              title="Build real-time finance apps"
              description="Build apps that stream money in real-time using the Superstream protocol"
              linkProps={{
                href: '/docs',
                children: 'View docs',
              }}
            />
          </div>
        </Body>
      </DialogContent>
    </Dialog>
  )
}

type GetStartedSectionProps = {
  title: string
  description: string
  linkProps: LinkProps
}

function GetStartedSection({ title, description, linkProps: { className, ...linkProps } }: GetStartedSectionProps) {
  return (
    <div className="flex w-full flex-col items-center justify-between px-4 py-8 md:px-6">
      <div className="flex flex-col items-center">
        <H3 className="text-center">{title}</H3>
        <p className="mx-auto mt-2 text-center text-fg/75">{description}</p>
      </div>
      <Link className={cn(buttonStyles({ variant: 'primary' }), 'mt-4 w-44 lg:mt-8', className)} {...linkProps} />
    </div>
  )
}

export type GetStartedButtonProps = ButtonProps

export function GetStartedButton({ variant, onClick, children, ...props }: GetStartedButtonProps) {
  const { open } = React.useContext(GetStartedContext)

  const onClickWrapper = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      open()
      if (onClick) {
        await onClick(event)
      }
    },
    [open, onClick],
  )

  return (
    <Button variant={variant || 'primary'} onClick={onClickWrapper} {...props}>
      {children || 'Get started'}
    </Button>
  )
}
