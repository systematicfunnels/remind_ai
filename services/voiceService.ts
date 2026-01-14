import { transcribeAudio as transcribeWithOpenAI } from './openaiService';
import { transcribeAudioWithGemini } from './geminiService';

/**
 * Unified voice transcription service with fallback:
 * 1. OpenAI Whisper (Best quality)
 * 2. Google Gemini 1.5 Flash (Fallback)
 */
export const unifiedTranscribe = async (audioBuffer: Buffer, mimeType: string = 'audio/ogg'): Promise<string | null> => {
  // 1. Try OpenAI Whisper
  try {
    const whisperText = await transcribeWithOpenAI(audioBuffer);
    if (whisperText) {
      console.log("Voice: Transcribed using OpenAI Whisper");
      return whisperText;
    }
  } catch (error) {
    console.warn("Voice: OpenAI Whisper failed, falling back to Gemini");
  }

  // 2. Try Gemini 1.5 Flash
  try {
    const geminiText = await transcribeAudioWithGemini(audioBuffer, mimeType);
    if (geminiText) {
      console.log("Voice: Transcribed using Google Gemini");
      return geminiText;
    }
  } catch (error) {
    console.error("Voice: Gemini transcription failed", error);
  }

  return null;
};
