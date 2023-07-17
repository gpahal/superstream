import * as React from 'react'

import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/styles'

const footerStyles = cva('flex flex-col gap-3 [&>*]:w-full', {
  variants: {
    variant: {
      default: 'md:[&>*]:w-auto md:flex-row-reverse md:justify-start',
      'full-width': '',
      stretched: 'md:w-auto md:flex-row-reverse md:[&>*]:grow',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type FooterProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof footerStyles>

export const Footer = ({ variant, className, ...props }: FooterProps) => (
  <div className={cn(footerStyles({ variant, className }), className)} {...props} />
)
Footer.displayName = 'Footer'
