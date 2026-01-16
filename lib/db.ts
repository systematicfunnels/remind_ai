import { prisma } from '@/lib/prisma';
import { User as PrismaUser, Reminder as PrismaReminder } from '@prisma/client';

export type User = PrismaUser;
export type Reminder = PrismaReminder;

export const db = {
  async getUserByPhone(phoneId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { phone_id: phoneId },
      });

      if (user) {
        // Throttled update of last_active_at (once per hour)
        const ONE_HOUR = 60 * 60 * 1000;
        if (!user.last_active_at || Date.now() - new Date(user.last_active_at).getTime() > ONE_HOUR) {
          prisma.user.update({
            where: { id: user.id },
            data: { last_active_at: new Date() }
          }).catch(err => console.error('Throttled active update failed:', err));
        }
      }

      return user;
    } catch (error) {
      console.error('Error fetching user with Prisma:', error);
      return null;
    }
  },

  async createUser(phoneId: string, channel: string = 'unknown', role: 'user' | 'admin' = 'user'): Promise<User | null> {
    try {
      return await prisma.user.create({
        data: {
          phone_id: phoneId,
          channel,
          role,
          sub_status: 'trial',
          reminder_count: 0,
          last_active_at: new Date(),
        },
      });
    } catch (error) {
      console.error('Error creating user with Prisma:', error);
      return null;
    }
  },

  async incrementReminderCount(userId: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          reminder_count: {
            increment: 1,
          },
          last_active_at: new Date(),
        },
      });
    } catch (error) {
      console.error('Error incrementing reminder count with Prisma:', error);
    }
  },

  // Admin Actions
  async blockUser(userId: string, blocked: boolean = true) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { is_blocked: blocked }
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      return null;
    }
  },

  async resetUserUsage(userId: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { reminder_count: 0 }
      });
    } catch (error) {
      console.error('Error resetting user usage:', error);
      return null;
    }
  },

  async cancelReminder(reminderId: string) {
    try {
      return await prisma.reminder.update({
        where: { id: reminderId },
        data: { status: 'cancelled' }
      });
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      return null;
    }
  },

  async cancelLastReminder(userId: string): Promise<boolean> {
    try {
      const lastReminder = await prisma.reminder.findFirst({
        where: {
          user_id: userId,
          status: 'pending',
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      if (!lastReminder) return false;

      await prisma.reminder.update({
        where: { id: lastReminder.id },
        data: {
          status: 'cancelled',
        },
      });
      return true;
    } catch (error) {
      console.error('Error cancelling last reminder:', error);
      return false;
    }
  },

  async createReminder(userId: string, task: string, scheduledAt: string, recurrence: any = 'none'): Promise<Reminder | null> {
    try {
      return await prisma.reminder.create({
        data: {
          user_id: userId,
          task,
          scheduled_at: new Date(scheduledAt),
          status: 'pending',
          recurrence: recurrence,
        },
      });
    } catch (error) {
      console.error('Error creating reminder with Prisma:', error);
      return null;
    }
  },

  async getPendingReminders(userId: string): Promise<Reminder[]> {
    try {
      return await prisma.reminder.findMany({
        where: {
          user_id: userId,
          status: 'pending',
        },
        orderBy: {
          scheduled_at: 'asc',
        },
        take: 10,
      });
    } catch (error) {
      console.error('Error fetching pending reminders:', error);
      return [];
    }
  },

  async markLastReminderDone(userId: string): Promise<boolean> {
    try {
      const lastReminder = await prisma.reminder.findFirst({
        where: {
          user_id: userId,
          status: 'pending',
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      if (!lastReminder) return false;

      await prisma.reminder.update({
        where: { id: lastReminder.id },
        data: {
          status: 'done',
          done_at: new Date(),
        },
      });

      // Handle Recurrence for manual completion
      if (lastReminder.recurrence && lastReminder.recurrence !== 'none') {
        await this.handleRecurrence(lastReminder);
      }

      return true;
    } catch (error) {
      console.error('Error marking reminder as done:', error);
      return false;
    }
  },

  async markReminderDoneByQuery(userId: string, query: string): Promise<boolean> {
    try {
      // Find the best match for the task
      const reminder = await prisma.reminder.findFirst({
        where: {
          user_id: userId,
          status: 'pending',
          task: {
            contains: query,
            mode: 'insensitive'
          }
        },
        orderBy: {
          scheduled_at: 'asc'
        }
      });

      if (!reminder) return false;

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: 'done',
          done_at: new Date()
        }
      });

      // Handle Recurrence for manual completion
      if (reminder.recurrence && reminder.recurrence !== 'none') {
        await this.handleRecurrence(reminder);
      }

      return true;
    } catch (error) {
      console.error('Error marking specific reminder as done:', error);
      return false;
    }
  },

  async handleRecurrence(reminder: any) {
    try {
      const { scheduleReminder } = await import('./queue');
      const nextScheduledAt = new Date(reminder.scheduled_at);
      
      if (reminder.recurrence === 'daily') {
        nextScheduledAt.setDate(nextScheduledAt.getDate() + 1);
      } else if (reminder.recurrence === 'weekly') {
        nextScheduledAt.setDate(nextScheduledAt.getDate() + 7);
      } else if (reminder.recurrence === 'monthly') {
        nextScheduledAt.setMonth(nextScheduledAt.getMonth() + 1);
      } else {
        return; // No recurrence
      }

      const nextReminder = await prisma.reminder.create({
        data: {
          user_id: reminder.user_id,
          task: reminder.task,
          scheduled_at: nextScheduledAt,
          status: 'pending',
          recurrence: reminder.recurrence,
        }
      });

      await scheduleReminder(nextReminder.id, reminder.user_id, reminder.task, nextScheduledAt.toISOString());
      console.log(`Rescheduled recurring reminder ${reminder.id} -> ${nextReminder.id} for ${nextScheduledAt.toISOString()}`);
    } catch (error) {
      console.error('Failed to handle recurrence in db.ts:', error);
    }
  },

  getWelcomeMessage(): string {
    return "🚀 *Welcome to RemindAI!*\n\nI'm your intelligent reminder assistant. You can chat with me naturally or send voice notes, and I'll make sure you never miss a task.\n\n*Try saying something like:*\n• \"Remind me to call Mom today at 7pm\"\n• \"Schedule a meeting for tomorrow at 10am\"\n\nType 'HELP' anytime to see what else I can do!";
  },

  getHelpMessage(): string {
    return "🛠️ *RemindAI Help Menu*\n\n*Commands:*\n• *CREATE*: Just type your task and time naturally (e.g., 'remind me to pay bills on Friday at 9am')\n• *LIST*: View your next 10 pending reminders\n• *DONE*: Mark your most recent pending reminder as completed\n• *TIMEZONE*: Set your local timezone (e.g., 'I am in New York' or 'timezone Asia/Kolkata')\n• *STATUS*: Check your subscription and usage\n• *ERASE*: Delete all your data from our system (requires confirmation)\n• *HELP*: Show this menu\n\n*Voice Support:*\nSend me a voice note and I'll transcribe and schedule it for you!\n\n*Subscription:*\nTrial users get 5 reminders. Upgrade to Premium for unlimited access! 🚀";
  },

  async updateUserTimezone(userId: string, timezone: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { timezone }
      });
    } catch (error) {
      console.error('Error updating timezone:', error);
      return null;
    }
  },

  async eraseUserData(userId: string) {
    try {
      // We don't delete the user record to prevent ID reuse, but we clear all PII
      await prisma.reminder.deleteMany({
        where: { user_id: userId }
      });
      return await prisma.user.update({
        where: { id: userId },
        data: {
          phone_id: `ERASED_${userId}`,
          is_erased: true,
          is_blocked: true,
          payment_id: null,
          reminder_count: 0
        }
      });
    } catch (error) {
      console.error('Error erasing user data:', error);
      return null;
    }
  }
};
