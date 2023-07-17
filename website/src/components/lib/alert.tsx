import * as React from 'react'

import { cva, VariantProps } from 'class-variance-authority'
import { AlertTriangleIcon, BanIcon, InfoIcon, LightbulbIcon, LucideIcon, LucideProps } from 'lucide-react'

import { cn } from '@/lib/styles'

const alertVariants = cva(
  'relative flex w-full flex-col gap-2.5 rounded-md border px-4 pb-3 pt-[1.05rem] [&:has(svg)]:pl-11 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3.5 [&>svg]:top-[1.05rem] [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem] [&>svg]:text-fg',
  {
    variants: {
      variant: {
        default: 'bg-bg text-fg rounded-md',
        info: 'border-info-6 bg-info-3 text-info-9 [&>svg]:text-info-9',
        warn: 'border-warn-6 bg-warn-3 text-warn-9 [&>svg]:text-warn-9',
        error: 'border-error-6 bg-error-3 text-error-9 [&>svg]:text-error-9',
      },
    },
    defaultVariants: {
      variant: 'default',
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
      className={cn('flex min-h-[1.5rem] items-center text-base font-medium leading-none tracking-tight', className)}
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
    case 'info':
      return InfoIcon
    case 'warn':
      return AlertTriangleIcon
    case 'error':
      return BanIcon
    default:
      return LightbulbIcon
  }
}

export const AlertDefaultIcon = React.forwardRef<SVGSVGElement, AlertDefaultIconProps>(({ variant, ...props }, ref) => {
  const Icon = getAlertDefaultIcon({ variant })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <Icon ref={ref} {...props} />
})
AlertDefaultIcon.displayName = 'AlertDefaultIcon'
