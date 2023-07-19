/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import { notFound } from 'next/navigation'
import { ImageResponse, type NextRequest } from 'next/server'

import { getFlattenedContentCollectionItemByIndex } from '@/lib/content'
import { getFlattenedDocBySlugParts, getFlattenedDocs } from '@/lib/docs.server'
import { ogSize } from '@/lib/og'
import { loadOgFonts, logoSvgPrimaryDataUrl } from '@/lib/og.server'

export const runtime = 'edge'

type DocPageProps = { params: { slugParts: string[] } }

export async function GET(_: NextRequest, { params: { slugParts } }: DocPageProps) {
  const doc = getFlattenedDocBySlugParts(slugParts)
  if (!doc) {
    return notFound()
  }

  const docs = getFlattenedDocs()
  const parent = doc.parentIndex != null ? getFlattenedContentCollectionItemByIndex(docs, doc.parentIndex) : undefined

  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: 'Figtree',
          fontWeight: 400,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          backgroundColor: '#f8faf9',
          color: '#222222',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '10px',
            paddingTop: '19px',
            paddingBottom: '21px',
            paddingLeft: '76px',
            paddingRight: '80px',
            borderBottomWidth: '1px',
            borderBottomColor: '#d7dcda',
            fontSize: '32px',
            fontWeight: 500,
          }}
        >
          <img
            src={logoSvgPrimaryDataUrl}
            alt="Superstream logo"
            style={{
              width: '48px',
              height: '48px',
              marginBottom: '-2px',
            }}
          />
          <div
            style={{
              display: 'flex',
            }}
          >
            Superstream
          </div>
          <div
            style={{
              display: 'flex',
              color: '#c0c0c0',
            }}
          >
            /
          </div>
          <div
            style={{
              display: 'flex',
            }}
          >
            Docs
          </div>
          {!!parent && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  color: '#c0c0c0',
                }}
              >
                /
              </div>
              <div
                style={{
                  display: 'flex',
                }}
              >
                {parent.data.frontmatter.label}
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '64px 80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '56px',
              fontWeight: 700,
            }}
          >
            {doc.data.frontmatter.title}
          </div>
          <div
            style={{
              width: '960px',
              display: 'flex',
              fontSize: '36px',
              lineHeight: '48px',
              fontWeight: 500,
              color: '#808080',
            }}
          >
            {doc.data.frontmatter.description}
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: await loadOgFonts(),
    },
  )
}
