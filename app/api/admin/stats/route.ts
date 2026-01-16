import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidApiRequest } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isValidApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [userCount, reminderCount, activeReminders, completedReminders] = await Promise.all([
      prisma.user.count(),
      prisma.reminder.count(),
      prisma.reminder.count({ where: { status: 'pending' } }),
      prisma.reminder.count({ where: { status: 'done' } }),
    ]);

    const usersByChannel = await prisma.user.groupBy({
      by: ['channel'],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: userCount,
        totalReminders: reminderCount,
        activeReminders,
        completedReminders,
        usersByChannel,
      }
    });
  } catch (error: unknown) {
    logger.error('Admin Stats Error', { error });
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
