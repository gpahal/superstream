import { NextResponse, type NextRequest } from 'next/server'

import { trim } from '@gpahal/std/string'

export default function middleware(req: NextRequest) {
  const url = req.nextUrl
  const pathname = trim(url.pathname, '/')
  if (pathname === 'docs') {
    url.pathname = '/docs/getting-started/what-is-superstream'
    return NextResponse.rewrite(url)
  }
  return undefined
}
