import { parseReminderIntent as parseWithOpenAI } from './openaiService';
import { processMessageWithAI as parseWithGemini } from './geminiService';

export type Intent = 'CREATE' | 'LIST' | 'DONE' | 'UNKNOWN';

export interface UnifiedAIResponse {
  intent: Intent;
  task?: string;
  time?: string; // ISO string for CREATE
  query?: string; // For searching specific tasks to complete
}

/**
 * Unified AI Service that handles intent extraction with multiple fallbacks:
 * 1. OpenAI (GPT-4o-mini)
 * 2. Gemini (1.5 Flash)
 * 3. Local Heuristic Parser
 */
export const unifiedParseIntent = async (message: string): Promise<UnifiedAIResponse> => {
  const lowerMsg = message.toLowerCase().trim();

  // Quick Command Heuristics (Save API calls for simple commands)
  if (lowerMsg === 'list' || lowerMsg === '/list') {
    return { intent: 'LIST' };
  }
  if (lowerMsg === 'done' || lowerMsg === '/done') {
    return { intent: 'DONE' };
  }

  // 1. Try OpenAI
  try {
    const openAIResult = await parseWithOpenAI(message);
    if (openAIResult && openAIResult.task && openAIResult.time) {
      return {
        intent: 'CREATE',
        task: openAIResult.task,
        time: openAIResult.time
      };
    }
  } catch (error) {
    console.error("AI Pipeline: OpenAI failed", error);
  }

  // 2. Try Gemini (which also has its own heuristic fallback)
  try {
    const geminiResult = await parseWithGemini(message);
    if (geminiResult.intent === 'CREATE' && geminiResult.task) {
      // Convert delayMinutes to an ISO time string if needed
      const time = geminiResult.delayMinutes 
        ? new Date(Date.now() + geminiResult.delayMinutes * 60000).toISOString()
        : new Date().toISOString();
      
      return {
        intent: 'CREATE',
        task: geminiResult.task,
        time
      };
    }
    
    // Map Gemini intents to Unified intents
    if (geminiResult.intent === 'LIST') return { intent: 'LIST' };
    if (geminiResult.intent === 'COMPLETE') return { intent: 'DONE' };
  } catch (error) {
    console.error("AI Pipeline: Gemini failed", error);
  }

  return { intent: 'UNKNOWN' };
};
