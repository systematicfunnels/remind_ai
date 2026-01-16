import { NextRequest, NextResponse } from 'next/server';
import { unifiedParseIntent } from '@/services/aiService';
import { isValidApiRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Atomic AI Parsing Endpoint for n8n/External Orchestration
 * Input: { message: string, timezone: string }
 * Output: UnifiedAIResponse JSON
 */
export async function POST(req: NextRequest) {
  try {
    if (!isValidApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, timezone } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await unifiedParseIntent(message, timezone || 'UTC');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Parse Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
