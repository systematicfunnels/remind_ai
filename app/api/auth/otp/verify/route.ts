import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { phoneId, code } = await req.json();

    if (!phoneId || !code) {
      return NextResponse.json({ error: 'Phone ID and code are required' }, { status: 400 });
    }

    const isValid = await db.verifyCode(phoneId, code);

    if (isValid) {
      // Get or create user
      let user = await db.getUserByPhone(phoneId);
      if (!user) {
        const channel = phoneId.startsWith('+') ? 'whatsapp' : 'telegram';
        user = await db.createUser({ phoneId, channel });
      }

      if (!user) {
        throw new Error('Failed to get or create user');
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

      logger.info(`User logged in: ${phoneId}`);
      return response;
    } else {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }
  } catch (error) {
    logger.error('OTP Verify Error', { error });
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
