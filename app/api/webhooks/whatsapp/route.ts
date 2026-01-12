import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleReminder } from '@/lib/queue';
import { parseReminderIntent } from '@/services/openaiService';
import twilio from 'twilio';

const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get('From') as string; // WhatsApp number
  const body = formData.get('Body') as string;

  if (!from || !body) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // 1. Get or Create User
  let user = await db.getUserByPhone(from);
  if (!user) {
    user = await db.createUser(from);
    await sendWhatsAppMessage(from, "Hi! 5 free reminders. Say 'remind me tomorrow 7PM call mom'");
    return NextResponse.json({ success: true });
  }

  // 2. Check Subscription & Limit
  if (user.sub_status === 'trial' && user.reminder_count >= 5) {
    await sendWhatsAppMessage(from, `Upgrade for unlimited: ${process.env.RAZORPAY_CHECKOUT_LINK}`);
    return NextResponse.json({ success: true });
  }

  // 3. Parse Intent
  const parsed = await parseReminderIntent(body);
  if (parsed) {
    // 4. Create Reminder
    const reminder = await db.createReminder(user.id, parsed.task, parsed.time);
    if (reminder) {
      await db.incrementReminderCount(user.id);
      await scheduleReminder(reminder.id, user.id, parsed.task, parsed.time);
      await sendWhatsAppMessage(from, `✅ Set: ${parsed.task} on ${new Date(parsed.time).toLocaleString()}`);
    } else {
      await sendWhatsAppMessage(from, "Sorry, I couldn't save that reminder right now.");
    }
  } else {
    await sendWhatsAppMessage(from, "I couldn't understand that. Try: 'remind me to call mom tomorrow at 7pm'");
  }

  return NextResponse.json({ success: true });
}

async function sendWhatsAppMessage(to: string, message: string) {
  if (!twilioClient) {
    console.error('Twilio client not initialized');
    return;
  }
  try {
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: to,
      body: message,
    });
  } catch (error) {
    console.error('Twilio Error:', error);
  }
}
