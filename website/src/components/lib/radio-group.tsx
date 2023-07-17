'use client'

import * as React from 'react'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/styles'

export type RadioGroupProps = RadioGroupPrimitive.RadioGroupProps

export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, RadioGroupProps>(
  ({ className, ...props }, ref) => {
    return <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />
  },
)
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export const radioGroupItemStyles = cva('', {
  variants: {
    variant: {
      unstyled: '',
      default:
        'group aspect-square h-4 w-4 cursor-pointer rounded-full border text-info-fg shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-info-10 disabled:cursor-not-allowed disabled:opacity-50',
    },
    defaultVariants: {
      variant: 'default',
    },
  },
})

export type RadioGroupItemProps = RadioGroupPrimitive.RadioGroupItemProps & VariantProps<typeof radioGroupItemStyles>

export const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(
  ({ variant, className, children, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Item ref={ref} className={cn(radioGroupItemStyles({ variant }), className)} {...props}>
        {children || (
          <RadioGroupPrimitive.Indicator className="relative flex h-full w-full items-center justify-center after:block after:h-2 after:w-2 after:rounded-full after:bg-info-9 after:content-[''] group-hover:after:bg-info-10" />
        )}
      </RadioGroupPrimitive.Item>
    )
  },
)
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName
