import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect all /admin routes
  if (path.startsWith('/admin')) {
    const adminSecret = process.env.ADMIN_SECRET || 'admin123';
    
    // For MVP, we check for an 'admin_session' cookie
    const cookie = request.cookies.get('admin_session');
    
    if (!cookie || cookie.value !== adminSecret) {
      // If we're not authorized, we allow it in development for ease of use
      // but in production we'd redirect or block.
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
