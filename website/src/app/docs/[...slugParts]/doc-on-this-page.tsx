'use client'

import * as React from 'react'

import { FlattenedDoc } from '@/lib/docs'
import { cn } from '@/lib/styles'
import { Link } from '@/components/lib/link'

export type DocOnThisPageProps = {
  doc: FlattenedDoc
}

export function DocOnThisPage({ doc }: DocOnThisPageProps) {
  const headingNodes = doc.data.headingNodes
  const [currentHeadingNodeId, setCurrentHeadingNodeId] = React.useState(headingNodes[0]?.id)

  React.useEffect(() => {
    if (headingNodes.length === 0) {
      return
    }

    const flattenedNodes = headingNodes
      .flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter(({ id, el }) => id && !!el)
      .map(({ id, el }) => {
        const style = window.getComputedStyle(el!)
        const scrollMt = parseFloat(style.scrollMarginTop)
        const top = window.scrollY + el!.getBoundingClientRect().top - scrollMt
        return { id, top }
      })
      .filter((item) => item != null)
    if (flattenedNodes.length === 0) {
      return
    }

    const onScroll = () => {
      const top = window.scrollY
      let currentId = flattenedNodes[0]?.id
      for (const node of flattenedNodes) {
        if (top >= node.top - 100) {
          currentId = node.id
        } else {
          break
        }
      }
      setCurrentHeadingNodeId(currentId)
    }

    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [headingNodes])

  return (
    <div className="hidden xl:sticky xl:right-0 xl:top-[3.5rem] xl:block xl:h-[calc(100vh-3.5rem)] xl:flex-none xl:overflow-y-auto xl:pb-4 xl:pl-8 xl:pr-6 2xl:pl-0">
      <nav className="xl:w-56 2xl:w-72">
        {headingNodes.length > 0 && (
          <div className="mb-2 space-y-4 px-2 pb-2 pt-6 text-sm/[1.125rem] font-subtlelight lg:pt-8">
            <p className="font-medium">On this page</p>
            <ol className="space-y-2">
              {headingNodes.map((node) => (
                <li key={node.id}>
                  <Link
                    href={`#${node.id}`}
                    className={cn(
                      node.id === currentHeadingNodeId ? 'font-normal text-link-11' : 'text-fg/60 hover:text-link-11',
                    )}
                  >
                    {node.text}
                  </Link>
                  {node.children.length > 0 && (
                    <ol className="mb-3 mt-1 space-y-2 pl-5">
                      {node.children.map((childNode) => (
                        <li key={childNode.id}>
                          <Link
                            href={`#${childNode.id}`}
                            className={cn(
                              childNode.id === currentHeadingNodeId
                                ? 'font-normal text-link-11'
                                : 'text-fg/60 hover:text-link-11',
                            )}
                          >
                            {childNode.text}
                          </Link>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </nav>
    </div>
  )
}
