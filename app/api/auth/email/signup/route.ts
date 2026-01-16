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

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      email,
      password: hashedPassword,
      channel: 'email'
    });

    if (!user) {
      throw new Error('Failed to create user');
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

    logger.info(`User signed up via email: ${email}`);
    return response;
  } catch (error) {
    logger.error('Email Signup Error', { error });
    return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 });
  }
}
