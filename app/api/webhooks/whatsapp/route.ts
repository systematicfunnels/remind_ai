import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleReminder } from '@/lib/queue';
import { unifiedParseIntent } from '@/services/aiService';
import { transcribeAudio } from '@/services/openaiService';
import twilio from 'twilio';

export const dynamic = 'force-dynamic';

const twilioClient = (process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get('From') as string; // WhatsApp number
  let body = (formData.get('Body') as string || '').trim();
  const mediaUrl = formData.get('MediaUrl0') as string;
  const mediaType = formData.get('MediaContentType0') as string;

  if (!from || (!body && !mediaUrl)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // 1. Get or Create User
  let user = await db.getUserByPhone(from);
  if (!user) {
    user = await db.createUser(from, 'whatsapp');
    await sendWhatsAppMessage(from, db.getWelcomeMessage());
    return NextResponse.json({ success: true });
  }

  // Check if blocked
  if (user.is_blocked) {
    return NextResponse.json({ success: true });
  }

  // Handle Voice/Audio Media
  if (mediaUrl && mediaType?.startsWith('audio/')) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const audioResponse = await fetch(mediaUrl, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
      
      const transcription = await transcribeAudio(audioBuffer);
      if (transcription) {
        body = transcription;
        await sendWhatsAppMessage(from, `🎤 Heard: "${body}"`);
      } else {
        await sendWhatsAppMessage(from, "Sorry, I couldn't transcribe that voice message.");
        return NextResponse.json({ success: true });
      }
    } catch (error) {
      console.error('WhatsApp voice handling error:', error);
      await sendWhatsAppMessage(from, "Error processing voice message.");
      return NextResponse.json({ success: true });
    }
  }

  // 2. Parse Intent (Handles commands & natural language)
  const parsed = await unifiedParseIntent(body);

  if (parsed.intent === 'DONE') {
    const success = await db.markLastReminderDone(user.id);
    if (success) {
      await sendWhatsAppMessage(from, "✅ Marked your most recent reminder as done!");
    } else {
      await sendWhatsAppMessage(from, "You don't have any pending reminders.");
    }
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'LIST') {
    const reminders = await db.getPendingReminders(user.id);
    if (reminders.length === 0) {
      await sendWhatsAppMessage(from, "You have no pending reminders.");
    } else {
      const list = reminders
        .map(r => `• ${r.task} (${new Date(r.scheduled_at).toLocaleString()})`)
        .join('\n');
      await sendWhatsAppMessage(from, `Your pending reminders:\n${list}`);
    }
    return NextResponse.json({ success: true });
  }

  // 3. Check Subscription & Limit
  const reminderCount = user.reminder_count ?? 0;
  if (user.sub_status === 'trial' && reminderCount >= 5) {
    await sendWhatsAppMessage(from, `Upgrade for unlimited: ${process.env.RAZORPAY_CHECKOUT_LINK}`);
    return NextResponse.json({ success: true });
  }

  // 4. Create Reminder
  if (parsed.intent === 'CREATE' && parsed.task && parsed.time) {
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
