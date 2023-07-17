'use client'

import * as React from 'react'

import { RenderableTreeNodes, renderReact, Tag } from '@gpahal/markdoc-react'
import {
  CheckIcon,
  CopyIcon,
  FileCode2Icon,
  FileCogIcon,
  FileJson2Icon,
  FileTextIcon,
  TerminalIcon,
} from 'lucide-react'

import { cn } from '@/lib/styles'
import { Alert, AlertDescription, AlertProps, AlertTitle } from '@/components/lib/alert'
import { Button } from '@/components/lib/button'
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
  'code-block': ContentCodeBlock,
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

function getCodeBlockFileIcon(language: string) {
  if (['sh', 'bash', 'zsh'].includes(language)) {
    return TerminalIcon
  } else if (['yaml', 'yml', 'toml'].includes(language)) {
    return FileCogIcon
  } else if (['json'].includes(language)) {
    return FileJson2Icon
  } else if (['txt'].includes(language)) {
    return FileTextIcon
  } else {
    return FileCode2Icon
  }
}

function getCodeBlockFileName(fileName: string, language: string) {
  if (fileName) {
    return fileName
  }
  if (['sh', 'bash', 'zsh'].includes(language)) {
    return 'Terminal'
  } else if (['yaml', 'yml', 'toml'].includes(language)) {
    return 'YAML'
  } else if (['toml'].includes(language)) {
    return 'TOML'
  } else if (['json'].includes(language)) {
    return 'JSON'
  } else if (['txt'].includes(language)) {
    return 'Text'
  } else {
    return `Code (.${language})`
  }
}

type ContentCodeBlockProps = React.HTMLAttributes<HTMLDivElement> & {
  'data-content'?: string
  'data-file-name'?: string
  'data-language'?: string
  'data-show-line-numbers'?: string
}

function ContentCodeBlock({ className, children, ...props }: ContentCodeBlockProps) {
  const content = (props['data-content'] || '').trim()
  const fileName = (props['data-file-name'] || '').trim()
  const language = (props['data-language'] || '').trim()
  const Icon = getCodeBlockFileIcon(language)

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [isCopied, setIsCopied] = React.useState(false)

  const onClick = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => setIsCopied(false), 1000)
    }
  }

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-md border', className)} {...props}>
      <div className="flex h-10 w-full flex-row items-center justify-between gap-4 bg-bg-emphasis px-4 text-sm text-fg/75">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {getCodeBlockFileName(fileName, language)}
        </div>
        <Button
          aria-label="Copy code"
          variant="ghost"
          shape="square"
          className="h-6 w-6 shrink-0 text-fg/60 hocus-visible:text-fg/100"
          onClick={isCopied ? undefined : onClick}
        >
          {isCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
        </Button>
      </div>
      <div>{children}</div>
    </div>
  )
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
