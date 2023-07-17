'use client'

import * as React from 'react'

import { Input, InputProps } from '@/components/lib/input'

export type DateTimeInputProps = Omit<InputProps, 'type' | 'defaultValue' | 'value' | 'onChange' | 'min' | 'max'> & {
  hideTimeInput?: boolean
  defaultValue?: number
  value?: number
  onChange?: (value: number | undefined, e: React.ChangeEvent<HTMLInputElement>) => void
  min?: number
  max?: number
}

export const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  (
    {
      defaultValue: defaultUnixTimeMillis,
      value: unixTimeMillis,
      onChange: onUnixTimeMillisChange,
      min: minUnixTimeMillis,
      max: maxUnixTimeMillis,
      disabled,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState(
      unixTimeMillisToValue(unixTimeMillis == null ? defaultUnixTimeMillis : unixTimeMillis),
    )

    React.useEffect(() => {
      setValue(unixTimeMillisToValue(unixTimeMillis))
    }, [unixTimeMillis])

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value || '')
      if (e.target.validity.valid && onUnixTimeMillisChange) {
        onUnixTimeMillisChange(valueToUnixTimeMillis(e.target.value), e)
      }
    }

    const min = React.useMemo(() => unixTimeMillisToValue(minUnixTimeMillis), [minUnixTimeMillis])
    const max = React.useMemo(() => unixTimeMillisToValue(maxUnixTimeMillis), [maxUnixTimeMillis])

    return (
      <Input
        ref={ref}
        type={disabled ? 'text' : 'datetime-local'}
        value={disabled ? placeholder || value : value}
        onChange={onChange}
        min={min}
        max={max}
        disabled={disabled}
        {...props}
      />
    )
  },
)
DateTimeInput.displayName = 'DateTimeInput'

function unixTimeMillisToValue(newUnixValue?: number): string {
  if (!newUnixValue || newUnixValue <= 0) {
    return ''
  }
  return new Date(newUnixValue).toLocaleString('sv').replace(' ', 'T')
}

function valueToUnixTimeMillis(value?: string): number {
  if (!value) {
    return 0
  }

  try {
    return Date.parse(value)
  } catch {
    return 0
  }
}
