import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/styles'

export const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-neutral-4 text-fg ring-neutral-7',
        primary: 'bg-primary-3 text-primary-11 ring-primary-6',
        info: 'bg-info-3 text-info-11 ring-info-6',
        warn: 'bg-warn-3 text-warn-11 ring-warn-6',
        error: 'bg-error-3 text-error-11 ring-error-6',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        badgeVariants({ variant }),
        'inline-flex items-center rounded-md px-2.5 py-[0.275rem] text-[0.8rem]/[0.8rem] font-medium shadow-sm ring-1 ring-inset',
        className,
      )}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'
