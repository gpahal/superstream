import * as React from 'react'

import { FrontmatterSchema } from '@gpahal/markdoc'
import { create, insertMultiple, SearchParams } from '@orama/orama'
import {
  afterInsert as highlightAfterInsert,
  OramaWithHighlight,
  SearchResultWithHighlight,
  searchWithHighlight,
} from '@orama/plugin-match-highlight'

import { ContentCollectionMetadata, ContentSearchDocument, FlattenedContentCollection } from '@/lib/content'

const cache = new Map<string, Promise<OramaWithHighlight>>()

export type RawContentCollectionSearchHit = Omit<SearchResultWithHighlight['hits'][number], 'document'> & {
  document: ContentSearchDocument
}

export type RawContentCollectionSearchResults = Omit<SearchResultWithHighlight, 'hits'> & {
  hits: RawContentCollectionSearchHit[]
}

export type ContentCollectionSearchHit = RawContentCollectionSearchHit & {
  index: number
  parentIndex?: number
  children?: ContentCollectionSearchHit[]
}

export type ContentCollectionSearchResults = Omit<SearchResultWithHighlight, 'hits'> & {
  hits: ContentCollectionSearchHit[]
}

export type ContentCollectionSearchState = {
  isInitializing: boolean
  search: (params?: SearchParams) => void
  isSearching: boolean
  filteredResults: ContentCollectionSearchHit[]
}

