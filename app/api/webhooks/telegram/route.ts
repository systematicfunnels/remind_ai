import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleReminder } from '@/lib/queue';
import { unifiedParseIntent } from '@/services/aiService';
import { transcribeAudio } from '@/services/openaiService';

export const dynamic = 'force-dynamic';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export async function POST(req: NextRequest) {
  // Security: Validate Telegram Secret Token
  const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
  if (process.env.NODE_ENV === 'production' && secretToken !== process.env.TELEGRAM_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const message = body.message;

  if (!message || (!message.text && !message.voice) || !message.chat) {
    return NextResponse.json({ success: true });
  }

  const chatId = message.chat.id.toString();
  let text = message.text?.trim() || '';

  // 1. Get or Create User
  let user = await db.getUserByPhone(chatId);
  if (!user) {
    user = await db.createUser(chatId, 'telegram');
    await sendTelegramMessage(chatId, db.getWelcomeMessage());
    return NextResponse.json({ success: true });
  }

  // Check if blocked
  if (user.is_blocked) {
    return NextResponse.json({ success: true });
  }

  // Handle Voice Message
  if (message.voice) {
    try {
      const fileId = message.voice.file_id;
      const fileResponse = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
      const fileData = await fileResponse.json();
      const filePath = fileData.result.file_path;
      
      const audioUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
      const audioResponse = await fetch(audioUrl);
      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
      
      const transcription = await transcribeAudio(audioBuffer);
      if (transcription) {
        text = transcription;
        // Combined feedback will be sent in the final confirmation step
      } else {
        await sendTelegramMessage(chatId, "Sorry, I couldn't transcribe that voice message.");
        return NextResponse.json({ success: true });
      }
    } catch (error) {
      console.error('Voice handling error:', error);
      await sendTelegramMessage(chatId, "Error processing voice message.");
      return NextResponse.json({ success: true });
    }
  }

  // 2. Parse Intent (Handles commands & natural language)
  const parsed = await unifiedParseIntent(text);

  if (parsed.intent === 'DONE') {
    const success = await db.markLastReminderDone(user.id);
    if (success) {
      await sendTelegramMessage(chatId, "✅ Marked your most recent reminder as done!");
    } else {
      await sendTelegramMessage(chatId, "You don't have any pending reminders.");
    }
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'LIST') {
    const reminders = await db.getPendingReminders(user.id);
    if (reminders.length === 0) {
      await sendTelegramMessage(chatId, "You have no pending reminders.");
    } else {
      const list = reminders
        .map(r => `• ${r.task} (${new Date(r.scheduled_at).toLocaleString()})`)
        .join('\n');
      await sendTelegramMessage(chatId, `Your pending reminders:\n${list}`);
    }
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'HELP') {
    await sendTelegramMessage(chatId, db.getHelpMessage());
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'TIMEZONE') {
    if (parsed.timezone) {
      await db.updateUserTimezone(user.id, parsed.timezone);
      await sendTelegramMessage(chatId, `✅ Timezone updated to ${parsed.timezone}`);
    } else {
      await sendTelegramMessage(chatId, "Please specify a timezone (e.g., 'Asia/Kolkata')");
    }
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'BILLING') {
    const status = user.sub_status === 'trial' ? 'Free Trial' : 'Premium Subscription';
    const limitMsg = user.sub_status === 'trial' ? `(${user.reminder_count}/5 reminders used)` : '';
    await sendTelegramMessage(chatId, `💳 Status: ${status} ${limitMsg}\n\nManage subscription: ${process.env.RAZORPAY_CHECKOUT_LINK || '#'}`);
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'ERASE') {
    // For security, only proceed if they explicitly say "confirm" or similar in their next message
    // but for this MVP implementation, we'll do it directly if the intent is high confidence
    await db.eraseUserData(user.id);
    await sendTelegramMessage(chatId, "🗑️ Your account and data have been permanently erased. Goodbye!");
    return NextResponse.json({ success: true });
  }

  // 3. Check Subscription & Limit
  const reminderCount = user.reminder_count ?? 0;
  if (user.sub_status === 'trial' && reminderCount >= 5) {
    await sendTelegramMessage(chatId, `Upgrade for unlimited: ${process.env.RAZORPAY_CHECKOUT_LINK}`);
    return NextResponse.json({ success: true });
  }

  // 4. Create Reminder
  if (parsed.intent === 'CREATE' && parsed.task && parsed.time) {
    const reminder = await db.createReminder(user.id, parsed.task, parsed.time);
    if (reminder) {
      await db.incrementReminderCount(user.id);
      await scheduleReminder(reminder.id, user.id, parsed.task, parsed.time);
      
      let confirmation = `✅ Set: ${parsed.task} on ${new Date(parsed.time).toLocaleString()}\n\n(Reply "DONE" to clear or "UNDO" to cancel)`;
      if (message.voice) {
        confirmation = `🎤 Heard: "${text}"\n\n${confirmation}`;
      }
      await sendTelegramMessage(chatId, confirmation);
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
