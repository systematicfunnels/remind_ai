
import { User, Reminder, Stats, SystemLog, RecurrenceRule } from '../types';

const STORAGE_KEY = 'remind_ai_data_v2';
const LOGS_KEY = 'remind_ai_logs_v2';
export const SYNC_EVENT = 'remind_ai_sync';

interface AppData {
  users: User[];
  reminders: Reminder[];
}

const initialData: AppData = {
  users: [
    { id: '1', phone: '+91 9988776655', platform: 'whatsapp', subscriptionStatus: 'premium', reminderCount: 124, createdAt: '2024-01-15' },
    { id: '2', phone: 'Demo User', platform: 'whatsapp', subscriptionStatus: 'free', reminderCount: 0, createdAt: new Date().toISOString() },
  ],
  reminders: []
};

const broadcastUpdate = () => {
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
};

export const getAppData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initialData;
  } catch {
    return initialData;
  }
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  broadcastUpdate();
};

export const upgradeUserToPro = (userId: string) => {
  const data = getAppData();
  const index = data.users.findIndex(u => u.id === userId);
  if (index !== -1) {
    data.users[index].subscriptionStatus = 'premium';
    saveAppData(data);
    addLog({ 
      platform: data.users[index].platform, 
      userId, 
      message: "User upgraded to Premium tier", 
      intent: 'UPGRADE' 
    });
  }
};

export const addLog = (log: Omit<SystemLog, 'id' | 'timestamp'>) => {
  const logs = getLogs();
  const newLog = { 
    ...log, 
    id: 'log_' + Math.random().toString(36).substr(2, 9), 
    timestamp: new Date().toISOString() 
  };
  logs.unshift(newLog);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  broadcastUpdate();
};

export const getLogs = (): SystemLog[] => {
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const clearLogs = () => {
  localStorage.removeItem(LOGS_KEY);
  broadcastUpdate();
};

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

export const createReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>): Reminder | null => {
  const data = getAppData();
  const userIndex = data.users.findIndex(u => u.id === reminder.userId);
  
  if (userIndex === -1) return null;
  const user = data.users[userIndex];

  // Limit check for free users
  if (user.subscriptionStatus === 'free') {
    const activeCount = data.reminders.filter(r => r.userId === reminder.userId && r.status === 'pending').length;
    if (activeCount >= 5) return null;
  }

  const newReminder: Reminder = {
    ...reminder,
    id: 'rem_' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  
  data.reminders.push(newReminder);
  data.users[userIndex].reminderCount++;
  saveAppData(data);
  return newReminder;
};

export const getUserReminders = (userId: string) => {
  const data = getAppData();
  return data.reminders.filter(r => r.userId === userId && r.status === 'pending');
};

export const markReminderAsDone = (userId: string, taskQuery: string) => {
  const data = getAppData();
  const index = data.reminders.findIndex(r => 
    r.userId === userId && 
    r.status === 'pending' && 
    (r.task.toLowerCase().includes(taskQuery.toLowerCase()) || taskQuery === '')
  );
  
  if (index !== -1) {
    data.reminders[index].status = 'completed';
    
    // Handle Recurrence
    const oldRem = data.reminders[index];
    if (oldRem.recurrence !== 'none') {
      const nextDate = new Date(oldRem.scheduledAt);
      if (oldRem.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
      if (oldRem.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      if (oldRem.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      
      const newRecurrent: Reminder = {
        ...oldRem,
        id: 'rem_' + Math.random().toString(36).substr(2, 9),
        scheduledAt: nextDate.toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      data.reminders.push(newRecurrent);
    }

    saveAppData(data);
    return data.reminders[index];
  }
  return null;
};
