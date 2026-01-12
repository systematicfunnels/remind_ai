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
    
    // We need the phone_id to send the message
    const { supabase } = await import('./supabase');
    const { data: user } = await supabase.from('users').select('phone_id').eq('id', userId).single();

    if (!user?.phone_id) {
      console.error('User phone_id not found for scheduling');
      return;
    }

    await reminderQueue.add('send-reminder', {
      reminderId,
      userId,
      phoneId: user.phone_id,
      task,
      platform: user.phone_id.startsWith('+') ? 'whatsapp' : 'telegram'
    }, {
      delay: Math.max(0, delay),
      removeOnComplete: true
    });
    
    console.log(`Successfully scheduled reminder ${reminderId} for ${user.phone_id} at ${scheduledAt}`);
  } catch (error) {
    console.error('Failed to schedule reminder in BullMQ:', error);
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
      if (platform === 'whatsapp' || phoneId.startsWith('+') || phoneId.includes('whatsapp')) {
        if (twilioClient) {
          await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: phoneId,
            body: `🔔 REMINDER: ${task}\n\nReply with "DONE" to mark as finished.`,
          });
        } else {
          console.error('Twilio client not initialized');
        }
      } else {
        // Telegram
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: phoneId, text: `🔔 REMINDER: ${task}` }),
        });
      }

      // Update status in DB
      const { supabase } = await import('./supabase');
      await supabase.from('reminders').update({ 
        status: 'done', 
        done_at: new Date().toISOString() 
      }).eq('id', reminderId);

    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
      throw error; // Let BullMQ handle retry
    }

  }, { connection });

  worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`${job?.id} has failed with ${err.message}`);
  });
};
