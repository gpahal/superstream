import * as React from 'react'

import { cva } from 'class-variance-authority'

import { cn } from '@/lib/styles'

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>

export const h1Styles = cva('text-3xl font-bold tracking-[-0.02em]')

export const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h1 ref={ref} className={cn(h1Styles(), className)} {...props}>
    {children}
  </h1>
))
H1.displayName = 'H1'

export const h2Styles = cva('text-2xl font-semibold tracking-[-0.0125em]')

export const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h2 ref={ref} className={cn(h2Styles(), className)} {...props}>
    {children}
  </h2>
))
H2.displayName = 'H2'

export const h3Styles = cva('text-xl font-medium')

export const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn(h3Styles(), className)} {...props}>
    {children}
  </h3>
))
H3.displayName = 'H3'

export const h4Styles = cva('font-bold text-lg')

export const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h4 ref={ref} className={cn(h4Styles(), className)} {...props}>
    {children}
  </h4>
))
H4.displayName = 'H4'

export const h5Styles = cva('text-base font-semibold')

export const H5 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h5 ref={ref} className={cn(h5Styles(), className)} {...props}>
    {children}
  </h5>
))
H5.displayName = 'H5'

export const h6Styles = cva('text-base font-medium')

export const H6 = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, children, ...props }, ref) => (
  <h6 ref={ref} className={cn(h6Styles(), className)} {...props}>
    {children}
  </h6>
))
H6.displayName = 'H6'
