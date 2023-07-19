import * as React from 'react'

import { create, insertMultiple, type SearchParams } from '@orama/orama'
import {
  afterInsert as highlightAfterInsert,
  searchWithHighlight,
  type OramaWithHighlight,
  type SearchResultWithHighlight,
} from '@orama/plugin-match-highlight'

export type SearchDocument = {
  id: string
  title: string
  content?: string
}

export type RawSearchHit = Omit<SearchResultWithHighlight['hits'][number], 'document'> & {
  document: SearchDocument
}

export type RawSearchResults = Omit<SearchResultWithHighlight, 'hits'> & {
  hits: RawSearchHit[]
}

export type SearchHit<T> = RawSearchHit & {
  item: T
}

export type SearchResults<T> = Omit<SearchResultWithHighlight, 'hits'> & {
  hits: SearchHit<T>[]
}

export type SearchState<T> = {
  isInitializing: boolean
  search: (params?: SearchParams) => void
  isSearching: boolean
  filteredResults: SearchHit<T>[]
}

export function useSearch<T>(items: T[], getSearchDocument: (item: T) => SearchDocument): SearchState<T> {
  const [searchIndex, setSearchIndex] = React.useState<OramaWithHighlight | undefined>(undefined)
  const [isSearching, setIsSearching] = React.useState(false)
  const [rawResults, setRawResults] = React.useState<RawSearchResults | undefined>(undefined)

  const updateSearchIndex = React.useCallback(async () => {
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
    await insertMultiple(index, items.map(getSearchDocument))
    setSearchIndex(index)
  }, [getSearchDocument, items])

  React.useEffect(() => {
    void updateSearchIndex()
  }, [updateSearchIndex])

  const searchInner = React.useCallback(
    async (params?: SearchParams) => {
      if (!searchIndex) {
        return
      }

      setIsSearching(true)
      try {
        setRawResults((await searchWithHighlight(searchIndex, params || {})) as RawSearchResults)
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

  const filteredResults: SearchHit<T>[] = React.useMemo(() => {
    if (rawResults) {
      const idsMap = new Map(items.map((item) => [getSearchDocument(item).id, item]))
      return rawResults.hits.map((hit) => ({ ...hit, item: idsMap.get(hit.id)! })).filter((hit) => !!hit.item)
    } else {
      return items.map((item) => {
        const document = getSearchDocument(item)
        return {
          id: document.id,
          score: 0,
          document,
          item,
          positions: [],
        }
      })
    }
  }, [getSearchDocument, items, rawResults])

  const state = React.useMemo<SearchState<T>>(
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
