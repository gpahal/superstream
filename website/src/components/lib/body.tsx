import * as React from 'react'

import { cva } from 'class-variance-authority'

import { cn } from '@/lib/styles'

export const bodyStyles = cva('-mx-1 flex min-h-[2.5rem] grow flex-col overflow-auto px-1')

export type BodyProps = React.HTMLAttributes<HTMLDivElement>

export const Body = React.forwardRef<HTMLDivElement, BodyProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(bodyStyles(), className)} {...props} />
))
Body.displayName = 'Body'
