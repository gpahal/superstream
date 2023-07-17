import { z } from 'zod'

import {
  ContentCollection,
  ContentCollectionItem,
  ContentCollectionMap,
  ContentData,
  FlattenedContentCollection,
  FlattenedContentCollectionItem,
} from '@/lib/content'

export const DOCS_FRONTMATTER_SCHEMA = z.object({
  position: z.number().int().positive(),
  slug: z.string().trim().min(1),
  label: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
})

export type DocsFrontmatterSchema = typeof DOCS_FRONTMATTER_SCHEMA

export type DocData = ContentData<DocsFrontmatterSchema>

export type Doc = ContentCollectionItem<DocsFrontmatterSchema>

export type Docs = ContentCollection<DocsFrontmatterSchema>

export type DocsMap = ContentCollectionMap<DocsFrontmatterSchema>

export type FlattenedDoc = FlattenedContentCollectionItem<DocsFrontmatterSchema>

export type FlattenedDocs = FlattenedContentCollection<DocsFrontmatterSchema>
