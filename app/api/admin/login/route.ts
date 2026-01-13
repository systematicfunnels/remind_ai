import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const { password } = await request.json();
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      console.error('CRITICAL: ADMIN_SECRET is not configured in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Check for existing lockout (rate limiting)
    const attempt = await (prisma as any).loginAttempt.findFirst({
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
        await (prisma as any).loginAttempt.delete({ where: { id: attempt.id } });
      }
    }

    if (password === adminSecret) {
      // Clear attempts on success
      if (attempt) {
        await (prisma as any).loginAttempt.delete({ where: { id: attempt.id } });
      }

      const response = NextResponse.json({ success: true });
      
      // Set the admin_session cookie with enhanced security
      response.cookies.set('admin_session', adminSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // More secure than 'lax'
        path: '/',
        maxAge: 60 * 60 * 24, // Reduced to 1 day for security
      });

      return response;
    }

    // Record failed attempt
    if (attempt) {
      await (prisma as any).loginAttempt.update({
        where: { id: attempt.id },
        data: { 
          attempts: { increment: 1 },
          last_tried: new Date()
        }
      });
    } else {
      await (prisma as any).loginAttempt.create({
        data: { ip_address: ip }
      });
    }

    return NextResponse.json({ error: 'Invalid security key' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
