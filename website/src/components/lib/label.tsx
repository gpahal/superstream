'use client'

import * as React from 'react'

import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/styles'

export type LabelProps = LabelPrimitive.LabelProps

export const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        'text-[0.9375rem]/[1.25rem] font-semimedium leading-none text-fg peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
)
Label.displayName = LabelPrimitive.Root.displayName
