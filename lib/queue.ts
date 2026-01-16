import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import twilio from 'twilio';
import { logger } from './logger';

const redisUrl = process.env.UPSTASH_REDIS_URL;

export const connection = (redisUrl && !redisUrl.includes('your-redis-url'))
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
    logger.warn('Reminder Queue not initialized. Redis URL might be missing.');
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
      logger.error('User phone_id not found for scheduling', { userId, reminderId });
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
    
    logger.info(`Successfully scheduled reminder ${reminderId} for ${user.phone_id} at ${scheduledAt}`);
  } catch (error) {
    logger.error('Failed to schedule reminder in BullMQ', { error, reminderId, userId });
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
    } else {
      // Telegram
      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: phoneId, text: message }),
      });
    }
  } catch (error) {
    logger.error('Failed to send direct message', { error, phoneId, platform });
  }
}

export const startWorker = () => {
  if (!connection) {
    logger.warn('BullMQ Worker: No Redis connection found. Skipping worker start.');
    return;
  }

  const worker = new Worker('reminder-queue', async (job: Job) => {
    const { phoneId, task, platform, reminderId } = job.data;

    logger.info(`Processing reminder: ${task} for ${phoneId}`);

    try {
      const { prisma } = await import('./prisma');
      
      // Check if reminder still exists and is pending
      const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId }
      });

      if (!reminder || reminder.status !== 'pending') {
        logger.info(`Reminder ${reminderId} is no longer pending (status: ${reminder?.status}). Skipping notification.`);
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
          logger.error('Twilio client not initialized');
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

      // Handle Recurrence: Schedule the next instance
      if (reminder.recurrence && reminder.recurrence !== 'none') {
        const { db } = await import('./db');
        await db.handleRecurrence(reminder);
      }
 
    } catch (error) {
      logger.error(`Failed to process job ${job.id}`, { error, reminderId });
      throw error; // Let BullMQ handle retry
    }

  }, { connection });

  worker.on('completed', job => {
    logger.info(`${job.id} has completed!`);
  });

  worker.on('failed', async (job, err) => {
    logger.error(`${job?.id} has failed with ${err.message}`, { error: err });
    
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
        logger.error('Failed to update reminder status on job failure', { error: dbErr });
      }
    }
  });
};
