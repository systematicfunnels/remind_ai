import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendDirectMessage } from '@/lib/queue';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { phoneId, channel } = await req.json();

    if (!phoneId || !channel) {
      return NextResponse.json({ error: 'Phone ID and channel are required' }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB
    await db.createVerificationCode(phoneId, code);

    // Send via Bot
    const message = `🔐 *Your RemindAI Login Code*: ${code}\n\nThis code will expire in 10 minutes. Do not share it with anyone.`;
    await sendDirectMessage(phoneId, channel, message);

    logger.info(`OTP sent to ${phoneId} via ${channel}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('OTP Send Error', { error });
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
