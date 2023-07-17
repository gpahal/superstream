import { linkSchema } from '@gpahal/markdoc'
import { z } from 'zod'

import {
  ContentCollection,
  ContentCollectionItem,
  ContentCollectionMap,
  ContentCollectionMetadata,
  ContentData,
  FlattenedContentCollection,
  FlattenedContentCollectionItem,
} from '@/lib/content'

const DOCS_FRONTMATTER_SCHEMA = z.object({
  position: z.number().int().positive(),
  slug: z.string().trim().min(1),
  label: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
})

export type DocsFrontmatterSchema = typeof DOCS_FRONTMATTER_SCHEMA

export const DOCS_CONTENT_COLLECTION_METADATA: ContentCollectionMetadata<DocsFrontmatterSchema> = {
  path: 'docs',
  frontmatterSchema: DOCS_FRONTMATTER_SCHEMA,
  getTitle: (frontmatter) => frontmatter.title,
  getDescription: (frontmatter) => frontmatter.description,
  compareFileMapItems: (a, b) => a.data.frontmatter.position - b.data.frontmatter.position,
  transformFileName: (_, frontmatter) => frontmatter.slug,
  transformConfig: {
    tags: {
      link: {
        ...linkSchema,
        attributes: {
          ...(linkSchema.attributes || {}),
          variant: {
            type: String,
            default: 'highlighted',
            matches: ['unstyled', 'highlighted', 'hover-highlighted', 'link'],
          },
        },
      },
      alert: {
        render: 'Alert',
        attributes: {
          variant: {
            type: String,
            default: 'default',
            matches: ['default', 'info', 'warn', 'error'],
          },
        },
      },
      badges: {
        render: 'Badges',
      },
      badge: {
        render: 'Badge',
      },
    },
  },
}

export type DocData = ContentData<DocsFrontmatterSchema>

export type Doc = ContentCollectionItem<DocsFrontmatterSchema>

export type Docs = ContentCollection<DocsFrontmatterSchema>

export type DocsMap = ContentCollectionMap<DocsFrontmatterSchema>

export type FlattenedDoc = FlattenedContentCollectionItem<DocsFrontmatterSchema>

export type FlattenedDocs = FlattenedContentCollection<DocsFrontmatterSchema>
