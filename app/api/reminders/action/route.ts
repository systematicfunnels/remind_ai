import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleReminder } from '@/lib/queue';
import { Intent, RecurrenceRule } from '@/services/aiService';
import { isValidApiRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Unified Action Endpoint for n8n/External Orchestration
 * Input: { 
 *   userId: string, 
 *   intent: Intent, 
 *   task?: string, 
 *   time?: string, 
 *   recurrence?: RecurrenceRule, 
 *   query?: string, 
 *   timezone?: string 
 * }
 * Output: { success: true, message: string, data?: any }
 */
export async function POST(req: NextRequest) {
  try {
    if (!isValidApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, intent, task, time, recurrence, query, timezone } = await req.json();

    if (!userId || !intent) {
      return NextResponse.json({ error: 'userId and intent are required' }, { status: 400 });
    }

    const user = await db.getUserByPhone(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (intent as Intent) {
      case 'CREATE':
        if (!task || !time) {
          return NextResponse.json({ error: 'task and time are required for CREATE' }, { status: 400 });
        }
        const reminder = await db.createReminder(user.id, task, time, recurrence || 'none');
        if (!reminder) throw new Error('Failed to save reminder');
        
        await scheduleReminder(reminder.id, user.id, task, time);
        await db.incrementReminderCount(user.id);

        const localTime = new Date(time).toLocaleString('en-US', { 
          timeZone: user.timezone || 'UTC',
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        
        return NextResponse.json({ 
          success: true, 
          message: `✅ Set: ${task} on ${localTime}${recurrence && recurrence !== 'none' ? ` (Repeat: ${recurrence})` : ''}`,
          data: reminder 
        });

      case 'LIST':
        const reminders = await db.getPendingReminders(user.id);
        if (reminders.length === 0) {
          return NextResponse.json({ success: true, message: "You have no pending reminders." });
        }
        const list = reminders
          .map(r => `• ${r.task} (${new Date(r.scheduled_at).toLocaleString('en-US', { timeZone: user.timezone || 'UTC' })})`)
          .join('\n');
        return NextResponse.json({ success: true, message: `Your pending reminders:\n${list}`, data: reminders });

      case 'DONE':
        let doneSuccess = false;
        if (query) {
          doneSuccess = await db.markReminderDoneByQuery(user.id, query);
        } else {
          doneSuccess = await db.markLastReminderDone(user.id);
        }
        return NextResponse.json({ 
          success: true, 
          message: doneSuccess 
            ? (query ? `✅ Marked "${query}" as done!` : "✅ Marked your most recent reminder as done!")
            : "I couldn't find any pending reminders matching that."
        });

      case 'TIMEZONE':
        if (timezone) {
          await db.updateUserTimezone(user.id, timezone);
          return NextResponse.json({ success: true, message: `✅ Timezone updated to ${timezone}` });
        }
        return NextResponse.json({ error: 'timezone is required for TIMEZONE intent' }, { status: 400 });

      case 'BILLING':
        const status = user.sub_status === 'trial' ? 'Free Trial' : 'Premium Subscription';
        const limitMsg = user.sub_status === 'trial' ? `(${user.reminder_count}/5 reminders used)` : '';
        return NextResponse.json({ 
          success: true, 
          message: `💳 Status: ${status} ${limitMsg}\n\nManage subscription: ${process.env.RAZORPAY_CHECKOUT_LINK || '#'}` 
        });

      case 'HELP':
        return NextResponse.json({ success: true, message: db.getHelpMessage() });

      case 'ERASE':
        await db.eraseUserData(user.id);
        return NextResponse.json({ success: true, message: "🗑️ Your account and data have been permanently erased. Goodbye!" });

      default:
        return NextResponse.json({ success: true, message: "I couldn't understand that. Try: 'remind me to call mom tomorrow at 7pm'" });
    }
  } catch (error: any) {
    console.error('API Action Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
