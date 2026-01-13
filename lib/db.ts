import { prisma } from '@/lib/prisma';

export interface User {
  id: string;
  phone_id: string;
  channel: string | null;
  sub_status: string | null;
  reminder_count: number | null;
  is_blocked: boolean | null;
  payment_id: string | null;
  last_active_at: Date | null;
}

export interface Reminder {
  id: string;
  user_id: string | null;
  task: string;
  scheduled_at: Date;
  status: string | null;
  failure_reason?: string | null;
  done_at?: Date | null;
}

export const db = {
  async getUserByPhone(phoneId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { phone_id: phoneId },
      });
      
      if (user) {
        // Update last_active_at whenever we fetch a user for an interaction
        await prisma.user.update({
          where: { id: user.id },
          data: { last_active_at: new Date() }
        });
      }
      
      return user as User | null;
    } catch (error) {
      console.error('Error fetching user with Prisma:', error);
      return null;
    }
  },

  async createUser(phoneId: string, channel: string = 'unknown'): Promise<User | null> {
    try {
      return await prisma.user.create({
        data: {
          phone_id: phoneId,
          channel,
          sub_status: 'trial',
          reminder_count: 0,
          last_active_at: new Date(),
        },
      }) as User | null;
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
      }) as User | null;
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

  async createReminder(userId: string, task: string, scheduledAt: string): Promise<Reminder | null> {
    try {
      return await prisma.reminder.create({
        data: {
          user_id: userId,
          task,
          scheduled_at: new Date(scheduledAt),
          status: 'pending',
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
      return true;
    } catch (error) {
      console.error('Error marking reminder as done:', error);
      return false;
    }
  },

  getWelcomeMessage(): string {
    return "🚀 *Welcome to RemindAI!*\n\nI'm your intelligent reminder assistant. You can chat with me naturally or send voice notes, and I'll make sure you never miss a task.\n\n*Try saying something like:*\n• \"Remind me to call Mom today at 7pm\"\n• \"Schedule a meeting for tomorrow at 10am\"\n\nType 'HELP' anytime to see what else I can do!";
  },

  getHelpMessage(): string {
    return "🛠️ *RemindAI Help Menu*\n\n*Commands:*\n• *CREATE*: Just type your task and time naturally (e.g., 'remind me to pay bills on Friday at 9am')\n• *LIST*: View your next 10 pending reminders\n• *DONE*: Mark your most recent pending reminder as completed\n• *HELP*: Show this menu\n\n*Voice Support:*\nSend me a voice note and I'll transcribe and schedule it for you!\n\n*Subscription:*\nTrial users get 5 reminders. Upgrade to Premium for unlimited access! 🚀";
  }
};
