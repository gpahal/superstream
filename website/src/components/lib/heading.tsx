import * as React from 'react'

import { cn } from '@/lib/styles'

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>

export const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h1 {...props} ref={ref} className={cn('text-[1.75rem]/[2.125rem] font-bold tracking-[-0.02em]', className)}>
    {children}
  </h1>
))
H1.displayName = 'H1'

export const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h2 {...props} ref={ref} className={cn('text-2xl font-semibold tracking-[-0.0125em]', className)}>
    {children}
  </h2>
))
H2.displayName = 'H2'

export const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h3 {...props} ref={ref} className={cn('text-xl font-medium', className)}>
    {children}
  </h3>
))
H3.displayName = 'H3'

export const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h4 {...props} ref={ref} className={cn('text-lg font-bold', className)}>
    {children}
  </h4>
))
H4.displayName = 'H4'

export const H5 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h5 {...props} ref={ref} className={cn('text-base font-semibold', className)}>
    {children}
  </h5>
))
H5.displayName = 'H5'

export const H6 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h6 {...props} ref={ref} className={cn('text-base font-medium', className)}>
    {children}
  </h6>
))
H6.displayName = 'H6'
