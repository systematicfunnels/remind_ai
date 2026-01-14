import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleReminder } from '@/lib/queue';
import { unifiedParseIntent } from '@/services/aiService';
import { unifiedTranscribe } from '@/services/voiceService';
import twilio from 'twilio';

export const dynamic = 'force-dynamic';

const twilioClient = (process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  
  // Security: Validate Twilio Signature
  const signature = req.headers.get('x-twilio-signature') || '';
  const url = process.env.WHATSAPP_WEBHOOK_URL || '';
  const params = Object.fromEntries(formData.entries());

  if (process.env.NODE_ENV === 'production' && !twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN!, signature, url, params)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      
      const transcription = await unifiedTranscribe(audioBuffer, mediaType);
      if (transcription) {
        body = transcription;
        // Combined feedback will be sent in the final confirmation step
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
  if (body.toUpperCase() === 'UNDO') {
    const success = await db.cancelLastReminder(user.id);
    await sendWhatsAppMessage(from, success ? "🗑️ Cancelled your last reminder." : "You don't have any pending reminders to cancel.");
    return NextResponse.json({ success: true });
  }

  const parsed = await unifiedParseIntent(body, user.timezone || 'UTC');

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
        .map(r => `• ${r.task} (${new Date(r.scheduled_at).toLocaleString('en-US', { timeZone: user.timezone || 'UTC' })})`)
        .join('\n');
      await sendWhatsAppMessage(from, `Your pending reminders:\n${list}`);
    }
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'HELP') {
    await sendWhatsAppMessage(from, db.getHelpMessage());
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'TIMEZONE') {
    if (parsed.timezone) {
      await db.updateUserTimezone(user.id, parsed.timezone);
      await sendWhatsAppMessage(from, `✅ Timezone updated to ${parsed.timezone}`);
    } else {
      await sendWhatsAppMessage(from, "Please specify a timezone (e.g., 'Asia/Kolkata')");
    }
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'BILLING') {
    const status = user.sub_status === 'trial' ? 'Free Trial' : 'Premium Subscription';
    const limitMsg = user.sub_status === 'trial' ? `(${user.reminder_count}/5 reminders used)` : '';
    await sendWhatsAppMessage(from, `💳 Status: ${status} ${limitMsg}\n\nManage subscription: ${process.env.RAZORPAY_CHECKOUT_LINK || '#'}`);
    return NextResponse.json({ success: true });
  }

  if (parsed.intent === 'ERASE') {
    await db.eraseUserData(user.id);
    await sendWhatsAppMessage(from, "🗑️ Your account and data have been permanently erased. Goodbye!");
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
      
      const localTime = new Date(parsed.time).toLocaleString('en-US', { 
        timeZone: user.timezone || 'UTC',
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      let confirmation = `✅ Set: ${parsed.task} on ${localTime}\n\n(Reply "DONE" to clear or "UNDO" to cancel)`;
      if (mediaUrl && mediaType?.startsWith('audio/')) {
        confirmation = `🎤 Heard: "${body}"\n\n${confirmation}`;
      }
      await sendWhatsAppMessage(from, confirmation);
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
