import * as React from 'react'

import { cn } from '@/lib/styles'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md bg-bg px-3 py-1 text-base text-fg shadow-sm ring-1 ring-inset ring-neutral-7 transition-colors file:border-0 file:bg-transparent file:font-medium placeholder:text-opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'
