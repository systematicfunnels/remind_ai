import { parseReminderIntent as parseWithOpenAI } from './openaiService';
import { processMessageWithAI as parseWithGemini } from './geminiService';
import { parseWithOpenRouter } from './openRouterService';

export type Intent = 'CREATE' | 'LIST' | 'DONE' | 'HELP' | 'UNKNOWN';

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
  if (lowerMsg === 'help' || lowerMsg === '/help' || lowerMsg === 'start') {
    return { intent: 'HELP' };
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
    console.warn("AI Pipeline: OpenAI failed, falling back to Gemini");
  }

  // 2. Try Gemini
  try {
    const geminiResult = await parseWithGemini(message);
    // Only return if it's a high-confidence intent and NOT from the internal heuristic 
    // (Gemini's internal fallback might return 'CREATE' for 'remind me...')
    // To truly test the fallback, we should see if we can distinguish AI from heuristic.
    // For now, let's assume if it's UNKNOWN, we continue to OpenRouter.
    if (geminiResult && geminiResult.intent !== 'UNKNOWN') {
      if (geminiResult.intent === 'CREATE' && geminiResult.task) {
        const time = geminiResult.delayMinutes 
          ? new Date(Date.now() + geminiResult.delayMinutes * 60000).toISOString()
          : new Date().toISOString();
        
        return {
          intent: 'CREATE',
          task: geminiResult.task,
          time
        };
      }
      if (geminiResult.intent === 'LIST') return { intent: 'LIST' };
      if (geminiResult.intent === 'COMPLETE') return { intent: 'DONE' };
    }
  } catch (error) {
    console.warn("AI Pipeline: Gemini failed, falling back to OpenRouter");
  }

  // 3. Try OpenRouter (Final LLM Fallback)
  try {
    const orResult = await parseWithOpenRouter(message);
    if (orResult && orResult.intent !== 'UNKNOWN') {
      if (orResult.intent === 'CREATE' && orResult.task && orResult.time) {
        return {
          intent: 'CREATE',
          task: orResult.task,
          time: orResult.time
        };
      }
      if (orResult.intent === 'LIST') return { intent: 'LIST' };
      if (orResult.intent === 'DONE') return { intent: 'DONE' };
    }
  } catch (error) {
    console.error("AI Pipeline: OpenRouter failed");
  }

  // 4. Final Local Heuristic Fallback (Last Resort)
  console.log("AI Pipeline: All LLMs failed, using local heuristics");
  const lower = message.toLowerCase();

  if (lower.includes('list') || lower.includes('show') || lower.includes('tasks')) {
    return { intent: 'LIST' };
  }

  if (lower.includes('done') || lower.includes('complete') || lower.includes('finish')) {
    return { intent: 'DONE' };
  }

  if (lower.includes('help') || lower.includes('support') || lower.includes('how')) {
    return { intent: 'HELP' };
  }

  if (lower.includes('remind') || lower.includes('in ') || lower.includes('at ')) {
    return {
      intent: 'CREATE',
      task: message.replace(/remind me to |remind me /gi, '').trim(),
      time: new Date(Date.now() + 10 * 60000).toISOString() // Default to 10 mins
    };
  }

  return { intent: 'UNKNOWN' };
};
