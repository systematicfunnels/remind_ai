import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  // Add Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Protect all /admin routes
  if (path.startsWith('/admin')) {
    const adminSecret = process.env.ADMIN_SECRET;
    
    // Fail closed if no secret is configured
    if (!adminSecret) {
      console.error('CRITICAL: ADMIN_SECRET is not configured. Blocking all admin access.');
      return NextResponse.redirect(new URL('/', request.url));
    }

    const cookie = request.cookies.get('admin_session');
    const isAuthorized = cookie && cookie.value === adminSecret;

    // Redirect authorized users away from login page
    if (path === '/admin/login' && isAuthorized) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Allow access to the login page
    if (path === '/admin/login') {
      return response;
    }
    
    if (!isAuthorized) {
      const loginUrl = new URL('/admin/login', request.url);
      // Pass the original URL to redirect back after login (optional future enhancement)
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
