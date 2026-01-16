import { NextRequest, NextResponse } from 'next/server';
import { unifiedTranscribe } from '@/services/voiceService';
import { isValidApiRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Atomic Voice Transcription Endpoint for n8n/External Orchestration
 * Input: Multipart Form Data with 'file' and 'mimeType'
 * Output: { text: string }
 */
export async function POST(req: NextRequest) {
  try {
    if (!isValidApiRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    const mimeType = formData.get('mimeType') as string || 'audio/ogg';

    if (!file) {
      // Check if it's a media URL instead (common in n8n/Twilio)
      const mediaUrl = formData.get('mediaUrl') as string;
      if (mediaUrl) {
        const auth = formData.get('auth') as string; // Optional Basic Auth for Twilio
        const response = await fetch(mediaUrl, {
          headers: auth ? { 'Authorization': `Basic ${auth}` } : {}
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        const text = await unifiedTranscribe(buffer, mimeType);
        return NextResponse.json({ text });
      }
      return NextResponse.json({ error: 'File or mediaUrl is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await unifiedTranscribe(buffer, mimeType);
    
    return NextResponse.json({ text });
  } catch (error) {
    console.error('API Transcribe Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
