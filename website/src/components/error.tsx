import * as React from 'react'

import { getReasonPhrase } from 'http-status-codes'

import { H1 } from '@/components/lib/heading'
import { Link, LinkProps } from '@/components/lib/link'

export type ErrorComponentProps = {
  statusCode: number
  statusText?: string
  homeHref: LinkProps['href']
  homeLabel: string
  title?: string
  description?: string
}

export function ErrorComponent({
  statusCode,
  statusText,
  homeHref,
  homeLabel,
  title,
  description,
}: ErrorComponentProps) {
  return (
    <div className="flex min-h-full w-full flex-col items-center px-4 pb-16 pt-36 md:px-6 lg:px-8">
      <div className="flex flex-col items-center md:flex-row md:items-start">
        <H1 className="inline-block text-center md:text-left">{statusCode}</H1>
        <div className="flex flex-col items-center md:ml-6 md:items-start">
          <div className="flex flex-col items-center md:items-start md:border-l md:pl-6">
            <H1 className="text-center font-medium md:text-left">{title || getDefaultTitle(statusCode, statusText)}</H1>
            <p className="mt-1.5 text-center text-fg-subtle md:text-left">
              {description || getDefaultDescription(statusCode)}
            </p>
          </div>
          <div className="mt-8 md:border-l md:border-transparent md:pl-6">
            <Link variant="link" href={homeHref} className="font-medium no-underline">
              {`Go back to ${homeLabel}`}
              <span aria-hidden> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function getDefaultTitle(statusCode: number, statusText?: string): string {
  if (statusCode === 404) {
    return 'Page not found'
  } else {
    return statusText || getReasonPhrase(statusCode) || "Sorry, it's not you, it's us"
  }
}

function getDefaultDescription(statusCode: number): React.ReactNode {
  if (statusCode === 404) {
    return "Sorry, we couldn't find the page you're looking for"
  } else if (statusCode >= 500) {
    return "Sorry, it's not you, it's us"
  } else {
    return (
      <span>
        Get more information <a href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${statusCode}`}>here</a>
      </span>
    )
  }
}
