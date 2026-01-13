import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminSecret = process.env.ADMIN_SECRET || 'admin123';

    if (password === adminSecret) {
      const response = NextResponse.json({ success: true });
      
      // Set the admin_session cookie
      response.cookies.set('admin_session', adminSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid security key' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
