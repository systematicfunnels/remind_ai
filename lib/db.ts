import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  phone_id: string;
  sub_status: 'trial' | 'paid' | 'cancelled';
  reminder_count: number;
}

export interface Reminder {
  id: string;
  user_id: string;
  task: string;
  scheduled_at: string;
  status: 'pending' | 'done';
  done_at?: string;
}

export const db = {
  async getUserByPhone(phoneId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_id', phoneId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error);
    }
    return data;
  },

  async createUser(phoneId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([{ phone_id: phoneId, sub_status: 'trial', reminder_count: 0 }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    return data;
  },

  async incrementReminderCount(userId: string) {
    const { error } = await supabase.rpc('increment_reminder_count', { user_id_param: userId });
    if (error) {
      // Fallback if RPC doesn't exist yet
      const { data: user } = await supabase.from('users').select('reminder_count').eq('id', userId).single();
      await supabase.from('users').update({ reminder_count: (user?.reminder_count || 0) + 1 }).eq('id', userId);
    }
  },

  async createReminder(userId: string, task: string, scheduledAt: string): Promise<Reminder | null> {
    const { data, error } = await supabase
      .from('reminders')
      .insert([{ user_id: userId, task, scheduled_at: scheduledAt, status: 'pending' }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating reminder:', error);
      return null;
    }

    return data;
  }
};
