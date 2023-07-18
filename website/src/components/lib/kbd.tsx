import * as React from 'react'

import { cn } from '@/lib/styles'

export type KbdProps = React.HTMLAttributes<HTMLElement>

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ className, ...props }, ref) => (
  <kbd
    ref={ref}
    className={cn(
      'pointer-events-none flex h-6 select-none items-center gap-0.5 rounded border-b-2 border-l border-r-[1.5px] border-t border-neutral-7 bg-bg px-1.5 py-1 text-[0.8rem]/[1.125rem] font-normal leading-none text-fg-subtle',
      className,
    )}
    {...props}
  />
))
Kbd.displayName = 'Kbd'
