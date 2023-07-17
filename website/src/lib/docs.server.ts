import { createFileMapIndex } from '@gpahal/std/fs'

import { ContentSearchDocument, createContentCollectionMap } from '@/lib/content'
import {
  getFlattenedContentCollectionItemBySlug,
  getFlattenedContentCollectionItemBySlugParts,
} from '@/lib/content.server'
import { FlattenedDoc, FlattenedDocs } from '@/lib/docs'
import docsDbJson from '@/gen/content/docs/db.json'
import docsSearchDocumentsJson from '@/gen/content/docs/search-documents.json'

const flattenedDocs = docsDbJson as FlattenedDocs
const docs = createFileMapIndex(flattenedDocs)
const docsMap = createContentCollectionMap(docs)

export function getDocsSearchDocuments(): ContentSearchDocument[] {
  return docsSearchDocumentsJson as ContentSearchDocument[]
}

export function getFlattenedDocs(): FlattenedDocs {
  return flattenedDocs
}

export function getFlattenedDocBySlug(slug: string): FlattenedDoc | undefined {
  return getFlattenedContentCollectionItemBySlug(flattenedDocs, docsMap, slug)
}

export function getFlattenedDocBySlugParts(slugParts: string[]): FlattenedDoc | undefined {
  return getFlattenedContentCollectionItemBySlugParts(flattenedDocs, docsMap, slugParts)
}
