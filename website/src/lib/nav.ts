import type { Toc } from '@/lib/toc'

export type NavLinkItem = {
  href: string
  label: string
  isExternal?: boolean
}

export const HOMEPAGE_NAV_LINK_ITEM: NavLinkItem = {
  href: '/',
  label: 'Homepage',
}

export const DOCS_NAV_LINK_ITEM: NavLinkItem = {
  href: '/docs',
  label: 'Documentation',
}

export const DASHBOARD_NAV_LINK_ITEM: NavLinkItem = {
  href: '/dashboard',
  label: 'Dashboard',
}

export const DASHBOARD_STREAMS_NAV_LINK_ITEM: NavLinkItem = {
  href: '/dashboard',
  label: 'Streams',
}

export const DASHBOARD_CREATE_STREAM_NAV_LINK_ITEM: NavLinkItem = {
  href: '/dashboard/create',
  label: 'Create stream',
}

export const PROGRAM_API_NAV_LINK_ITEM: NavLinkItem = {
  href: 'https://docs.rs/superstream/latest/superstream/',
  label: 'Superstream program API',
  isExternal: true,
}

export const TS_SDK_API_NAV_LINK_ITEM: NavLinkItem = {
  href: '/references/client-sdks/ts/',
  label: 'Typescript SDK API',
  isExternal: true,
}

export const GITHUB_NAV_LINK_ITEM: NavLinkItem = {
  href: 'https://github.com/gpahal/superstream',
  label: 'Github',
  isExternal: true,
}

export function createNavLinkItemsToc(linkItems: NavLinkItem[], label?: string): Toc<NavLinkItem> {
  return [
    {
      item: { href: '#', label: label || 'Links' },
      children: linkItems.map((link) => ({ item: link, children: [] })),
    },
  ]
}
