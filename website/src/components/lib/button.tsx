'use client'

import * as React from 'react'

import { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/styles'
import { Spinner } from '@/components/lib/spinner'
import { buttonSpinnerStyles, buttonStyles } from '@/components/lib/styles'

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> &
  VariantProps<typeof buttonStyles> & {
    isLoading?: boolean
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
  }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      shape,
      rounded,
      isLoading: isLoadingProp,
      type,
      disabled,
      onClick: onClickProp,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [isLoadingLocal, setIsLoadingLocal] = React.useState(false)
    const isLoading = isLoadingProp || isLoadingLocal

    const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) {
        e.preventDefault()
        return
      }

      setIsLoadingLocal(true)
      try {
        await onClickProp?.(e)
      } finally {
        setIsLoadingLocal(false)
      }
    }

    return (
      <button
        ref={ref}
        type={type || 'button'}
        disabled={isLoading || disabled}
        onClick={onClick}
        className={cn(
          buttonStyles({ variant, size, shape, rounded }),
          isLoading || disabled ? 'pointer-events-none' : '',
          disabled ? 'opacity-25' : '',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className={buttonSpinnerStyles({ size })} />
          </div>
        ) : null}
        <div className={cn('inline-flex w-full items-center justify-center', isLoading && 'invisible opacity-0')}>
          {children}
        </div>
      </button>
    )
  },
)
Button.displayName = 'Button'
