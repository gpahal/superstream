import * as React from 'react'

import { useEventCallback } from '@/hooks/use-event-callback'
import { useEventListener } from '@/hooks/use-event-listener'

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WindowEventMap {
    'local-storage': CustomEvent
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const readValue = React.useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (parseJSON(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error)
      return initialValue
    }
  }, [initialValue, key])

  const [storedValue, setStoredValue] = React.useState<T>(readValue)

  const setValue: React.Dispatch<React.SetStateAction<T>> = useEventCallback((value: unknown) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`)
    }

    try {
      const newValue = (value instanceof Function ? value(storedValue) : value) as T
      window.localStorage.setItem(key, JSON.stringify(newValue))
      setStoredValue(newValue)
      window.dispatchEvent(new Event('local-storage'))
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error)
    }
  })

  React.useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStorageChange = React.useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
        return
      }
      setStoredValue(readValue())
    },
    [key, readValue],
  )

  useEventListener('storage', handleStorageChange)
  useEventListener('local-storage', handleStorageChange)

  return [storedValue, setValue]
}

function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === 'undefined' ? undefined : (JSON.parse(value || '') as T)
  } catch {
    console.warn('JSON parsing error on', { value })
    return undefined
  }
}
