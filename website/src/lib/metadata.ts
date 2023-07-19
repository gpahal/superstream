import type { Metadata } from 'next'

import { trim } from '@gpahal/std/string'

import { ogSize } from '@/lib/og'

export const WEBSITE_HOSTNAME = 'superstream.finance'
export const WEBSITE_ORGIN = `https://${WEBSITE_HOSTNAME}`
export const WEBSITE_URL = new URL(WEBSITE_ORGIN)

export const AUTHOR_NAME = 'Garvit Pahal'
export const AUTHOR_URL = 'https://garvipahal.com'
export const AUTHOR_TWITTER_USERNAME = '@g10pahal'

export const DEFAULT_IMAGE_PATH = '?v=2'

export function generatePageMetadata({
  pathname,
  title: titleProp,
  browserTitle: browserTitleProp,
  description: descriptionProp,
  imagePath: imagePathProp,
  article,
}: {
  pathname: string
  title?: string
  browserTitle?: string
  description?: string
  imagePath?: string
  article?: {
    publishedTime: number | Date
    tags?: string[]
  }
}): Partial<Metadata> {
  pathname = trim(pathname || '', '/')
  const url = `${WEBSITE_ORGIN}${pathname ? `/${pathname}` : ''}`

  const title = trim(titleProp || 'Superstream')
  const browserTitle = trim(browserTitleProp || title)
  const description = trim(descriptionProp || 'Create and manage real-time payment streams on Solana')

  const imagePath = imagePathProp == null ? DEFAULT_IMAGE_PATH : imagePathProp
  const imageUrl = new URL(imagePath, 'http://test.com/')
  const imagePathname = trim(imageUrl.pathname, '/')
  const image = {
    type: 'image/png',
    url: `/og-images${imagePathname ? `/${imagePathname}` : ''}?${imageUrl.searchParams.toString()}`,
    ...ogSize,
  }
  const images = [image]

  let openGraph: NonNullable<Metadata['openGraph']> = {
    type: article ? 'article' : 'website',
    title,
    description,
    url,
    images,
  }
  const twitter: NonNullable<Metadata['twitter']> = {
    card: 'summary_large_image',
    title,
    description,
    creator: AUTHOR_TWITTER_USERNAME,
    images,
  }

  const metadata: Partial<Metadata> = {
    title: browserTitle,
    description,
    openGraph,
    twitter,
    authors: {
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
    alternates: {
      canonical: url,
    },
  }
  if (title) {
    metadata.title = browserTitle || title
    openGraph.title = title
    twitter.title = title
  }
  if (description) {
    metadata.description = description
    openGraph.description = description
    twitter.description = description
  }
  if (article) {
    openGraph = {
      ...openGraph,
      type: 'article',
      publishedTime: new Date(article.publishedTime).toISOString(),
      tags: article.tags,
    }
    metadata.openGraph = openGraph
  }

  return metadata
}
