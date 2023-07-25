import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'
import { AlertTriangleIcon, BanIcon, InfoIcon, type LucideIcon, type LucideProps } from 'lucide-react'

import { cn } from '@/lib/styles'

const alertVariants = cva(
  'relative flex w-full flex-col rounded-md border px-4 pb-2 pt-[0.8rem] [&:has(svg)]:pl-10 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-[0.75rem] [&>svg]:h-[1.25rem] [&>svg]:w-[1.25rem] [&>svg]:text-fg',
  {
    variants: {
      variant: {
        info: 'border-info-6 bg-info-3 text-info-11 [&>svg]:fill-info-11 [&>svg]:text-info-3',
        warn: 'border-warn-6 bg-warn-3 text-warn-11 [&>svg]:fill-warn-11 [&>svg]:text-warn-3',
        error: 'border-error-6 bg-error-3 text-error-11 [&>svg]:fill-error-11 [&>svg]:text-error-3',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
)

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    hideDefaultIcon?: boolean
  }

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant, hideDefaultIcon, className, children, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {hideDefaultIcon ? (
        children
      ) : (
        <>
          <AlertDefaultIcon />
          {children}
        </>
      )}
    </div>
  ),
)
Alert.displayName = 'Alert'

export type AlertHeadingProps = React.HTMLAttributes<HTMLDivElement>

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex min-h-[1.5rem] items-center text-base font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
)
AlertTitle.displayName = 'AlertTitle'

export type AlertDescriptionProps = React.HTMLAttributes<HTMLDivElement>

export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('text-base', className)} {...props} />,
)
AlertDescription.displayName = 'AlertDescription'

export type AlertDefaultIconProps = LucideProps & VariantProps<typeof alertVariants>

export function getAlertDefaultIcon({ variant }: { variant: AlertDefaultIconProps['variant'] }): LucideIcon {
  switch (variant) {
    case 'warn':
      return AlertTriangleIcon
    case 'error':
      return BanIcon
    default:
      return InfoIcon
  }
}

export const AlertDefaultIcon = React.forwardRef<SVGSVGElement, AlertDefaultIconProps>(({ variant, ...props }, ref) => {
  const Icon = getAlertDefaultIcon({ variant })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <Icon ref={ref} {...props} />
})
AlertDefaultIcon.displayName = 'AlertDefaultIcon'
