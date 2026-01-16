import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botName } = await req.json();
    if (!botName || typeof botName !== 'string') {
      return NextResponse.json({ error: 'Invalid bot name' }, { status: 400 });
    }

    // @ts-ignore - Prisma client type sync issue
    await (prisma.user as any).update({
      where: { id: user.id },
      data: { bot_name: botName },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update bot name error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
