import { Inconsolata, Lexend } from 'next/font/google'

export const sansSerifFont = Lexend({
  subsets: ['latin'],
  variable: '--font-sans-serif',
})

export const monoFont = Inconsolata({
  subsets: ['latin'],
  variable: '--font-mono',
})
