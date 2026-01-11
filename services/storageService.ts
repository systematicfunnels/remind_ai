
import { User, Reminder, Stats, SystemLog } from '../types';

const STORAGE_KEY = 'remind_ai_data';
const LOGS_KEY = 'remind_ai_logs';

interface AppData {
  users: User[];
  reminders: Reminder[];
}

const initialData: AppData = {
  users: [
    { id: '1', phone: '+919876543210', platform: 'whatsapp', subscriptionStatus: 'premium', reminderCount: 45, createdAt: '2024-01-15' },
    { id: '2', phone: 'user_telegram_88', platform: 'telegram', subscriptionStatus: 'free', reminderCount: 4, createdAt: '2024-02-10' },
  ],
  reminders: [
    { id: 'r1', userId: '1', task: 'Call Mom', scheduledAt: new Date(Date.now() + 3600000).toISOString(), status: 'pending', originalMessage: 'Remind me to call mom in 1 hour', isVoice: false, createdAt: '2024-02-18' },
    { id: 'r2', userId: '2', task: 'Buy Groceries', scheduledAt: new Date(Date.now() + 7200000).toISOString(), status: 'pending', originalMessage: 'Grocery list reminder', isVoice: true, createdAt: '2024-02-18' },
  ]
};

export const getAppData = (): AppData => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialData;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addLog = (log: Omit<SystemLog, 'id' | 'timestamp'>) => {
  const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  logs.unshift({ ...log, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() });
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
};

export const getLogs = (): SystemLog[] => JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');

export const getStats = (): Stats => {
  const data = getAppData();
  const premiumUsers = data.users.filter(u => u.subscriptionStatus === 'premium').length;
  return {
    totalUsers: data.users.length,
    activeReminders: data.reminders.filter(r => r.status === 'pending').length,
    completedReminders: data.reminders.filter(r => r.status === 'completed').length,
    mrr: premiumUsers * 99
  };
};

export const createReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
  const data = getAppData();
  const newReminder: Reminder = {
    ...reminder,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  data.reminders.push(newReminder);
  const user = data.users.find(u => u.id === reminder.userId);
  if (user) user.reminderCount++;
  saveAppData(data);
  return newReminder;
};

export const getUserReminders = (userId: string) => {
  return getAppData().reminders.filter(r => r.userId === userId && r.status === 'pending');
};

export const markReminderAsDone = (userId: string, taskQuery: string) => {
  const data = getAppData();
  const index = data.reminders.findIndex(r => r.userId === userId && r.status === 'pending' && r.task.toLowerCase().includes(taskQuery.toLowerCase()));
  if (index !== -1) {
    data.reminders[index].status = 'completed';
    saveAppData(data);
    return data.reminders[index];
  }
  return null;
};
