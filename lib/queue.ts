import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import twilio from 'twilio';

const redisUrl = process.env.UPSTASH_REDIS_URL;

const connection = (redisUrl && !redisUrl.includes('your-redis-url'))
  ? new IORedis(redisUrl, { 
      maxRetriesPerRequest: null,
      // Upstash Redis usually requires TLS, which IORedis handles with rediss://
    }) 
  : null;

export const reminderQueue = connection ? new Queue('reminder-queue', { connection }) : null;

const twilioClient = (process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

/**
 * Helper to schedule a reminder job in BullMQ
 */
export async function scheduleReminder(reminderId: string, userId: string, task: string, scheduledAt: string) {
  if (!reminderQueue) {
    console.warn('Reminder Queue not initialized. Redis URL might be missing.');
    return;
  }

  try {
    const delay = new Date(scheduledAt).getTime() - Date.now();
    
    // We need the phone_id and channel to send the message
    const { prisma } = await import('./prisma');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone_id: true, channel: true }
    });

    if (!user?.phone_id) {
      console.error('User phone_id not found for scheduling');
      return;
    }

    await reminderQueue.add('send-reminder', {
      reminderId,
      userId,
      phoneId: user.phone_id,
      task,
      platform: user.channel || (user.phone_id.startsWith('+') ? 'whatsapp' : 'telegram')
    }, {
      delay: Math.max(0, delay),
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000 * 60, // 1 minute initial delay
      }
    });
    
    console.log(`Successfully scheduled reminder ${reminderId} for ${user.phone_id} at ${scheduledAt}`);
  } catch (error) {
    console.error('Failed to schedule reminder in BullMQ:', error);
  }
}

/**
 * Helper to send a direct message (not a scheduled reminder)
 */
export async function sendDirectMessage(phoneId: string, platform: string, message: string) {
  try {
    if (platform === 'whatsapp') {
      if (twilioClient) {
        await twilioClient.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: phoneId,
          body: message,
        });
      }
    } else if (platform === 'instagram') {
      const PAGE_ACCESS_TOKEN = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
      if (PAGE_ACCESS_TOKEN) {
        await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: phoneId },
            message: { text: message },
          }),
        });
      }
    } else {
      // Telegram
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: phoneId, text: message }),
      });
    }
  } catch (error) {
    console.error('Failed to send direct message:', error);
  }
}

export const startWorker = () => {
  if (!connection) {
    console.warn('BullMQ Worker: No Redis connection found. Skipping worker start.');
    return;
  }

  const worker = new Worker('reminder-queue', async (job: Job) => {
    const { phoneId, task, platform, reminderId } = job.data;

    console.log(`Processing reminder: ${task} for ${phoneId}`);

    try {
      const { prisma } = await import('./prisma');
      
      // Check if reminder still exists and is pending
      const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId }
      });

      if (!reminder || reminder.status !== 'pending') {
        console.log(`Reminder ${reminderId} is no longer pending (status: ${reminder?.status}). Skipping notification.`);
        return;
      }

      const messageText = `🔔 *REMINDER*: ${task}\n\nReply with "DONE" to mark as finished or "LIST" to see other tasks.`;

      if (platform === 'whatsapp') {
        if (twilioClient) {
          await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: phoneId,
            body: messageText,
          });
        } else {
          console.error('Twilio client not initialized');
        }
      } else if (platform === 'instagram') {
        const PAGE_ACCESS_TOKEN = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
        if (PAGE_ACCESS_TOKEN) {
          await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: { id: phoneId },
              message: { text: messageText },
            }),
          });
        } else {
          console.error('INSTAGRAM_PAGE_ACCESS_TOKEN missing');
        }
      } else {
        // Default to Telegram
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: phoneId, 
            text: messageText,
            parse_mode: 'Markdown'
          }),
        });
      }

      // Update status in DB
      await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: 'done',
          done_at: new Date()
        }
      });
 
    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
      throw error; // Let BullMQ handle retry
    }

  }, { connection });

  worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
  });

  worker.on('failed', async (job, err) => {
    console.error(`${job?.id} has failed with ${err.message}`);
    
    if (job?.data?.reminderId) {
      try {
        const { prisma } = await import('./prisma');
        await prisma.reminder.update({
          where: { id: job.data.reminderId },
          data: {
            status: 'failed',
            failure_reason: err.message
          }
        });
      } catch (dbErr) {
        console.error('Failed to update reminder status on job failure:', dbErr);
      }
    }
  });
};
