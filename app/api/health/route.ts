import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reminderQueue } from '@/lib/queue';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status: Record<string, any> = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'ok',
    checks: {
      database: 'down',
      redis: 'down',
    }
  };

  try {
    // Check Database
    await prisma.$queryRaw`SELECT 1`;
    status.checks.database = 'up';
  } catch (error) {
    status.status = 'error';
    logger.error('Health Check: Database failed', { error });
  }

  try {
    // Check Redis
    if (reminderQueue) {
      await (await reminderQueue.client).ping();
      status.checks.redis = 'up';
    } else {
      status.checks.redis = 'not_configured';
    }
  } catch (error) {
    status.status = 'error';
    logger.error('Health Check: Redis failed', { error });
  }

  const statusCode = status.status === 'ok' ? 200 : 503;
  return NextResponse.json(status, { status: statusCode });
}
