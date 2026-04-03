import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host')

  
  if (hostname && hostname !== 'assistlink-bit.vercel.app' && hostname !== 'localhost:3000') {
    
    return NextResponse.rewrite(new URL(`/custom-domain/${hostname}${url.pathname}`, request.url))
  }
}