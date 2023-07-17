export type TocEntry<T> = {
  item: T
  children: Toc<T>
}

export type Toc<T> = TocEntry<T>[]

export function getFirstLeafTocItem<T>(toc: Toc<T>): T | undefined {
  let current = toc[0]
  while (current && current.children.length > 0) {
    current = current.children[0]
  }
  return current?.item
}
