import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ChevronRightIcon, MoveLeftIcon, MoveRightIcon } from 'lucide-react'

import {
  getFlattenedContentCollectionItemByIndex,
  getNextLeafFlattenedContentCollectionItemByIndex,
  getPrevLeafFlattenedContentCollectionItemByIndex,
} from '@/lib/content'
import type { FlattenedDoc } from '@/lib/docs'
import { getFlattenedDocBySlugParts, getFlattenedDocs } from '@/lib/docs.server'
import { generatePageMetadata } from '@/lib/metadata'
import { H1 } from '@/components/lib/heading'
import { Link } from '@/components/lib/link'
import { Content } from '@/components/content'

import { DocOnThisPage } from './doc-on-this-page'

export const runtime = 'edge'

type DocPageProps = { params: { slugParts: string[] } }

export function generateMetadata({ params: { slugParts } }: DocPageProps): Metadata {
  const doc = getFlattenedDocBySlugParts(slugParts)
  if (!doc) {
    return {}
  }

  return generatePageMetadata({
    pathname: `/docs/${doc.path}`,
    title: `${doc.data.frontmatter.title} - Superstream Documentation`,
    description: doc.data.frontmatter.description,
    imagePath: `/docs/${doc.path}?v=5`,
  })
}

export default function DocPage({ params: { slugParts } }: DocPageProps) {
  const doc = getFlattenedDocBySlugParts(slugParts)
  if (!doc) {
    return notFound()
  }

  const docs = getFlattenedDocs()
  const parent = doc.parentIndex != null ? getFlattenedContentCollectionItemByIndex(docs, doc.parentIndex) : undefined
  const children = doc.childrenIndices
    ? (doc.childrenIndices
        .map((index) => getFlattenedContentCollectionItemByIndex(docs, index))
        .filter(Boolean) as FlattenedDoc[])
    : undefined
  const prev = getPrevLeafFlattenedContentCollectionItemByIndex(docs, doc.index)
  const next = getNextLeafFlattenedContentCollectionItemByIndex(docs, doc.index)

  return (
    <>
      <div className="flex min-w-0 flex-1 pt-6 lg:pt-8">
        <article className="mx-auto w-full px-6 pb-4 md:pl-10 lg:max-w-4xl lg:pl-12 xl:px-[3.25rem]">
          <div className="mb-6 flex flex-col gap-2">
            {parent ? (
              <div className="flex flex-row items-center gap-1 text-sm text-fg-subtle md:hidden">
                <Link variant="hover-highlighted" href={`/docs/${parent.path}`} className="hover:text-fg">
                  {parent.data.frontmatter.label}
                </Link>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-fg">{doc.data.frontmatter.label}</span>
              </div>
            ) : null}
            <header className="flex flex-col gap-[0.2rem]">
              <H1>{doc.data.frontmatter.title}</H1>
              {children && children.length > 0 ? (
                <div className="text-lg leading-[1.6rem] text-fg-subtle">{doc.data.frontmatter.description}</div>
              ) : null}
            </header>
          </div>
          <div className="mx-auto max-w-4xl pb-4 lg:pb-8">
            <div className="prose relative max-w-4xl">
              {!children || children.length === 0 ? (
                <Content content={doc.data.content} />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {children.map((childDoc) => (
                    <Link
                      key={childDoc.path}
                      href={`/docs/${childDoc.path}`}
                      className="flex flex-col rounded-md p-4 shadow-sm ring-1 ring-inset ring-neutral-6 hover:bg-bg-emphasis"
                    >
                      <span className="-mt-1 text-lg font-semibold">{childDoc.data.frontmatter.label}</span>
                      <span className="text-base text-fg-subtle">{childDoc.data.frontmatter.description}</span>
                    </Link>
                  ))}
                </div>
              )}
              {(prev || next) && <hr />}
            </div>
            {(prev || next) && (
              <div className="mt-6 flex flex-row items-center justify-between">
                <div className="flex flex-col items-start space-y-1">
                  {prev && (
                    <>
                      <div className="text-base font-medium">
                        <Link
                          variant="hover-highlighted"
                          href={`/docs/${prev.path}`}
                          className="flex items-center gap-1.5 text-base font-medium text-fg-subtle hover:text-fg"
                        >
                          <MoveLeftIcon className="h-4 w-4" />
                          {prev.data.frontmatter.label}
                        </Link>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {next && (
                    <>
                      <div className="text-base font-medium">
                        <Link
                          variant="hover-highlighted"
                          href={`/docs/${next.path}`}
                          className="flex items-center gap-1.5 text-base font-medium text-fg-subtle hover:text-fg"
                        >
                          {next.data.frontmatter.label}
                          <MoveRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
      <DocOnThisPage doc={doc} />
    </>
  )
}
