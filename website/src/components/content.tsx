'use client'

import * as React from 'react'

import { RenderableTreeNodes, renderReact, Tag } from '@gpahal/markdoc'

import { cn } from '@/lib/styles'
import { Alert, AlertDescription, AlertProps, AlertTitle } from '@/components/lib/alert'
import { H1, H2, H3, H4, H5, H6 } from '@/components/lib/heading'
import { Image, ImageProps } from '@/components/lib/image'
import { Link, LinkProps } from '@/components/lib/link'

export type ContentComponents = Record<string, React.ElementType>

const DEFAULT_COMPONENTS = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  a: ContentLink,
  img: ContentImage,
  Alert: ContentAlert,
  Badges: ContentBadges,
  Badge: ContentBadge,
} as const

export type ContentProps = {
  content?: RenderableTreeNodes
  components?: ContentComponents
}

export function Content({ content: contentProp, components }: ContentProps) {
  const content = React.useMemo(() => {
    const content = contentProp
    if (Tag.isTag(content) && content.name === 'article') {
      return new Tag('div', { 'data-content': '', className: 'relative' }, content.children)
    }
    return content
  }, [contentProp])

  return content ? renderReact(React, content, { ...DEFAULT_COMPONENTS, ...(components || {}) }) : null
}

type ContentLinkProps = LinkProps

function ContentLink({ variant, ...props }: ContentLinkProps) {
  variant = variant || 'highlighted'
  return <Link variant={variant} data-variant={variant} {...props} />
}

type ContentImageProps = Omit<ImageProps, 'alt'> & {
  alt?: string
}

function ContentImage({ alt, className, ...props }: ContentImageProps) {
  return <Image alt={alt || ''} className={cn('w-auto', className)} {...props} />
}

type ContentAlertProps = AlertProps & {
  title: string | React.ReactNode
}

function ContentAlert({ title, children, ...props }: ContentAlertProps) {
  return (
    <Alert {...props}>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children ? <AlertDescription>{children}</AlertDescription> : null}
    </Alert>
  )
}

type ContentBadgesProps = React.HTMLAttributes<HTMLDivElement>

function ContentBadges({ className, ...props }: ContentBadgesProps) {
  return <span className={cn('flex h-5 w-full gap-1', className)} {...props} />
}

type ContentBadgeProps = React.HTMLAttributes<HTMLDivElement>

function ContentBadge({ className, ...props }: ContentBadgeProps) {
  return <span className={cn('inline h-5 w-auto', className)} {...props} />
}
