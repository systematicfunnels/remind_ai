import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleReminder } from '@/lib/queue';

export const dynamic = 'force-dynamic';

/**
 * Atomic Reminder Creation Endpoint for n8n/External Orchestration
 * Input: { userId: string, task: string, time: string, recurrence: string }
 * Output: { success: true, reminder: object }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, task, time, recurrence } = await req.json();

    if (!userId || !task || !time) {
      return NextResponse.json({ error: 'userId, task, and time are required' }, { status: 400 });
    }

    // 1. Save to DB
    const reminder = await db.createReminder(userId, task, time, recurrence || 'none');
    
    if (!reminder) {
      return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
    }

    // 2. Schedule in BullMQ
    await scheduleReminder(reminder.id, userId, task, time);
    
    // 3. Increment user count
    await db.incrementReminderCount(userId);

    return NextResponse.json({ success: true, reminder });
  } catch (error) {
    console.error('API Create Reminder Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
