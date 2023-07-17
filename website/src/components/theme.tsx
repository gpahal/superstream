'use client'

import { CheckIcon, MoonIcon, SunIcon } from 'lucide-react'

import { cn } from '@/lib/styles'
import { THEME_ITEMS, ThemeItem, useThemeContext } from '@/contexts/theme'
import { Button } from '@/components/lib/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIconWrapper,
  DropdownMenuTrigger,
} from '@/components/lib/dropdown-menu'
import { getActiveNavTocVerticalItemClassName, NavTocVerticalItems } from '@/components/nav'

export function ThemeButton() {
  const { theme, setTheme } = useThemeContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Theme " variant="ghost" shape="square">
          <span data-theme="light">
            <SunIcon className="h-5 w-5" />
          </span>
          <span data-theme="dark">
            <MoonIcon className="h-5 w-5" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {THEME_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.theme}
            onSelect={() => {
              setTheme(item.theme)
            }}
          >
            {item.label}
            {item.theme === theme && (
              <DropdownMenuItemIconWrapper className="ml-auto">
                <CheckIcon className="text-fg/50" />
              </DropdownMenuItemIconWrapper>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type ThemeNavTocVericalItemsProps = {
  onThemeItemClick?: (item: ThemeItem) => void
}

export function ThemeNavTocVericalItems({ onThemeItemClick }: ThemeNavTocVericalItemsProps) {
  const { theme, setTheme } = useThemeContext()

  return (
    <NavTocVerticalItems
      toc={[
        {
          item: { ...THEME_ITEMS[0]!, label: 'Theme' },
          children: THEME_ITEMS.map((item) => ({ item, children: [] })),
        },
      ]}
      getItemKey={(item) => item.theme}
      renderLabel={(item) => item.label}
      renderItem={(item) => (
        <Button
          variant="ghost"
          className={cn(getActiveNavTocVerticalItemClassName({ isActive: false }), 'h-auto w-full py-0')}
          onClick={() => {
            setTheme(item.theme)
            onThemeItemClick?.(item)
          }}
        >
          <span
            className={cn(
              getActiveNavTocVerticalItemClassName({ isActive: false }),
              'inline-flex w-full justify-between px-0',
            )}
          >
            {item.label}
            {item.theme === theme && <CheckIcon className="h-[1.05rem] w-[1.05rem] text-fg/40" />}
          </span>
        </Button>
      )}
    />
  )
}
