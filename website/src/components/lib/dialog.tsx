'use client'

import * as React from 'react'

import { isFunction } from '@gpahal/std/function'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/styles'
import { useWindowViewport } from '@/contexts/window-viewport-context'
import { Button, ButtonProps } from '@/components/lib/button'

export type DialogProps = DialogPrimitive.DialogProps

export const Dialog = DialogPrimitive.Root

export type DialogTriggerProps = DialogPrimitive.DialogTriggerProps

export const DialogTrigger = DialogPrimitive.Trigger

export const dialogPortalVariants = cva('absolute z-50 flex min-h-screen', {
  variants: {
    variant: {
      default: 'items-end justify-center md:items-center',
      'full-screen': '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type DialogPortalProps = DialogPrimitive.DialogPortalProps & VariantProps<typeof dialogPortalVariants>

const DialogPortal = ({ variant, className, children, ...props }: DialogPortalProps) => {
  const windowViewport = useWindowViewport()
  const { width, height, pageLeft, pageTop } = windowViewport

  return (
    <DialogPrimitive.Portal {...props}>
      <div
        className={cn(dialogPortalVariants({ variant }), className)}
        style={{
          width,
          height,
          top: pageTop,
          left: pageLeft,
        }}
      >
        {children}
      </div>
    </DialogPrimitive.Portal>
  )
}
DialogPortal.displayName = DialogPrimitive.Portal.displayName

export const dialogOverlayStyles = cva(
  'absolute inset-0 z-50 bg-bg/80 transition duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
)

type DialogOverlayProps = DialogPrimitive.DialogOverlayProps

const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay ref={ref} className={cn(dialogOverlayStyles(), className)} {...props} />
  ),
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export const dialogContentVariants = cva(
  'relative z-50 flex w-full flex-col gap-4 rounded-none bg-bg p-4 shadow transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300 md:p-6',
  {
    variants: {
      variant: {
        default:
          'border-t data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[8%] data-[state=open]:slide-in-from-bottom-[8%] md:m-4 md:max-w-lg md:rounded-lg md:border',
        'bottom-sheet':
          'inset-x-0 bottom-0 h-fit border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        'left-sheet':
          'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:max-w-sm',
        'right-sheet':
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right md:max-w-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type DialogContentProps = Omit<DialogPrimitive.DialogContentProps, 'children'> &
  VariantProps<typeof dialogContentVariants> & {
    hideCloseButton?: boolean
    children?: React.ReactNode | ((_: { close: () => void }) => React.ReactNode)
  }

export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ variant, hideCloseButton, className, style, children, ...props }, ref) => {
    const { height } = useWindowViewport()

    const closeButtonRef = React.useRef<HTMLButtonElement>(null)

    const close = React.useCallback(() => {
      closeButtonRef.current?.click()
    }, [])

    const isBottomSheetVariant = variant === 'bottom-sheet'

    return (
      <DialogPortal
        variant={variant && variant !== 'default' ? 'full-screen' : 'default'}
        className={isBottomSheetVariant ? '!items-end' : ''}
      >
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(dialogContentVariants({ variant }), className)}
          style={{
            maxHeight: variant === 'left-sheet' || variant === 'right-sheet' ? height : height - 48,
            ...(style || {}),
          }}
          {...props}
        >
          {(isFunction(children) ? children({ close }) : children) as React.ReactNode}
          {!hideCloseButton && (
            <DialogPrimitive.Close
              ref={closeButtonRef}
              className="absolute right-4 top-4 box-content inline-flex h-6 w-6 items-center justify-center rounded border border-neutral-7 bg-bg text-fg text-opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-10 focus-visible:ring-offset-1 disabled:pointer-events-none hocus-visible:text-opacity-100 md:right-6 md:top-6"
            >
              <XIcon className="h-4 w-4" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  },
)
DialogContent.displayName = DialogPrimitive.Content.displayName

export type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>

export const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div className={cn('flex flex-col items-start pl-0 pr-8 text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

export type DialogTitleProps = DialogPrimitive.DialogTitleProps

export const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold tracking-[-0.01em] text-fg', className)}
      {...props}
    />
  ),
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

export type DialogDescriptionProps = DialogPrimitive.DialogDescriptionProps

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-fg-subtle', className)} {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export type DialogActionProps = ButtonProps

export const DialogAction = React.forwardRef<HTMLButtonElement, DialogActionProps>(
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
        <DialogPrimitive.Close ref={closeButtonRef} className="hidden" />
      </>
    )
  },
)
DialogAction.displayName = 'DialogAction'

export type DialogCloseActionProps = ButtonProps

export const DialogCloseAction = React.forwardRef<HTMLButtonElement, DialogCloseActionProps>(
  ({ variant, ...props }, ref) => <DialogAction ref={ref} variant={variant} {...props} />,
)
DialogCloseAction.displayName = 'DialogCloseAction'
