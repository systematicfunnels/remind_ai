import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { db } from './db';

/**
 * Validates the API Secret from the request headers
 * Used to protect atomic orchestration endpoints for n8n
 */
export function isValidApiRequest(req: NextRequest): boolean {
  const secret = req.headers.get('x-api-secret');
  const expectedSecret = process.env.API_SECRET;

  if (!expectedSecret) {
    console.error('API_SECRET is not defined in environment variables');
    return false;
  }

  return secret === expectedSecret;
}

/**
 * Gets the currently logged in user from the session cookie
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('user_session');
  
  if (!session) return null;
  
  try {
    const decoded = Buffer.from(session.value, 'base64').toString('ascii');
    const { userId, secret } = JSON.parse(decoded);
    
    const expectedSecret = process.env.USER_SESSION_SECRET || 'remindai-user-secret';
    if (secret !== expectedSecret) return null;
    
    return await db.getUserById(userId);
  } catch {
    return null;
  }
}
