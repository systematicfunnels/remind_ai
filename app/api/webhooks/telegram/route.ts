import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleReminder } from '@/lib/queue';
import { parseReminderIntent } from '@/services/openaiService';

export const dynamic = 'force-dynamic';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body.message;

  if (!message || !message.text || !message.chat) {
    return NextResponse.json({ success: true });
  }

  const chatId = message.chat.id.toString();
  const text = message.text;

  // 1. Get or Create User
  let user = await db.getUserByPhone(chatId);
  if (!user) {
    user = await db.createUser(chatId);
    await sendTelegramMessage(chatId, "Hi! 5 free reminders. Say 'remind me tomorrow 7PM call mom'");
    return NextResponse.json({ success: true });
  }

  // 2. Check Subscription & Limit
  if (user.sub_status === 'trial' && user.reminder_count >= 5) {
    await sendTelegramMessage(chatId, `Upgrade for unlimited: ${process.env.RAZORPAY_CHECKOUT_LINK}`);
    return NextResponse.json({ success: true });
  }

  // 3. Parse Intent
  const parsed = await parseReminderIntent(text);
  if (parsed) {
    // 4. Create Reminder
    const reminder = await db.createReminder(user.id, parsed.task, parsed.time);
    if (reminder) {
      await db.incrementReminderCount(user.id);
      await scheduleReminder(reminder.id, user.id, parsed.task, parsed.time);
      await sendTelegramMessage(chatId, `✅ Set: ${parsed.task} on ${new Date(parsed.time).toLocaleString()}`);
    } else {
      await sendTelegramMessage(chatId, "Sorry, I couldn't save that reminder right now.");
    }
  } else {
    await sendTelegramMessage(chatId, "I couldn't understand that. Try: 'remind me to call mom tomorrow at 7pm'");
  }

  return NextResponse.json({ success: true });
}

async function sendTelegramMessage(chatId: string, text: string) {
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text }),
    });
  } catch (error) {
    console.error('Telegram Error:', error);
  }
}
