import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

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
      logger.error('CRITICAL: ADMIN_SECRET is not configured. Blocking all admin access.');
      return NextResponse.redirect(new URL('/', request.url));
    }

    const cookie = request.cookies.get('admin_session');
    
    // In production, we should use a proper session store, 
    // but for now we'll use a hashed version of the secret
    const expectedValue = Buffer.from(`${adminSecret}-session`).toString('base64');
    const isAuthorized = cookie && cookie.value === expectedValue;

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

  // Protect /dashboard and /login routes
  if (path.startsWith('/dashboard') || path === '/login') {
    const cookie = request.cookies.get('user_session');
    let isValid = false;
    
    if (cookie) {
      try {
        const decoded = Buffer.from(cookie.value, 'base64').toString('ascii');
        const { userId, secret } = JSON.parse(decoded);
        const expectedSecret = process.env.USER_SESSION_SECRET || 'remindai-user-secret';
        isValid = secret === expectedSecret && !!userId;
      } catch {
        isValid = false;
      }
    }

    // Redirect authorized users away from login page
    if (path === '/login' && isValid) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect unauthorized users to login page
    if (path.startsWith('/dashboard') && !isValid) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/dashboard', '/dashboard/:path*', '/login'],
};
