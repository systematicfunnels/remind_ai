import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const { password } = await request.json();
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      logger.error('CRITICAL: ADMIN_SECRET is not configured in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Check for existing lockout (rate limiting)
    const attempt = await prisma.loginAttempt.findFirst({
      where: { ip_address: ip }
    });

    if (attempt && attempt.attempts >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - new Date(attempt.last_tried).getTime();
      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        const remainingMinutes = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000);
        return NextResponse.json({ 
          error: `Too many attempts. Locked for ${remainingMinutes} more minutes.` 
        }, { status: 429 });
      } else {
        // Reset after lockout duration
        await prisma.loginAttempt.delete({ where: { id: attempt.id } });
      }
    }

    if (password === adminSecret) {
      // Clear attempts on success
      if (attempt) {
        await prisma.loginAttempt.delete({ where: { id: attempt.id } });
      }

      const response = NextResponse.json({ success: true });
      
      // Set authorized session cookie
      const sessionValue = Buffer.from(`${adminSecret}-session`).toString('base64');
      response.cookies.set('admin_session', sessionValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    // Record failed attempt
    if (attempt) {
      await prisma.loginAttempt.update({
        where: { id: attempt.id },
        data: { 
          attempts: { increment: 1 },
          last_tried: new Date()
        }
      });
    } else {
      await prisma.loginAttempt.create({
        data: { ip_address: ip }
      });
    }

    return NextResponse.json({ error: 'Invalid security key' }, { status: 401 });
  } catch (error) {
    logger.error('Login error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
