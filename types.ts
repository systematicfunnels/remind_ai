
export interface User {
  id: string;
  phone: string;
  platform: 'whatsapp' | 'telegram';
  subscriptionStatus: 'free' | 'premium';
  reminderCount: number;
  createdAt: string;
}

export type ReminderStatus = 'pending' | 'completed' | 'cancelled';
export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'none';

export interface Reminder {
  id: string;
  userId: string;
  task: string;
  scheduledAt: string;
  status: ReminderStatus;
  recurrence: RecurrenceRule;
  originalMessage: string;
  isVoice: boolean;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  platform: 'whatsapp' | 'telegram';
  userId: string;
  message: string;
  intent: string;
}

export interface Stats {
  totalUsers: number;
  activeReminders: number;
  completedReminders: number;
  mrr: number;
}
