import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect all /admin routes
  if (path.startsWith('/admin')) {
    const adminSecret = process.env.ADMIN_SECRET || 'admin123';
    const cookie = request.cookies.get('admin_session');
    const isAuthorized = cookie && cookie.value === adminSecret;

    // Redirect authorized users away from login page
    if (path === '/admin/login' && isAuthorized) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Allow access to the login page
    if (path === '/admin/login') {
      return NextResponse.next();
    }
    
    if (!isAuthorized) {
      // If we're not authorized, we allow it in development for ease of use
      // but in production we redirect to login
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
