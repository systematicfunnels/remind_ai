import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleReminder } from '@/lib/queue';
import { unifiedParseIntent } from '@/services/aiService';

export const dynamic = 'force-dynamic';

// GET: Webhook verification for Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
      console.log('INSTAGRAM_WEBHOOK_VERIFIED');
      return new Response(challenge, { status: 200 });
    }
  }

  return new Response('Forbidden', { status: 403 });
}

// POST: Handle incoming Instagram messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Instagram/Messenger webhooks have a nested structure: entry -> messaging
    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        for (const messagingEvent of entry.messaging) {
          if (messagingEvent.message && !messagingEvent.message.is_echo) {
            const senderId = messagingEvent.sender.id;
            const text = messagingEvent.message.text?.trim();

            if (!text) continue;

            // 1. Get or Create User
            let user = await db.getUserByPhone(senderId);
            if (!user) {
              user = await db.createUser(senderId, 'instagram');
              await sendInstagramMessage(senderId, db.getWelcomeMessage());
              continue;
            }

            if (user.is_blocked) continue;

            // 2. Parse Intent
            const parsed = await unifiedParseIntent(text);

            if (parsed.intent === 'DONE') {
              const success = await db.markLastReminderDone(user.id);
              await sendInstagramMessage(senderId, success ? "✅ Marked as done!" : "No pending reminders.");
              continue;
            }

            if (parsed.intent === 'LIST') {
              const reminders = await db.getPendingReminders(user.id);
              if (reminders.length === 0) {
                await sendInstagramMessage(senderId, "You have no pending reminders.");
              } else {
                const list = reminders.map(r => `• ${r.task} (${new Date(r.scheduled_at).toLocaleString()})`).join('\n');
                await sendInstagramMessage(senderId, `Your pending reminders:\n${list}`);
            }
            continue;
          }

          if (parsed.intent === 'HELP') {
            await sendInstagramMessage(senderId, db.getHelpMessage());
            continue;
          }

          // 3. Create Reminder
            if (parsed.intent === 'CREATE' && parsed.task && parsed.time) {
              const reminderCount = user.reminder_count ?? 0;
              if (user.sub_status === 'trial' && reminderCount >= 5) {
                await sendInstagramMessage(senderId, `Upgrade for unlimited: ${process.env.RAZORPAY_CHECKOUT_LINK}`);
                continue;
              }

              const reminder = await db.createReminder(user.id, parsed.task, parsed.time);
              if (reminder) {
                await db.incrementReminderCount(user.id);
                await scheduleReminder(reminder.id, user.id, parsed.task, parsed.time);
                
                const localTime = new Date(parsed.time).toLocaleString('en-US', { 
                  timeZone: user.timezone || 'UTC',
                  dateStyle: 'medium',
                  timeStyle: 'short'
                });

                await sendInstagramMessage(senderId, `✅ Set: ${parsed.task} on ${localTime}\n\n(Reply "DONE" to clear)`);
              }
            } else {
              await sendInstagramMessage(senderId, "I couldn't understand that. Try: 'remind me to call mom tomorrow at 7pm'");
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instagram Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function sendInstagramMessage(recipientId: string, text: string) {
  const PAGE_ACCESS_TOKEN = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  if (!PAGE_ACCESS_TOKEN) {
    console.error('INSTAGRAM_PAGE_ACCESS_TOKEN missing');
    return;
  }

  try {
    await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: text },
      }),
    });
  } catch (error) {
    console.error('Error sending Instagram message:', error);
  }
}