export function useContentCollectionSearch<TFrontmatterSchema extends FrontmatterSchema>(
  contentPath: string,
  contentCollectionMetadata: ContentCollectionMetadata<TFrontmatterSchema>,
  contentCollection: FlattenedContentCollection<TFrontmatterSchema>,
  contentSearchDocuments: ContentSearchDocument[],
): ContentCollectionSearchState {
  const [searchIndex, setSearchIndex] = React.useState<OramaWithHighlight | undefined>(undefined)
  const [isSearching, setIsSearching] = React.useState(false)
  const [rawResults, setRawResults] = React.useState<RawContentCollectionSearchResults | undefined>(undefined)

  const updateSearchIndex = React.useCallback(async () => {
    const cached = cache.get(contentPath)
    if (cached) {
      setSearchIndex(await cached)
    }

    const createHelper = async () => {
      const index = (await create({
        schema: {
          id: 'string',
          title: 'string',
          content: 'string',
        },
        components: {
          afterInsert: [highlightAfterInsert],
          tokenizer: {
            stemming: false,
          },
        },
      })) as OramaWithHighlight
      await insertMultiple(index, contentSearchDocuments)
      return index
    }

    const promise = createHelper()
    cache.set(contentPath, promise)
    setSearchIndex(await promise)
  }, [contentPath, contentSearchDocuments])

  React.useEffect(() => {
    void updateSearchIndex()
  }, [updateSearchIndex])

  const searchInner = React.useCallback(
    async (params?: SearchParams) => {
      if (!params?.term) {
        setRawResults(undefined)
        return
      } else if (!searchIndex) {
        return
      }

      setIsSearching(true)
      try {
        setRawResults((await searchWithHighlight(searchIndex, params || {})) as RawContentCollectionSearchResults)
      } finally {
        setIsSearching(false)
      }
    },
    [searchIndex],
  )

  const search = React.useCallback(
    (params?: SearchParams) => {
      void searchInner(params)
    },
    [searchInner],
  )

  const filteredResults = React.useMemo(() => {
    let flattenedResults = [] as ContentCollectionSearchHit[]
    if (rawResults) {
      const partialFlattenedResults = rawResults.hits.reduce((acc, hit) => {
        const pageItem = contentCollection.find((item) => item.path === hit.document.pagePath)
        if (!pageItem) {
          return acc
        }

        const result = {
          ...hit,
          index: pageItem.index,
          parentIndex: pageItem.parentIndex,
        }

        acc.push(result)
        return acc
      }, [] as ContentCollectionSearchHit[])

      const flattenedResultIdsSet = new Set(partialFlattenedResults.map((result) => result.id))

      for (const result of partialFlattenedResults) {
        if (result.document.type === 'section') {
          if (!flattenedResultIdsSet.has(result.document.pagePath)) {
            const pageItem = contentCollection.find((item) => item.path === result.document.pagePath)
            if (pageItem?.parentIndex == null) {
              continue
            }

            const parentPageItem = contentCollection.find((item) => item.index === pageItem.parentIndex)
            if (!parentPageItem) {
              continue
            }

            if (!flattenedResultIdsSet.has(parentPageItem.path)) {
              flattenedResults.push({
                id: parentPageItem.path,
                score: 0,
                document: {
                  type: 'page',
                  id: parentPageItem.path,
                  path: parentPageItem.path,
                  pagePath: parentPageItem.path,
                  title: contentCollectionMetadata.getTitle(parentPageItem.data.frontmatter),
                  content: '',
                },
                positions: [],
                index: parentPageItem.index,
                parentIndex: parentPageItem.parentIndex,
              })
              flattenedResultIdsSet.add(parentPageItem.path)
            }

            flattenedResults.push({
              id: pageItem.path,
              score: 0,
              document: {
                type: 'page',
                id: pageItem.path,
                path: pageItem.path,
                pagePath: pageItem.path,
                title: contentCollectionMetadata.getTitle(pageItem.data.frontmatter),
                content: '',
              },
              positions: [],
              index: pageItem.index,
              parentIndex: pageItem.parentIndex,
            })
            flattenedResultIdsSet.add(pageItem.path)
          }
        } else if (result.parentIndex != null) {
          const parentPageItem = contentCollection.find((item) => item.index === result.parentIndex)
          if (!parentPageItem) {
            continue
          }

          if (!flattenedResultIdsSet.has(parentPageItem.path)) {
            flattenedResults.push({
              id: parentPageItem.path,
              score: 0,
              document: {
                type: 'page',
                id: parentPageItem.path,
                path: parentPageItem.path,
                pagePath: parentPageItem.path,
                title: contentCollectionMetadata.getTitle(parentPageItem.data.frontmatter),
                content: '',
              },
              positions: [],
              index: parentPageItem.index,
              parentIndex: parentPageItem.parentIndex,
            })
            flattenedResultIdsSet.add(parentPageItem.path)
          }
        }

        flattenedResults.push(result)
      }
    } else {
      flattenedResults = contentCollection.map((item) => ({
        id: item.path,
        score: 0,
        document: {
          type: 'page' as const,
          id: item.path,
          path: item.path,
          pagePath: item.path,
          title: contentCollectionMetadata.getTitle(item.data.frontmatter),
          content: '',
        },
        positions: [],
        index: item.index,
        parentIndex: item.parentIndex,
      }))
    }

    const childrenMap = new Map<number, ContentCollectionSearchHit[]>()
    for (const result of flattenedResults) {
      if (result.document.type === 'section') {
        const children = childrenMap.get(result.index)
        if (children) {
          children.push(result)
        } else {
          childrenMap.set(result.index, [result])
        }
      } else {
        if (result.parentIndex == null) {
          continue
        }

        const children = childrenMap.get(result.parentIndex)
        if (children) {
          children.push(result)
        } else {
          childrenMap.set(result.parentIndex, [result])
        }
      }
    }

    const finalResults = [] as ContentCollectionSearchHit[]
    for (const result of flattenedResults) {
      if (result.document.type !== 'section') {
        const children = childrenMap.get(result.index)
        if (children && children.length > 0) {
          result.children = children
          if (result.parentIndex == null) {
            finalResults.push(result)
          }
        }
      }
    }

    return finalResults
  }, [contentCollectionMetadata, contentCollection, rawResults])

  const state = React.useMemo<ContentCollectionSearchState>(
    () => ({
      isInitializing: !searchIndex,
      search,
      isSearching,
      filteredResults,
    }),
    [searchIndex, search, isSearching, filteredResults],
  )

  return state
}
