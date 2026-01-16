'use server';

import { db } from './db';
import { revalidatePath } from 'next/cache';

export async function getSetting(key: string, defaultValue: string = '') {
  return await db.getConfig(key, defaultValue);
}

export async function updateSetting(key: string, value: string) {
  const result = await db.setConfig(key, value);
  revalidatePath('/admin/settings');
  return !!result;
}

export async function getAllSettings() {
  const settings = [
    { key: 'inbound_processing', default: 'true' },
    { key: 'voice_recognition_model', default: 'whisper-1' },
    { key: 'error_reporting', default: 'false' },
  ];

  const results: Record<string, string> = {};
  for (const s of settings) {
    results[s.key] = await db.getConfig(s.key, s.default);
  }
  return results;
}
