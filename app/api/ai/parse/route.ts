import { NextRequest, NextResponse } from 'next/server';
import { unifiedParseIntent } from '@/services/aiService';
import { isValidApiRequest } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Atomic AI Parsing Endpoint for n8n/External Orchestration
 * Input: { message: string, timezone: string }
 * Output: UnifiedAIResponse JSON
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    if (!isValidApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message } = body;
    let { timezone } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Handle unevaluated n8n expressions
    if (timezone && (typeof timezone !== 'string' || timezone.includes('{{'))) {
      timezone = 'UTC';
    }

    const result = await unifiedParseIntent(message, timezone || 'UTC');
    
    // Safety check for n8n: Ensure we don't return unevaluated expressions in task/time
    if (result.task && result.task.includes('{{')) result.task = 'Reminder';
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error('API Parse Error', { error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
