/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import { ImageResponse, NextRequest } from 'next/server'

import { ogSize } from '@/lib/og'
import { loadOgFonts, logoSvgPrimaryDataUrl } from '@/lib/og.server'

export const runtime = 'edge'

export async function GET(_: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: 'Lexend',
          fontWeight: 400,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          backgroundColor: '#f8faf9',
          color: '#000000',
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
            gap: '8px',
            paddingTop: '26px',
            paddingBottom: '22px',
            paddingLeft: '76px',
            paddingRight: '80px',
            borderBottomWidth: '1px',
            borderBottomColor: '#d7dcda',
            fontSize: '36px',
            fontWeight: 400,
          }}
        >
          <img
            src={logoSvgPrimaryDataUrl}
            alt="Superstream logo"
            style={{
              width: '52px',
              height: '52px',
              marginTop: '-4px',
              marginRight: '8px',
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
              color: '#aaaaaa',
            }}
          >
            /
          </div>
          <div
            style={{
              display: 'flex',
            }}
          >
            Dashboard
          </div>
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
              fontSize: '52px',
              fontWeight: 600,
            }}
          >
            Superstream Dashboard
          </div>
          <div
            style={{
              width: '960px',
              display: 'flex',
              fontSize: '40px',
              fontWeight: 400,
              color: '#888888',
            }}
          >
            Manage all your real-time payment streams in one place and create new ones in less than 2 mins
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
