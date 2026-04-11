import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware adds an extra layer of protection to admin routes
export function middleware(request: NextRequest) {
  // Check if trying to access admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // You can add additional checks here like IP whitelisting
    // or checking for specific headers
    
    // For now, we rely on the client-side auth in the admin page
    // This middleware can be extended for server-side protection
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}