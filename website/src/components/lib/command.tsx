'use client'

import * as React from 'react'

import { Command as CommandPrimitive } from 'cmdk'
import { SearchIcon } from 'lucide-react'

import { cn } from '@/lib/styles'
import { Dialog, DialogContent, type DialogProps } from '@/components/lib/dialog'
import { Kbd } from '@/components/lib/kbd'

export type CommandProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>

export const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, CommandProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-bg text-fg', className)}
      {...props}
    />
  ),
)
Command.displayName = CommandPrimitive.displayName

export type CommandDialogProps = DialogProps

export const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent
        hideCloseButton
        className="overflow-hidden p-0 md:p-0 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0"
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}
CommandDialog.displayName = 'CommandDialog'

export type CommandInputProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="relative flex items-center gap-2 border-b px-3" cmdk-input-wrapper="">
    <SearchIcon className="h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent py-3 text-base text-fg outline-none placeholder:text-opacity-40 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
    <Kbd>Esc</Kbd>
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

export type CommandListProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('mt-1 max-h-[360px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

export type CommandEmptyProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>

export const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, CommandEmptyProps>(
  (props, ref) => <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-base" {...props} />,
)
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

export type CommandGroupProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>

export const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, CommandGroupProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        'my-3 mb-1 overflow-hidden p-1 text-fg first:mt-0 last:mb-0 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-base [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-fg md:[&_[cmdk-group-heading]]:text-[0.9375rem]',
        className,
      )}
      {...props}
    />
  ),
)

CommandGroup.displayName = CommandPrimitive.Group.displayName

export type CommandSeparatorProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>

export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn('-mx-1 mb-2 h-px bg-neutral-6', className)} {...props} />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

export type CommandItemProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>

export const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, CommandItemProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex min-h-[2rem] cursor-pointer select-none items-center gap-2.5 rounded-sm px-2 py-1.5 text-base outline-none aria-selected:bg-neutral-4 aria-selected:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-50 md:text-[0.9375rem]',
        className,
      )}
      {...props}
    />
  ),
)
CommandItem.displayName = CommandPrimitive.Item.displayName

export type CommandItemIconWrapperProps = React.HTMLAttributes<HTMLDivElement>

export const CommandItemIconWrapper = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemIconWrapperProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-[1.325rem] w-[1.325rem] shrink-0 items-center justify-center rounded border border-neutral-7 bg-neutral-5/40 md:h-[1.275rem] md:w-[1.275rem] [&>svg]:h-[0.875rem] [&>svg]:w-[0.875rem] [&>svg]:text-fg [&>svg]:opacity-75 md:[&>svg]:h-[0.825rem] md:[&>svg]:w-[0.825rem]',
      className,
    )}
    {...props}
  />
))
CommandItemIconWrapper.displayName = 'CommandItemIconWrapper'

export type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement>

export const CommandShortcut = ({ className, ...props }: CommandShortcutProps) => {
  return <span className={cn('ml-auto text-sm text-fg-subtle', className)} {...props} />
}
CommandShortcut.displayName = 'CommandShortcut'
