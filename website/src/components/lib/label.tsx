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
        'font-extramedium leading-none text-fg peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
)
Label.displayName = LabelPrimitive.Root.displayName
