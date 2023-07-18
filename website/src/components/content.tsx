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
  LucideIcon,
  TerminalIcon,
} from 'lucide-react'

import { cn } from '@/lib/styles'
import { Alert, AlertDescription, AlertProps, AlertTitle } from '@/components/lib/alert'
import { Button } from '@/components/lib/button'
import { H1, H2, H3, H4, H5, H6 } from '@/components/lib/heading'
import { Image, ImageProps } from '@/components/lib/image'
import { Link, LinkProps } from '@/components/lib/link'
import { Tabs, TabsContent, TabsList, TabsProps, TabsTrigger } from '@/components/lib/tabs'

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
  CodeBlock: ContentCodeBlock,
  'code-block-group': ContentCodeBlockGroup,
  CodeBlockGroup: ContentCodeBlockGroup,
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

function getCodeBlockFileIcon(language: string): LucideIcon {
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

function getCodeBlockName(name: string, language: string, variant: string): string | undefined {
  if (name) {
    return name
  } else if (variant) {
    return variant
  } else if (['sh', 'bash', 'zsh'].includes(language)) {
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
    return undefined
  }
}

type ContentCodeBlockProps = React.HTMLAttributes<HTMLDivElement> & {
  hideHeader?: boolean
  'data-content'?: string
  'data-name'?: string
  'data-language'?: string
  'data-variant'?: string
}

function ContentCodeBlock({ hideHeader, className, children, ...props }: ContentCodeBlockProps) {
  const content = (props['data-content'] || '').trim()
  const name = (props['data-name'] || '').trim()
  const language = (props['data-language'] || '').trim()
  const variant = (props['data-variant'] || '').trim()
  const finalName = !hideHeader ? getCodeBlockName(name, language, variant) : undefined
  const Icon = !hideHeader && finalName ? getCodeBlockFileIcon(language) : undefined

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
    <div className={cn('relative flex flex-col overflow-hidden rounded-md border bg-code-bg', className)} {...props}>
      {!hideHeader && finalName && Icon ? (
        <div className="flex h-9 w-full flex-row items-center justify-between gap-4 border-b px-4 text-sm font-normal text-fg/75">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-fg/60" />
            {finalName}
          </div>
        </div>
      ) : null}
      <div>{children}</div>
      <Button
        aria-label="Copy code"
        variant="ghost"
        shape="square"
        className={cn(
          'absolute right-2.5 h-8 w-8 shrink-0 text-fg/60 hocus-visible:text-fg/100',
          finalName && Icon ? 'top-0.5' : 'top-[0.3rem]',
        )}
        onClick={isCopied ? undefined : onClick}
      >
        {isCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
      </Button>
    </div>
  )
}

type ContentCodeBlockGroupProps = TabsProps

function ContentCodeBlockGroup({ defaultValue, className, children, ...props }: ContentCodeBlockGroupProps) {
  const childrenProps: { Icon: LucideIcon; label: string; content: React.ReactNode }[] = React.useMemo(() => {
    if (!children) {
      return []
    }

    const childrenArray = (Array.isArray(children) ? children : [children]).filter(
      (child) => child && typeof child === 'object',
    ) as React.ReactElement[]
    const propsList = childrenArray.map((child) => child.props as ContentCodeBlockProps)
    return propsList.map(({ className, ...props }) => {
      const name = (props['data-name'] || '').trim()
      const language = (props['data-language'] || '').trim()
      const variant = (props['data-variant'] || '').trim()
      const finalName = getCodeBlockName(name, language, variant)
      const Icon = getCodeBlockFileIcon(language)
      return {
        Icon: Icon || FileCode2Icon,
        label: finalName || `Code${language ? ` (.${language})` : ''}`,
        content: <ContentCodeBlock className={cn('rounded-none border-none', className)} {...props} hideHeader />,
      }
    })
  }, [children])

  const hasCommonIcon = React.useMemo(() => {
    if (childrenProps.length === 0) {
      return false
    }
    const firstIcon = childrenProps[0]!.Icon
    return childrenProps.every(({ Icon }) => Icon === firstIcon)
  }, [childrenProps])

  return childrenProps.length === 0 ? null : (
    <Tabs
      defaultValue={defaultValue || '0'}
      className={cn('relative flex flex-col overflow-hidden rounded-md border bg-code-bg', className)}
      {...props}
    >
      <TabsList className="px-1">
        {childrenProps.map(({ Icon, label }, i) => (
          <TabsTrigger key={i} value={String(i)} className="gap-2 font-normal">
            {!hasCommonIcon && <Icon className="h-4 w-4 text-fg/60" />}
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {childrenProps.map(({ content }, i) => (
        <TabsContent key={i} value={String(i)}>
          {content}
        </TabsContent>
      ))}
    </Tabs>
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
