import * as React from 'react'

import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/styles'

export type ToastProviderProps = ToastPrimitives.ToastProviderProps

export const ToastProvider = ToastPrimitives.Provider

export type ToastViewportProps = ToastPrimitives.ToastViewportProps

export const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Viewport>, ToastViewportProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        'fixed bottom-[3.5rem] z-[100] flex max-h-screen w-full flex-col p-4 md:bottom-auto md:right-0 md:top-[3.5rem] md:max-w-[420px] md:flex-col-reverse',
        className,
      )}
      {...props}
    />
  ),
)
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

export const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 rounded-md py-2.5 pl-4 pr-8 shadow-md ring-1 ring-inset transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full data-[state=open]:md:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'bg-bg text-fg ring-neutral-6',
        error: 'error group bg-error-2 text-error-11 ring-error-6',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type ToastProps = ToastPrimitives.ToastProps & VariantProps<typeof toastVariants>

export const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(
  ({ className, variant, ...props }, ref) => {
    return <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
  },
)
Toast.displayName = ToastPrimitives.Root.displayName

export type ToastCloseProps = ToastPrimitives.ToastCloseProps

export const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Close>, ToastCloseProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Close
      ref={ref}
      toast-close=""
      className={cn(
        'absolute right-2 top-[0.675rem] box-content inline-flex h-6 w-6 items-center justify-center rounded-full text-fg opacity-50 transition-all focus:outline-none focus:ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-10 focus-visible:ring-offset-1 disabled:pointer-events-none group-[.error]:text-error-11 hocus:opacity-100',
        className,
      )}
      {...props}
    >
      <XIcon className="h-4 w-4" />
    </ToastPrimitives.Close>
  ),
)
ToastClose.displayName = ToastPrimitives.Close.displayName

export type ToastTitleProps = ToastPrimitives.ToastTitleProps

export const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, ToastTitleProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Title ref={ref} className={cn('font-semibold [&+div]:text-sm', className)} {...props} />
  ),
)
ToastTitle.displayName = ToastPrimitives.Title.displayName

export type ToastDescriptionProps = ToastPrimitives.ToastDescriptionProps

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('opacity-80', className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY_IN_MS = 5 * 60 * 1000 // 5 minutes

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
}

const ACTION_TYPES = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof ACTION_TYPES

type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['UPDATE_TOAST']
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType['DISMISS_TOAST']
      toastId?: ToasterToast['id']
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: ToasterToast['id']
    }

export type State = {
  toasts: ToasterToast[]
}

const TOAST_TIMEOUTS = new Map<string, ReturnType<typeof setTimeout>>()

function addToRemoveQueue(toastId: string) {
  if (TOAST_TIMEOUTS.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    TOAST_TIMEOUTS.delete(toastId)
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY_IN_MS)

  TOAST_TIMEOUTS.set(toastId, timeout)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: ((_: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export type Toast = Omit<ToasterToast, 'id'>

export type ToastHandle = {
  id: string
  dismiss: () => void
  update: (props: Toast) => void
}

function addToast(toast: Toast): ToastHandle {
  const id = genId()

  const update = (props: Toast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...toast,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

export type ToastContextValue = {
  toasts: ToasterToast[]
  addToast: (props: Toast) => ToastHandle
  dismiss: (toastId?: string) => void
}

export function useToastContext(): ToastContextValue {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state, setState])

  return {
    ...state,
    addToast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

export function useAddToast() {
  return useToastContext().addToast
}
