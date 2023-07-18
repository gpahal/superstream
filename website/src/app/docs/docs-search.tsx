'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { ExternalLinkIcon, FileIcon, HashIcon } from 'lucide-react'
import { z } from 'zod'

import { ContentSearchDocument } from '@/lib/content'
import { DocsFrontmatterSchema, FlattenedDocs } from '@/lib/docs'
import { DASHBOARD_NAV_LINK_ITEM, DOCS_NAV_LINK_ITEM, GITHUB_NAV_LINK_ITEM, HOMEPAGE_NAV_LINK_ITEM } from '@/lib/nav'
import { cn } from '@/lib/styles'
import { THEME_ITEMS, useThemeContext } from '@/contexts/theme'
import { useContentCollectionSearch } from '@/hooks/use-content-collection-search'
import { DisclosureState, useDisclosure } from '@/hooks/use-disclosure'
import { useSearch } from '@/hooks/use-search'
import { Button, ButtonProps } from '@/components/lib/button'
import {
  Command,
  CommandDialog,
  CommandDialogProps,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandItemIconWrapper,
  CommandList,
  CommandSeparator,
} from '@/components/lib/command'
import { Kbd } from '@/components/lib/kbd'
import { SearchHit } from '@/components/search'

type DocsSearchContextValue = DisclosureState

const DocsSearchContext = React.createContext({} as DocsSearchContextValue)

export type DocsSearchProviderProps = {
  docsSearchDocuments: ContentSearchDocument[]
  docs: FlattenedDocs
  children: React.ReactNode
}

export function DocsSearchProvider({ docsSearchDocuments, docs, children }: DocsSearchProviderProps) {
  const disclosureState = useDisclosure()
  const toggle = disclosureState.toggle

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggle])

  return (
    <DocsSearchContext.Provider value={disclosureState}>
      {children}
      <DocsSearchButtonCommandDialog docsSearchDocuments={docsSearchDocuments} docs={docs} />
    </DocsSearchContext.Provider>
  )
}

const NAV_LINK_ITEMS = [HOMEPAGE_NAV_LINK_ITEM, DOCS_NAV_LINK_ITEM, DASHBOARD_NAV_LINK_ITEM, GITHUB_NAV_LINK_ITEM]

type DocsSearchButtonCommandDialogProps = Omit<CommandDialogProps, 'children'> & {
  docsSearchDocuments: ContentSearchDocument[]
  docs: FlattenedDocs
}

