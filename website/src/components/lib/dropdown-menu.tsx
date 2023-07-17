'use client'

import * as React from 'react'

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { CheckIcon, ChevronRightIcon, DotIcon } from 'lucide-react'

import { cn } from '@/lib/styles'

export type DropdownMenuProps = DropdownMenuPrimitive.DropdownMenuProps

export const DropdownMenu = DropdownMenuPrimitive.Root

export type DropdownMenuTriggerProps = DropdownMenuPrimitive.DropdownMenuTriggerProps

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export type DropdownMenuGroupProps = DropdownMenuPrimitive.DropdownMenuGroupProps

export const DropdownMenuGroup = DropdownMenuPrimitive.Group

export type DropdownMenuPortalProps = DropdownMenuPrimitive.DropdownMenuPortalProps

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal

export type DropdownMenuSubProps = DropdownMenuPrimitive.DropdownMenuSubProps

export const DropdownMenuSub = DropdownMenuPrimitive.Sub

export type DropdownMenuRadioGroupProps = DropdownMenuPrimitive.DropdownMenuRadioGroupProps

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export type DropdownMenuContentProps = DropdownMenuPrimitive.DropdownMenuContentProps

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ sideOffset = 4, className, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md bg-bg p-1 text-fg shadow-sm ring-1 ring-inset ring-neutral-7',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

export type DropdownMenuSubTriggerProps = DropdownMenuPrimitive.DropdownMenuSubTriggerProps & {
  inset?: boolean
}

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ inset, className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded px-2 py-1.5 text-sm outline-none data-[state=open]:bg-info-5 hocus:bg-info-4',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

export type DropdownMenuSubContentProps = DropdownMenuPrimitive.DropdownMenuSubContentProps

export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownMenuSubContentProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md bg-bg p-1 text-fg shadow-sm ring-1 ring-inset ring-neutral-7 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

export type DropdownMenuItemProps = DropdownMenuPrimitive.DropdownMenuItemProps & {
  inset?: boolean
}

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ inset, className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hocus-visible:bg-info-4 hocus-visible:ring-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

export type DropdownMenuItemIconWrapperProps = React.HTMLAttributes<HTMLDivElement>

export const DropdownMenuItemIconWrapper = React.forwardRef<HTMLDivElement, DropdownMenuItemIconWrapperProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex h-5 w-5 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5', className)}
      {...props}
    />
  ),
)
DropdownMenuItemIconWrapper.displayName = 'CommandItemIconWrapper'

export type DropdownMenuCheckboxItemProps = DropdownMenuPrimitive.DropdownMenuCheckboxItemProps

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ checked, className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    checked={checked}
    className={cn(
      'relative flex cursor-default select-none items-center rounded py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hocus:bg-info-4',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

export type DropdownMenuRadioItemProps = DropdownMenuPrimitive.DropdownMenuRadioItemProps

export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hocus:bg-info-4',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <DotIcon className="h-4 w-4 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

export type DropdownMenuLabelProps = DropdownMenuPrimitive.DropdownMenuLabelProps & {
  inset?: boolean
}

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(({ inset, className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

export type DropdownMenuSeparatorProps = DropdownMenuPrimitive.DropdownMenuSeparatorProps

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-neutral-7', className)} {...props} />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

export type DropdownMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement>

export const DropdownMenuShortcut = ({ className, ...props }: DropdownMenuShortcutProps) => {
  return <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'
