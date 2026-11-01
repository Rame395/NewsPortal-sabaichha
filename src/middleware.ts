import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for admin routes
  if (pathname.startsWith('/admin')) {
    // Exclude public admin routes (login)
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const sessionCookie = request.cookies.get('sabaichha_session')?.value

    if (!sessionCookie) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
