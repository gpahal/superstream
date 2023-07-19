import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/styles'

const spinnerStyles = cva('inline-block animate-spin', {
  variants: {
    variant: {
      default: 'text-fg',
      primary: 'bg-primary-9',
    },
    size: {
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export type SpinnerProps = React.SVGProps<SVGSVGElement> & VariantProps<typeof spinnerStyles>

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(({ variant, size, className, ...props }, ref) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="none"
      className={cn(spinnerStyles({ variant, size }), className)}
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )
})
Spinner.displayName = 'Spinner'
