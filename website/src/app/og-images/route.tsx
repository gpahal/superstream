/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import { ImageResponse } from 'next/server'

import { ogSize } from '@/lib/og'
import { loadOgFonts, logoSvgPrimaryDataUrl } from '@/lib/og.server'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: 'Figtree',
          fontWeight: 400,
          width: '100%',
          height: '100%',
          padding: '80px',
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
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            marginLeft: '-12px',
          }}
        >
          <img
            src={logoSvgPrimaryDataUrl}
            alt="Superstream logo"
            style={{
              width: '108px',
              height: '108px',
            }}
          />
          <div
            style={{
              display: 'flex',
              fontSize: '60px',
              fontWeight: 700,
            }}
          >
            Superstream
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '8px',
            marginTop: '128px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '56px',
              fontWeight: 600,
            }}
          >
            Real-time payment streams on Solana
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
            Manage payroll, token distributions, vesting, subscriptions, rewards and any composable stream -
            transparently and efficiently
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
