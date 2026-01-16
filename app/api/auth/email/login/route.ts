import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.getUserByEmail(email);

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    
    // Set session cookie
    const userSecret = process.env.USER_SESSION_SECRET || 'remindai-user-secret';
    const sessionValue = Buffer.from(`${user.id}-${userSecret}`).toString('base64');
    
    response.cookies.set('user_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    logger.info(`User logged in via email: ${email}`);
    return response;
  } catch (error) {
    logger.error('Email Login Error', { error });
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
