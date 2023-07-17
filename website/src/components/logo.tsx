import * as React from 'react'

import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/styles'

const logoStyles = cva('', {
  variants: {
    variant: {
      default: 'text-fg',
      primary: 'text-primary-9',
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

export type LogoProps = React.SVGProps<SVGSVGElement> & VariantProps<typeof logoStyles>

export function Logo({ variant, size, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      viewBox="0 0 337.19 337.19"
      fill="currentColor"
      stroke="none"
      className={cn(logoStyles({ variant, size }), className)}
    >
      <g>
        <polygon points="168.595,0 168.595,199.521 60.834,199.521" />
        <polygon points="276.356,137.669 168.595,337.19 168.595,137.669" />
      </g>
    </svg>
  )
}
