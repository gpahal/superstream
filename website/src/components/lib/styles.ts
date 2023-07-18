import { cva } from 'class-variance-authority'

export const linkStyles = cva('underline-offset-[3px] rounded-md decoration-neutral-7 hocus-visible:outline-none', {
  variants: {
    variant: {
      unstyled: 'no-underline focus-visible:underline',
      highlighted: 'underline hocus-visible:decoration-neutral-8 [&:is(.active)]:decoration-neutral-8',
      'hover-highlighted': 'no-underline hocus-visible:underline [&:is(.active)]:underline',
      link: 'text-link-10 no-underline hocus-visible:underline',
    },
  },
  defaultVariants: {
    variant: 'unstyled',
  },
})

export const buttonStyles = cva(
  'relative inline-flex items-center justify-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-10 focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        outline:
          'ring-neutral-7 text-fg shadow-sm ring-1 ring-inset hover:border-neutral-8 hover:bg-bg-emphasis focus-visible:ring-offset-0',
        ghost: 'text-fg hover:bg-bg-emphasis',
        'link-unstyled': linkStyles({ variant: 'unstyled' }),
        'link-highlighted': linkStyles({ variant: 'highlighted' }),
        'link-hover-highlighted': linkStyles({ variant: 'hover-highlighted' }),
        link: linkStyles({ variant: 'link' }),
        primary: 'bg-primary-9 text-primary-fg ring-1 ring-inset ring-primary-9 shadow-sm hover:bg-primary-10',
        info: 'bg-info-9 text-info-fg ring-1 ring-inset ring-info-9 shadow-sm hover:bg-info-10',
        warn: 'bg-warn-9 text-warn-fg ring-1 ring-inset ring-warn-9 shadow-sm hover:bg-warn-10',
        error: 'bg-error-9 text-error-fg ring-1 ring-inset ring-error-9 shadow-sm hover:bg-error-10',
      },
      size: {
        sm: 'h-8 rounded-[0.33rem] px-[1rem] text-sm',
        md: 'h-9 rounded-[0.375rem] px-[1.2rem] py-2 text-base',
        lg: 'h-10 rounded-[0.42rem] px-[1.4rem] text-lg',
        xl: 'h-11 rounded-[0.475rem] px-[1.6rem] text-xl',
      },
      shape: {
        rect: '',
        square: 'px-0',
      },
      rounded: {
        default: '',
        full: 'rounded-full',
      },
    },
    compoundVariants: [
      {
        size: 'sm',
        shape: 'square',
        className: 'w-8',
      },
      {
        size: 'md',
        shape: 'square',
        className: 'w-9',
      },
      {
        size: 'lg',
        shape: 'square',
        className: 'w-10',
      },
    ],
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      shape: 'rect',
      rounded: 'default',
    },
  },
)

export const buttonSpinnerStyles = cva('text-inherit', {
  variants: {
    size: {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-[1.125rem] h-[1.125rem]',
      xl: 'w-5 h-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
