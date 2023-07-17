'use client'

import * as React from 'react'

import * as SelectPrimitive from '@radix-ui/react-select'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { cn } from '@/lib/styles'

export type SelectProps = SelectPrimitive.SelectProps

export const Select = SelectPrimitive.Root

export type SelectGroupProps = SelectPrimitive.SelectGroupProps

export const SelectGroup = SelectPrimitive.Group

export type SelectValueProps = SelectPrimitive.SelectValueProps

export const SelectValue = SelectPrimitive.Value

export type SelectTriggerProps = SelectPrimitive.SelectTriggerProps

export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md bg-transparent px-3 py-1 text-sm text-fg shadow-sm ring-1 ring-inset ring-neutral-7 placeholder:text-opacity-40 focus:outline-none focus:ring-2 focus:ring-info-10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  ),
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

export type SelectContentProps = SelectPrimitive.SelectContentProps

export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, SelectContentProps>(
  ({ position = 'popper', className, children, ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
          'relative z-50 min-w-[8rem] overflow-hidden rounded-md bg-bg text-fg shadow-md ring-1 ring-inset ring-neutral-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
)
SelectContent.displayName = SelectPrimitive.Content.displayName

export type SelectLabelProps = SelectPrimitive.SelectLabelProps

export const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, SelectLabelProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Label ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props} />
  ),
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

export type SelectItemProps = SelectPrimitive.SelectItemProps

export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hocus:bg-info-4',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ),
)
SelectItem.displayName = SelectPrimitive.Item.displayName

export type SelectSeparatorProps = SelectPrimitive.SelectSeparatorProps

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-neutral-6', className)} {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName
