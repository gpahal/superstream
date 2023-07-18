import { Figtree, Source_Code_Pro } from 'next/font/google'

export const sansSerifFont = Figtree({
  subsets: ['latin'],
  variable: '--font-sans-serif',
})

export const monoFont = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-mono',
})
