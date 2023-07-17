'use client'

import * as React from 'react'

import { ExternalLinkIcon } from 'lucide-react'

import { createNavLinkItemsToc, NavLinkItem } from '@/lib/nav'
import { cn } from '@/lib/styles'
import { Toc } from '@/lib/toc'
import { H6 } from '@/components/lib/heading'
import { ActiveLinkState, Link, LinkProps } from '@/components/lib/link'
import { Logo } from '@/components/logo'

export type NavProps = React.HTMLAttributes<HTMLElement> & {
  containerClassName?: string
  hideLogo?: boolean
  logoHref?: LinkProps['href']
  logoSubtitle?: string
  invisible?: boolean
  showOnlyOnTop?: boolean
}

export function Nav({
  containerClassName,
  hideLogo,
  logoHref,
  logoSubtitle,
  showOnlyOnTop,
  className,
  children,
  ...props
}: NavProps) {
  return (
    <nav
      className={cn(
        'sticky z-50 h-[3.5rem] w-full bg-bg text-fg',
        showOnlyOnTop ? 'top-0 border-b' : 'bottom-0 border-t md:bottom-auto md:top-0 md:border-b md:border-t-0',
        containerClassName,
      )}
    >
      <div className={cn('mx-auto flex h-[3.5rem] items-center gap-6 px-6', className)} {...props}>
        {!hideLogo && (
          <Link href={logoHref || '/'} className="flex h-6 items-center gap-2">
            <Logo className="h-6 w-6" />
            {logoSubtitle && (
              <span className="inline-block space-x-[0.1rem] font-semibold">
                <span>Superstream</span>
                <span className="text-fg/30">/</span>
                <span>{logoSubtitle}</span>
              </span>
            )}
          </Link>
        )}
        <div className="flex h-full grow items-center">{children}</div>
      </div>
    </nav>
  )
}

export type NavVerticalSeparatorProps = React.HTMLAttributes<HTMLDivElement>

export function NavVerticalSeparator({ className, ...props }: NavVerticalSeparatorProps) {
  return <div aria-hidden className={cn('h-[2rem] w-[1px] bg-neutral-6 align-middle', className)} {...props} />
}

export type NavListHorizontalProps = React.HTMLAttributes<HTMLUListElement>

export function NavListHorizontal({ className, ...props }: NavListHorizontalProps) {
  return <ul className={cn('flex items-center bg-bg', className)} {...props} />
}

export type NavListHorizontalItemsProps<T> = {
  items: T[]
  getItemKey: (item: T) => React.Key
  renderItem: (item: T) => React.ReactNode
}

export function NavListHorizontalItems<T>({ items, getItemKey, renderItem }: NavListHorizontalItemsProps<T>) {
  return (
    <>
      {items.map((item) => (
        <li key={getItemKey(item)} className="ml-6 flex items-center first:ml-0">
          {renderItem(item)}
        </li>
      ))}
    </>
  )
}

export type NavListHorizontalLinkItemsProps = Omit<LinkProps, 'href'> & {
  linkItems: NavLinkItem[]
}

export function NavListHorizontalLinkItems({
  variant,
  linkItems,
  className,
  ...props
}: NavListHorizontalLinkItemsProps) {
  return (
    <NavListHorizontalItems
      items={linkItems}
      getItemKey={(link) => link.label}
      renderItem={(link) => (
        <Link
          variant={variant || 'hover-highlighted'}
          href={link.href}
          className={(state) => cn(getActiveNavListHorizontalItemClassName(state), className)}
          {...props}
        >
          {link.label}
        </Link>
      )}
    />
  )
}

export function getActiveNavListHorizontalItemClassName({ isActive }: Pick<ActiveLinkState, 'isActive'>) {
  return cn(
    'flex cursor-pointer items-center gap-1 text-[0.9375rem]/[1.25rem] font-normal',
    isActive ? 'opacity-100' : 'opacity-60 hover:opacity-90',
  )
}

export type NavListHorizontalItemProps = {
  itemKey: React.Key
  children: React.ReactNode
}

export function NavListHorizontalItem({ itemKey, children }: NavListHorizontalItemProps) {
  return <NavListHorizontalItems items={[itemKey]} getItemKey={() => itemKey} renderItem={() => children} />
}

export type NavTocVerticalProps = React.HTMLAttributes<HTMLUListElement>

export function NavTocVertical({ className, ...props }: NavTocVerticalProps) {
  return (
    <div className={cn('w-full overflow-y-auto bg-bg', className)}>
      <nav className="w-full">
        <ul className="mt-0.5 w-full space-y-[1.75rem]" {...props} />
      </nav>
    </div>
  )
}

export type NavTocVerticalItemsProps<T> = {
  toc: Toc<T>
  getItemKey: (item: T) => React.Key
  renderLabel: (item: T) => React.ReactNode
  renderItem: (item: T) => React.ReactNode
}

export function NavTocVerticalItems<T>({ toc, getItemKey, renderLabel, renderItem }: NavTocVerticalItemsProps<T>) {
  return (
    <>
      {toc.map((entry) => {
        const hasChildren = entry.children && entry.children.length > 0
        return (
          <li key={getItemKey(entry.item)} className="w-full">
            {hasChildren ? (
              <H6 className="block w-full px-4 pb-[0.3rem] text-base font-medium text-fg md:text-sm">
                {renderLabel(entry.item)}
              </H6>
            ) : (
              renderItem(entry.item)
            )}
            {entry.children && entry.children.length > 0 && (
              <ul className="w-full space-y-[0.05rem]">
                {entry.children.map(({ item }) => (
                  <li key={getItemKey(item)} className="w-full">
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </>
  )
}

export type NavTocVerticalLinkItemsProps = Omit<LinkProps, 'href'> & {
  linkItems: NavLinkItem[]
  label?: string
}

export function NavTocVerticalLinkItems({ linkItems, label, className, ...props }: NavTocVerticalLinkItemsProps) {
  return (
    <NavTocVerticalItems
      toc={createNavLinkItemsToc(linkItems, label)}
      getItemKey={(link) => link.href}
      renderLabel={(link) => link.label}
      renderItem={(link) => (
        <Link
          href={link.href}
          target={link.isExternal ? '_blank' : undefined}
          className={(state) => cn(getActiveNavTocVerticalItemClassName(state), className)}
          {...props}
        >
          {link.label}
          {link.isExternal && <ExternalLinkIcon className="ml-2 h-[1.05rem] w-[1.05rem] shrink-0 text-fg/40" />}
        </Link>
      )}
    />
  )
}

export function getActiveNavTocVerticalItemClassName({ isActive }: Pick<ActiveLinkState, 'isActive'>) {
  return cn(
    'flex cursor-pointer items-center justify-between gap-2 rounded px-4 py-1 text-base font-subtlelight md:py-[0.175rem] md:text-sm',
    isActive ? 'bg-neutral-4 text-fg/80' : 'hover:bg-neutral-4 text-fg/60',
  )
}
