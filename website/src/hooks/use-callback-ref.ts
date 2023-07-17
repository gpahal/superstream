import * as React from 'react'

export function useCallbackRef<T extends (...args: unknown[]) => unknown>(callback?: T): T {
  const callbackRef = React.useRef(callback)

  React.useEffect(() => {
    callbackRef.current = callback
  })

  // https://github.com/facebook/react/issues/19240
  return React.useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, [])
}
