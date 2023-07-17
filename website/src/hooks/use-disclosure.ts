import * as React from 'react'

export type DisclosureState = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  open: () => void
  close: () => void
  toggle: () => void
}

export function useDisclosure(): DisclosureState {
  const [isOpen, setIsOpen] = React.useState(false)
  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), [])
  return { isOpen, setIsOpen, open, close, toggle }
}
