import { NextRequest, NextResponse } from 'next/server';
import { connection } from './queue';

const WINDOW_SIZE = 60; // 60 seconds (Redis uses seconds for EX)
const MAX_REQUESTS = 60; // 60 requests per minute

export async function rateLimit(req: NextRequest) {
  // If no Redis connection, fall back to no rate limiting (or could implement memory fallback)
  if (!connection) return null;

  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const key = `ratelimit:${ip}`;
  
  try {
    const current = await connection.incr(key);
    
    if (current === 1) {
      await connection.expire(key, WINDOW_SIZE);
    }
    
    if (current > MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
  } catch (error) {
    // In case of Redis error, allow the request but log it
    console.error('Rate limit Redis error:', error);
  }
  
  return null;
}
