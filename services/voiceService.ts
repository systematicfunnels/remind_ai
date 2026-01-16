import { transcribeAudio as transcribeWithOpenAI } from './openaiService';
import { transcribeAudioWithGemini } from './geminiService';
import { logger } from '@/lib/logger';

/**
 * Unified voice transcription service with fallback:
 * 1. OpenAI Whisper (Best quality)
 * 2. Google Gemini 1.5 Flash (Fallback)
 */
export const unifiedTranscribe = async (audioBuffer: Buffer, mimeType: string = 'audio/ogg'): Promise<string | null> => {
  // Normalize mimeType for providers
  let normalizedMimeType = mimeType.split(';')[0].trim().toLowerCase();
  
  // Map common types
  if (normalizedMimeType === 'audio/mpeg' || normalizedMimeType === 'audio/mp3') {
    normalizedMimeType = 'audio/mpeg';
  } else if (normalizedMimeType.includes('ogg') || normalizedMimeType.includes('opus')) {
    normalizedMimeType = 'audio/ogg';
  } else if (normalizedMimeType === 'audio/wav' || normalizedMimeType === 'audio/x-wav') {
    normalizedMimeType = 'audio/wav';
  } else if (normalizedMimeType.includes('webm')) {
    normalizedMimeType = 'audio/webm';
  }

  // 1. Try OpenAI Whisper
  try {
    const whisperText = await transcribeWithOpenAI(audioBuffer);
    if (whisperText) {
      logger.info("Voice: Transcribed using OpenAI Whisper");
      return whisperText;
    }
  } catch (error) {
    logger.warn("Voice: OpenAI Whisper failed, falling back to Gemini");
  }

  // 2. Try Gemini 1.5 Flash
  try {
    const geminiText = await transcribeAudioWithGemini(audioBuffer, normalizedMimeType);
    if (geminiText) {
      logger.info("Voice: Transcribed using Google Gemini");
      return geminiText;
    }
  } catch (error) {
    logger.error("Voice: Gemini transcription failed", { error });
  }

  return null;
};