function DocsSearchButtonCommandDialog({ docsSearchDocuments, docs, ...props }: DocsSearchButtonCommandDialogProps) {
  const router = useRouter()
  const { setTheme } = useThemeContext()

  const { search: quickLinksSearch, filteredResults: filteredQuickLinks } = useSearch(
    NAV_LINK_ITEMS,
    React.useCallback(
      (item) => ({
        id: item.href,
        title: item.label,
        content: '',
      }),
      [],
    ),
  )
  const { search: themesSearch, filteredResults: filteredThemes } = useSearch(
    THEME_ITEMS,
    React.useCallback(
      (item) => ({
        id: item.theme,
        title: item.label,
        content: '',
      }),
      [],
    ),
  )

  const { search: docsSearch, filteredResults: filteredDocs } = useContentCollectionSearch(
    'docs',
    getContentTitle,
    docs,
    docsSearchDocuments,
  )

  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    const params = { term: searchQuery, limit: 15 }
    quickLinksSearch(params)
    themesSearch(params)
    docsSearch(params)
  }, [searchQuery, quickLinksSearch, themesSearch, docsSearch])

  const hasUpperSection = filteredQuickLinks.length > 0 || filteredDocs.length > 0
  const hasLowerSection = filteredThemes.length > 0
  const isEmpty = !hasUpperSection && !hasLowerSection

  const { isOpen, setIsOpen } = React.useContext(DocsSearchContext)

  const setIsOpenWrapper = React.useCallback(
    (value: boolean) => {
      setIsOpen(value)
      if (!value) {
        setSearchQuery('')
      }
    },
    [setIsOpen],
  )

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setIsOpen(false)
      command()
    },
    [setIsOpen],
  )

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpenWrapper} {...props}>
      <Command shouldFilter={false}>
        <CommandInput placeholder="Type a command or search..." value={searchQuery} onValueChange={setSearchQuery} />
        <CommandList>
          {isEmpty && <CommandEmpty>No results found</CommandEmpty>}
          {filteredQuickLinks.length > 0 && (
            <CommandGroup heading="Quick links">
              {filteredQuickLinks.map((item) => (
                <CommandItem
                  key={item.item.href}
                  value={item.item.label}
                  onSelect={() => {
                    runCommand(() => router.push(item.item.href))
                  }}
                  className="flex-start"
                >
                  <SearchHit hit={item} />
                  {item.item.isExternal ? <ExternalLinkIcon className="ml-auto h-4 w-4 text-fg-subtle/80" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {filteredDocs.length > 0
            ? filteredDocs.map((result) =>
                result.children && result.children.length > 0 ? (
                  <CommandGroup key={result.id} heading={result.document.title}>
                    {result.children.map((pageItem) => (
                      <React.Fragment key={pageItem.id}>
                        <CommandItem
                          key={pageItem.id}
                          value={pageItem.id}
                          onSelect={() => {
                            runCommand(() => router.push(`/docs/${pageItem.document.path}`))
                          }}
                          className="items-start"
                        >
                          <CommandItemIconWrapper>
                            <FileIcon />
                          </CommandItemIconWrapper>
                          <SearchHit hit={pageItem} />
                        </CommandItem>
                        {pageItem.children && pageItem.children.length > 0
                          ? pageItem.children.map((sectionItem) => (
                              <CommandItem
                                key={sectionItem.id}
                                value={sectionItem.id}
                                onSelect={() => {
                                  runCommand(() => router.push(`/docs/${sectionItem.document.path}`))
                                }}
                                className="items-start py-1.5 pl-5"
                              >
                                <CommandItemIconWrapper>
                                  <HashIcon />
                                </CommandItemIconWrapper>
                                <SearchHit hit={sectionItem} />
                              </CommandItem>
                            ))
                          : null}
                      </React.Fragment>
                    ))}
                  </CommandGroup>
                ) : null,
              )
            : null}
          {hasUpperSection && hasLowerSection ? <CommandSeparator /> : null}
          {hasLowerSection && (
            <CommandGroup heading="Theme">
              {filteredThemes.map((item) => (
                <CommandItem
                  key={item.item.theme}
                  value={item.item.label}
                  onSelect={() => {
                    runCommand(() => setTheme(item.item.theme))
                  }}
                  className="flex-start"
                >
                  <CommandItemIconWrapper>
                    <item.item.icon />
                  </CommandItemIconWrapper>
                  <SearchHit hit={item} />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

function getContentTitle(frontmatter: z.output<DocsFrontmatterSchema>): string {
  return frontmatter.title
}

export type DocsSearchButtonProps = Omit<ButtonProps, 'children'>

export function DocsSearchButton({ onClick, className, ...props }: DocsSearchButtonProps) {
  const { toggle } = React.useContext(DocsSearchContext)

  const onClickWrapper = async (e: React.MouseEvent<HTMLButtonElement>) => {
    toggle()
    await onClick?.(e)
  }

  return (
    <Button
      variant="ghost"
      onClick={onClickWrapper}
      className={cn(
        'relative w-full justify-start bg-neutral-6/50 text-sm text-fg-subtle hover:bg-neutral-6/30 sm:pr-12 md:w-44 lg:w-72',
        className,
      )}
      {...props}
    >
      <span className="inline-flex w-full items-center">
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <Kbd className="absolute right-[0.375rem] top-[0.375rem] hidden gap-1 sm:flex">
          <span className="mt-0.5">⌘</span>
          <span>K</span>
        </Kbd>
      </span>
    </Button>
  )
}
