'use client'

import * as React from 'react'

import { isFunction } from '@gpahal/std/function'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/styles'
import { useWindowViewport } from '@/contexts/window-viewport-context'
import { Button, ButtonProps } from '@/components/lib/button'
import { dialogContentVariants, dialogOverlayStyles, dialogPortalVariants } from '@/components/lib/dialog'

export type AlertDialogProps = AlertDialogPrimitive.AlertDialogProps

export const AlertDialog = AlertDialogPrimitive.Root

export type AlertDialogTriggerProps = AlertDialogPrimitive.AlertDialogTriggerProps

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger

type AlertDialogPortalProps = AlertDialogPrimitive.AlertDialogPortalProps & VariantProps<typeof dialogPortalVariants>

const AlertDialogPortal = ({ variant, children, ...props }: AlertDialogPortalProps) => {
  const windowViewport = useWindowViewport()
  const { width, height, pageLeft, pageTop } = windowViewport

  return (
    <AlertDialogPrimitive.Portal {...props}>
      <div
        className={dialogPortalVariants({ variant })}
        style={{
          width,
          height,
          left: pageLeft,
          top: pageTop,
        }}
      >
        {children}
      </div>
    </AlertDialogPrimitive.Portal>
  )
}
AlertDialogPortal.displayName = AlertDialogPrimitive.Portal.displayName

type AlertDialogOverlayProps = AlertDialogPrimitive.AlertDialogOverlayProps

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  AlertDialogOverlayProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay ref={ref} className={cn(dialogOverlayStyles(), className)} {...props} />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

export type AlertDialogContentProps = Omit<AlertDialogPrimitive.AlertDialogContentProps, 'children'> &
  VariantProps<typeof dialogContentVariants> & {
    children?: React.ReactNode | ((_: { close: () => void }) => React.ReactNode)
  }

export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(({ variant, className, style, children, ...props }, ref) => {
  const { height } = useWindowViewport()

  const closeButtonRef = React.useRef<HTMLButtonElement>(null)

  const close = React.useCallback(() => {
    closeButtonRef.current?.click()
  }, [])

  const isBottomSheetVariant = variant === 'bottom-sheet'

  return (
    <AlertDialogPortal
      variant={variant && variant !== 'default' ? 'full-screen' : 'default'}
      className={isBottomSheetVariant ? 'md:items-end' : ''}
    >
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(dialogContentVariants({ variant }), className)}
        style={{
          maxHeight: variant === 'left-sheet' || variant === 'right-sheet' ? height : height - 48,
          ...(style || {}),
        }}
        {...props}
      >
        {(isFunction(children) ? children({ close }) : children) as React.ReactNode}
        <AlertDialogPrimitive.Cancel
          ref={closeButtonRef}
          className="absolute right-4 top-4 box-content inline-flex h-6 w-6 items-center justify-center rounded border border-neutral-7 bg-bg text-fg text-opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-10 focus-visible:ring-offset-1 disabled:pointer-events-none hocus-visible:text-opacity-100 md:right-6 md:top-6"
        >
          <XIcon className="h-4 w-4" />
        </AlertDialogPrimitive.Cancel>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

export type AlertDialogHeaderProps = React.HTMLAttributes<HTMLDivElement>

export const AlertDialogHeader = ({ className, ...props }: AlertDialogHeaderProps) => (
  <div className={cn('flex flex-col items-start gap-4 pl-0 pr-8 text-left', className)} {...props} />
)
AlertDialogHeader.displayName = 'AlertDialogHeader'

export type AlertDialogTitleProps = AlertDialogPrimitive.AlertDialogTitleProps

export const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  AlertDialogTitleProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold tracking-[-0.01em] text-fg', className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

export type AlertDialogDescriptionProps = AlertDialogPrimitive.AlertDialogDescriptionProps

export const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  AlertDialogDescriptionProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn('text-base text-fg', className)} {...props} />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

export type AlertDialogActionProps = ButtonProps

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ isLoading: isLoadingProp, onClick, ...props }, ref) => {
    const closeButtonRef = React.useRef<HTMLButtonElement>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const onClickWrapper = async (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        if (onClick) {
          setIsLoading(true)
          await onClick?.(e)
        }
        if (!e.defaultPrevented && closeButtonRef.current) {
          closeButtonRef.current.click()
        }
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <>
        <Button ref={ref} {...props} isLoading={isLoading || isLoadingProp} onClick={onClickWrapper} />
        <AlertDialogPrimitive.Cancel ref={closeButtonRef} className="hidden" />
      </>
    )
  },
)
AlertDialogAction.displayName = 'AlertDialogAction'

export type AlertDialogCloseActionProps = ButtonProps

export const AlertDialogCloseAction = React.forwardRef<HTMLButtonElement, AlertDialogCloseActionProps>(
  ({ variant, ...props }, ref) => <AlertDialogAction ref={ref} variant={variant} {...props} />,
)
AlertDialogCloseAction.displayName = 'AlertDialogCloseAction'
