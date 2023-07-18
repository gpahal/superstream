import * as React from 'react'

import { cn } from '@/lib/styles'

export type TableProps = React.HTMLAttributes<HTMLTableElement>

export const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn('right-1 w-full caption-bottom overflow-hidden text-base ring-inset ring-neutral-11', className)}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-bg-emphasis [&_tr]:border-b', className)} {...props} />
  ),
)
TableHeader.displayName = 'TableHeader'

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
))
TableBody.displayName = 'TableBody'

export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('bg-neutral-12 font-medium text-neutral-1', className)} {...props} />
  ),
)
TableFooter.displayName = 'TableFooter'

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b transition-colors hover:bg-bg-emphasis/50 data-[state=selected]:bg-bg-emphasis', className)}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 bg-transparent px-2 text-left align-middle text-[0.9375rem]/[1.25rem] font-medium text-fg-subtle first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'overflow-hidden text-ellipsis whitespace-nowrap px-2 py-3 text-left align-middle first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-sm text-fg-subtle', className)} {...props} />
  ),
)
TableCaption.displayName = 'TableCaption'
