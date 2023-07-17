'use client'

import * as React from 'react'

import { isFunction } from '@gpahal/std/function'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { cn } from '@/lib/styles'

export type PopoverProps = PopoverPrimitive.PopoverProps

export const Popover = PopoverPrimitive.Root

export type PopoverTriggerProps = PopoverPrimitive.PopoverTriggerProps

export const PopoverTrigger = PopoverPrimitive.Trigger

export type PopoverAnchorProps = PopoverPrimitive.PopoverAnchorProps

export const PopoverAnchor = PopoverPrimitive.Anchor

export type PopoverContentProps = Omit<PopoverPrimitive.PopoverContentProps, 'children'> & {
  children?: React.ReactNode | ((_: { close: () => void }) => React.ReactNode)
}

export const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(
  ({ align = 'center', sideOffset = 4, className, children, ...props }, ref) => {
    const closeButtonRef = React.useRef<HTMLButtonElement>(null)

    const close = React.useCallback(() => {
      closeButtonRef.current?.click()
    }, [])

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            'relative z-50 w-72 rounded-md border bg-bg p-4 text-fg shadow outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        >
          {(isFunction(children) ? children({ close }) : children) as React.ReactNode}
          <PopoverPrimitive.Close ref={closeButtonRef} aria-label="Close" className="sr-only" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    )
  },
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName
