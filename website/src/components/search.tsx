import { Position } from '@orama/plugin-match-highlight'

import { RawSearchHit } from '@/hooks/use-search'

export type SearchHitProps = {
  hit: RawSearchHit
  trim?: number
}

export function SearchHit({ hit }: SearchHitProps) {
  const getHighlightedText = (text: string, positions: Position[]) => {
    let highlightedText = ''
    let currentIndex = 0

    positions.forEach((position) => {
      const start = position.start
      if (start < 0 || position.length <= 0) {
        return
      }

      const end = start + position.length
      highlightedText +=
        text.slice(currentIndex, start) + '<span class="text-info-9">' + text.slice(start, end) + '</span>'
      currentIndex = end
    })

    highlightedText += text.slice(currentIndex)
    return highlightedText
  }

  const trimContent = (content: string, positions: Position[]): { content: string; positions: Position[] } => {
    if (content.length > 60) {
      let minPosition = Math.max((positions[0]?.start || 0) - 4, 0)
      const showStartingEllipsis = minPosition > 0
      const lastPosition = positions[positions.length - 1]
      const maxPosition = Math.max((lastPosition ? lastPosition.start + lastPosition.length : 0) + 4, 0)
      let endPosition = Math.min(minPosition + 100, Math.max(maxPosition, minPosition + 60), content.length)

      let newContent = content.slice(minPosition, endPosition)
      const startIndex = newContent.search(/\S/)
      if (startIndex > 0) {
        minPosition += startIndex
        newContent = newContent.slice(startIndex)
      }
      const endIndex = newContent.search(/\s+$/)
      if (endIndex > 0) {
        endPosition = endIndex
        newContent = newContent.slice(0, endIndex)
      }

      const newPositions = []
      for (const position of positions) {
        const newPosition = { ...position }
        newPosition.start -= minPosition
        if (newPosition.start >= 0) {
          if (showStartingEllipsis) {
            newPosition.start += 3
          }
          if (newPosition.start + newPosition.length > endPosition) {
            newPosition.length = endPosition - newPosition.start
          }
        }
        newPositions.push(newPosition)
      }

      return {
        content: (showStartingEllipsis ? '...' : '') + newContent + '...',
        positions: newPositions,
      }
    }
    return { content, positions }
  }

  const highlightDocument = () => {
    const highlightedDocument = { ...hit.document }

    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const property in hit.positions) {
      if (hit.positions[property]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        let positionsArray = Object.values(hit.positions[property]).flat() as Position[]

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        let content = highlightedDocument[property] as string
        const trimResult = trimContent(content, positionsArray)
        content = trimResult.content
        positionsArray = trimResult.positions
        content = getHighlightedText(content, positionsArray)

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        highlightedDocument[property] = content
      }
    }

    return highlightedDocument
  }

  const highlightedDocument = highlightDocument()
  const title = highlightedDocument.title
  const content = highlightedDocument.content!

  return (
    <div className={content ? 'min-h-[1.625rem]' : ''}>
      <div className="leading-5" dangerouslySetInnerHTML={{ __html: title }} />
      <div className="opacity-60" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
