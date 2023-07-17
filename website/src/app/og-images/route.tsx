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
          fontFamily: 'Lexend',
          fontWeight: 400,
          width: '100%',
          height: '100%',
          padding: '80px',
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
              fontWeight: 600,
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
            marginTop: '104px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '50px',
              fontWeight: 500,
            }}
          >
            Real-time payment streams on Solana
          </div>
          <div
            style={{
              width: '960px',
              display: 'flex',
              fontSize: '38px',
              fontWeight: 400,
              color: '#888888',
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
