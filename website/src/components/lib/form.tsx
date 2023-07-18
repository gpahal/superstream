'use client'

import * as React from 'react'

import * as LabelPrimitive from '@radix-ui/react-label'
import * as SlotPrimitive from '@radix-ui/react-slot'
import { cva, VariantProps } from 'class-variance-authority'
import {
  Controller,
  ControllerProps,
  FieldError,
  FieldPath,
  FieldValues,
  FormProvider as FormProviderLib,
  FormProviderProps as FormProviderLibProps,
  useFormContext,
} from 'react-hook-form'

import { cn } from '@/lib/styles'
import { Label, LabelProps } from '@/components/lib/label'

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
> = FormProviderLibProps<TFieldValues, TContext, TTransformedValues>

export const FormProvider = FormProviderLib

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext({} as FormFieldContextValue)

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName>

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FormFieldProps<TFieldValues, TName>,
) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

export type FormFieldState = {
  id: string
  name: string
  formItemId: string
  formItemDirection: VariantProps<typeof formItemStyles>['direction']
  formDescriptionId: string
  formMessageId: string
  invalid: boolean
  isDirty: boolean
  isTouched: boolean
  error?: FieldError
}

export function useFormField(): FormFieldState {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id, direction } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemDirection: direction,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

export const formItemStyles = cva('flex items-start', {
  variants: {
    direction: {
      col: 'flex-col gap-1.5',
      row: 'flex-row gap-2.5',
    },
  },
  defaultVariants: {
    direction: 'col',
  },
})

type FormItemContextValue = {
  id: string
  direction: VariantProps<typeof formItemStyles>['direction']
}

const FormItemContext = React.createContext({} as FormItemContextValue)

export type FormItemProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof formItemStyles>

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(({ direction, className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id, direction }}>
      <div ref={ref} className={cn(formItemStyles({ direction }), className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = 'FormItem'

export type FormLabelProps = LabelProps

export const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, FormLabelProps>(
  (props, ref) => {
    const { formItemId } = useFormField()

    return <Label ref={ref} htmlFor={formItemId} {...props} />
  },
)
FormLabel.displayName = 'FormLabel'

export type FormControlProps = SlotPrimitive.SlotProps

export const FormControl = React.forwardRef<React.ElementRef<typeof SlotPrimitive.Root>, FormControlProps>(
  (props, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return (
      <SlotPrimitive.Root
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    )
  },
)
FormControl.displayName = 'FormControl'

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { formItemDirection, formDescriptionId } = useFormField()

    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn(
          'text-[0.9375rem]/[1.25rem] text-fg-subtle',
          formItemDirection !== 'row' && 'mt-[-0.2rem]',
          className,
        )}
        {...props}
      />
    )
  },
)
FormDescription.displayName = 'FormDescription'

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message || 'Unknwon error') : children

    if (!body) {
      return null
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('text-[0.9375rem]/[1.25rem]', error ? 'text-error-9' : 'text-fg-subtle', className)}
        {...props}
      >
        {body}
      </p>
    )
  },
)
FormMessage.displayName = 'FormMessage'

export type FormRootMessageProps = React.HTMLAttributes<HTMLParagraphElement>

export const FormRootMessage = React.forwardRef<HTMLParagraphElement, FormRootMessageProps>(
  ({ className, children, ...props }, ref) => {
    const {
      formState: { errors },
    } = useFormContext()

    const error = errors.root
    const body = error ? String(error?.message) : children

    if (!body) {
      return null
    }

    return (
      <p
        ref={ref}
        className={cn('text-[0.9375rem]/[1.25rem]', error ? 'text-error-9' : 'text-fg-subtle', className)}
        {...props}
      >
        {body}
      </p>
    )
  },
)
FormRootMessage.displayName = 'FormRootMessage'
