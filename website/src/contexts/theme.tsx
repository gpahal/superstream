import * as React from 'react'

import { LaptopIcon, LucideIcon, MoonIcon, SunIcon } from 'lucide-react'

import { isServer } from '@/lib/env'
import { useLocalStorage } from '@/hooks/use-local-storage'

export type Theme = 'light' | 'dark' | 'system'

export type ThemeItem = {
  theme: Theme
  label: string
  icon: LucideIcon
}

export const THEME_ITEMS: ThemeItem[] = [
  { theme: 'light' as Theme, label: 'Light', icon: SunIcon },
  { theme: 'dark' as Theme, label: 'Dark', icon: MoonIcon },
  { theme: 'system' as Theme, label: 'System', icon: LaptopIcon },
]

export type ThemeContextValue = {
  theme: Theme
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
}

const ThemeContext = React.createContext({} as ThemeContextValue)

export type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system')

  React.useEffect(() => {
    if (isServer) {
      return
    }

    const d = document.documentElement
    if (theme === 'light') {
      d.classList.add('light')
      d.classList.remove('dark')
      d.style.colorScheme = 'light'
    } else if (theme === 'dark') {
      d.classList.add('dark')
      d.classList.remove('light')
      d.style.colorScheme = 'dark'
    } else {
      d.classList.remove('light')
      d.classList.remove('dark')
    }
  }, [theme])

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  return React.useContext(ThemeContext)
}

function ThemeScriptUnmemoized() {
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `var d=document.documentElement,c=d.classList;var t=JSON.parse(localStorage.getItem('theme')||'""');c.remove('light','dark');if(t==='light'){c.add('light');d.style.colorScheme='light'}else if(t==='dark'){c.add('dark');d.style.colorScheme='dark'};`,
      }}
    />
  )
}

export const ThemeScript = React.memo(ThemeScriptUnmemoized, () => true)
