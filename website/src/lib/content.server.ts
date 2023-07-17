import { FrontmatterSchema } from '@gpahal/markdoc'
import { pathPartsToPath } from '@gpahal/std/fs'

import { ContentCollectionMap, FlattenedContentCollection, FlattenedContentCollectionItem } from '@/lib/content'

export function getFlattenedContentCollectionItemBySlug<TFrontmatterSchema extends FrontmatterSchema>(
  collection: FlattenedContentCollection<TFrontmatterSchema>,
  collectionMap: ContentCollectionMap<TFrontmatterSchema>,
  slug: string,
): FlattenedContentCollectionItem<TFrontmatterSchema> | undefined {
  const doc = collectionMap.get(slug)
  return doc ? collection[doc.index] : undefined
}

export function getFlattenedContentCollectionItemBySlugParts<TFrontmatterSchema extends FrontmatterSchema>(
  collection: FlattenedContentCollection<TFrontmatterSchema>,
  collectionMap: ContentCollectionMap<TFrontmatterSchema>,
  slugParts: string[],
): FlattenedContentCollectionItem<TFrontmatterSchema> | undefined {
  return getFlattenedContentCollectionItemBySlug(collection, collectionMap, pathPartsToPath(slugParts))
}
