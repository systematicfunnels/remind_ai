import { prisma } from '@/lib/prisma';

export interface User {
  id: string;
  phone_id: string;
  sub_status: string | null;
  reminder_count: number | null;
}

export interface Reminder {
  id: string;
  user_id: string | null;
  task: string;
  scheduled_at: Date;
  status: string | null;
  done_at?: Date | null;
}

export const db = {
  async getUserByPhone(phoneId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { phone_id: phoneId },
      });
    } catch (error) {
      console.error('Error fetching user with Prisma:', error);
      return null;
    }
  },

  async createUser(phoneId: string): Promise<User | null> {
    try {
      return await prisma.user.create({
        data: {
          phone_id: phoneId,
          sub_status: 'trial',
          reminder_count: 0,
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
        },
      });
    } catch (error) {
      console.error('Error incrementing reminder count with Prisma:', error);
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
  }
};
