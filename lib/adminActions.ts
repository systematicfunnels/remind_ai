'use server';

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';
import { scheduleReminder } from './queue';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  (await cookies()).delete('admin_session');
  redirect('/admin/login');
}

export async function getAdminStats() {
  const [totalUsers, paidUsers, totalReminders, pendingReminders] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { sub_status: 'paid' } }),
    prisma.reminder.count(),
    prisma.reminder.count({ where: { status: 'pending' } }),
  ]);

  return {
    totalUsers,
    paidUsers,
    totalReminders,
    pendingReminders,
    freeUsers: totalUsers - paidUsers,
  };
}

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { created_at: 'desc' },
  });
}

export async function getAllReminders(status?: string) {
  return prisma.reminder.findMany({
    where: status && status !== 'all' ? { status } : {},
    include: {
      user: {
        select: {
          phone_id: true,
        },
      },
    },
    orderBy: { scheduled_at: 'desc' },
  });
}

export async function blockUser(userId: string, blocked: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { is_blocked: blocked },
  });
  revalidatePath('/admin/users');
}

export async function resetUserUsage(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { reminder_count: 0 },
  });
  revalidatePath('/admin/users');
}

export async function cancelReminder(reminderId: string) {
  await prisma.reminder.update({
    where: { id: reminderId },
    data: { status: 'cancelled' },
  });
  revalidatePath('/admin/reminders');
}

export async function retryReminder(reminderId: string) {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: { user: true }
  });

  if (!reminder || !reminder.user) return;

  // Re-schedule for 1 minute from now
  const newTime = new Date(Date.now() + 60000);
  
  await prisma.reminder.update({
    where: { id: reminderId },
    data: { 
      status: 'pending',
      scheduled_at: newTime
    },
  });

  await scheduleReminder(reminder.id, reminder.user.id, reminder.task, newTime.toISOString());
  revalidatePath('/admin/reminders');
}

export async function deleteUser(userId: string) {
  // Delete user and their reminders
  await prisma.reminder.deleteMany({ where: { user_id: userId } });
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
}
