import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isValidApiRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * User Ensure Endpoint for n8n/External Orchestration
 * Input: { phoneId: string, channel: 'whatsapp' | 'telegram', role?: 'user' | 'admin' }
 * Output: { user: User, isNew: boolean, welcomeMessage?: string }
 */
export async function POST(req: NextRequest) {
  try {
    if (!isValidApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneId, channel, role } = await req.json();

    if (!phoneId || !channel) {
      return NextResponse.json({ error: 'phoneId and channel are required' }, { status: 400 });
    }

    let user = await db.getUserByPhone(phoneId);
    let isNew = false;

    if (!user) {
      user = await db.createUser(phoneId, channel, role || 'user');
      isNew = true;
    }

    if (!user) {
      throw new Error('Failed to get or create user');
    }

    return NextResponse.json({ 
      success: true, 
      user, 
      isNew,
      welcomeMessage: isNew ? db.getWelcomeMessage() : null
    });
  } catch (error: any) {
    console.error('API User Ensure Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
