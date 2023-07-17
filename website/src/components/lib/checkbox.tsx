'use client'

import * as React from 'react'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/styles'

export type CheckedState = CheckboxPrimitive.CheckedState

export type CheckboxProps = CheckboxPrimitive.CheckboxProps

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 cursor-pointer rounded shadow-sm ring-1 ring-neutral-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-10 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-info-9 data-[state=checked]:text-info-fg data-[state=checked]:ring-info-9 data-[state=checked]:hover:bg-info-9 data-[state=checked]:focus-visible:ring-offset-1 [&:not([data-state="checked"]:focus-visible)]:ring-inset',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <CheckIcon className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName
