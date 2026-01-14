import { parseReminderIntent as parseWithOpenAI } from './openaiService';
import { processMessageWithAI as parseWithGemini } from './geminiService';
import { parseWithOpenRouter } from './openRouterService';

export type Intent = 'CREATE' | 'LIST' | 'DONE' | 'HELP' | 'TIMEZONE' | 'BILLING' | 'ERASE' | 'UNKNOWN';

export interface UnifiedAIResponse {
  intent: Intent;
  task?: string;
  time?: string; // ISO string for CREATE
  query?: string; // For searching specific tasks to complete
  timezone?: string; // For TIMEZONE intent
}

/**
 * Helper to wrap promises with a timeout
 */
const withTimeout = <T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), ms))
  ]);
};

/**
 * Unified AI Service that handles intent extraction with multiple fallbacks:
 * 1. OpenAI (GPT-4o-mini)
 * 2. Gemini (1.5 Flash)
 * 3. Local Heuristic Parser
 */
export const unifiedParseIntent = async (message: string, userTimezone: string = 'UTC'): Promise<UnifiedAIResponse> => {
  const lowerMsg = message.toLowerCase().trim();

  // Quick Command Heuristics (Save API calls for simple commands)
  if (lowerMsg === 'list' || lowerMsg === '/list') {
    return { intent: 'LIST' };
  }
  if (lowerMsg === 'done' || lowerMsg === '/done') {
    return { intent: 'DONE' };
  }
  if (lowerMsg === 'help' || lowerMsg === '/help' || lowerMsg === 'start' || lowerMsg === '/start') {
    return { intent: 'HELP' };
  }
  if (lowerMsg === 'status' || lowerMsg === 'billing' || lowerMsg === '/status') {
    return { intent: 'BILLING' };
  }
  if (lowerMsg === 'erase' || lowerMsg === 'delete my data' || lowerMsg === '/erase') {
    return { intent: 'ERASE' };
  }

  // 1. Try OpenAI (4s timeout)
  try {
    const openAIResult = await withTimeout(parseWithOpenAI(message, userTimezone), 4000, null);
    if (openAIResult && openAIResult.intent !== 'UNKNOWN') {
      if (openAIResult.intent === 'CREATE' && openAIResult.task && openAIResult.time) {
        return {
          intent: 'CREATE',
          task: openAIResult.task,
          time: openAIResult.time
        };
      }
      if (openAIResult.intent === 'TIMEZONE' && openAIResult.timezone) {
        return { intent: 'TIMEZONE', timezone: openAIResult.timezone };
      }
      if (['LIST', 'DONE', 'HELP', 'BILLING', 'ERASE'].includes(openAIResult.intent)) {
        return { intent: openAIResult.intent as Intent };
      }
    }
  } catch (error) {
    console.warn("AI Pipeline: OpenAI failed or timed out, falling back to Gemini");
  }

  // 2. Try Gemini (4s timeout)
  try {
    const geminiResult = await withTimeout(parseWithGemini(message, userTimezone), 4000, { intent: 'UNKNOWN' });
    // Only return if it's a high-confidence intent and NOT from the internal heuristic 
    // (Gemini's internal fallback might return 'CREATE' for 'remind me...')
    // To truly test the fallback, we should see if we can distinguish AI from heuristic.
    // For now, let's assume if it's UNKNOWN, we continue to OpenRouter.
    if (geminiResult && geminiResult.intent !== 'UNKNOWN') {
      if (geminiResult.intent === 'CREATE' && geminiResult.task && geminiResult.time) {
        return {
          intent: 'CREATE',
          task: geminiResult.task,
          time: geminiResult.time
        };
      }
      if (geminiResult.intent === 'LIST') return { intent: 'LIST' };
      if (geminiResult.intent === 'COMPLETE') return { intent: 'DONE' };
      if (geminiResult.intent === 'TIMEZONE') return { intent: 'TIMEZONE', timezone: geminiResult.timezone };
      if (geminiResult.intent === 'BILLING') return { intent: 'BILLING' };
      if (geminiResult.intent === 'ERASE') return { intent: 'ERASE' };
      if (geminiResult.intent === 'HELP') return { intent: 'HELP' };
    }
  } catch (error) {
    console.warn("AI Pipeline: Gemini failed or timed out, falling back to OpenRouter");
  }

  // 3. Try OpenRouter (Final LLM Fallback - 5s timeout)
  try {
    const orResult = await withTimeout(parseWithOpenRouter(message, userTimezone), 5000, null);
    if (orResult && orResult.intent !== 'UNKNOWN') {
      if (orResult.intent === 'CREATE' && orResult.task && orResult.time) {
        return {
          intent: 'CREATE',
          task: orResult.task,
          time: orResult.time
        };
      }
      if (orResult.intent === 'TIMEZONE') return { intent: 'TIMEZONE', timezone: orResult.timezone };
      if (['LIST', 'DONE', 'HELP', 'BILLING', 'ERASE'].includes(orResult.intent)) {
        return { intent: orResult.intent as Intent };
      }
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

  if (lower.includes('timezone') || lower.includes('time zone') || lower.includes('i am in')) {
    return { intent: 'TIMEZONE' };
  }

  if (lower.includes('billing') || lower.includes('status') || lower.includes('subscription')) {
    return { intent: 'BILLING' };
  }

  if (lower.includes('erase') || lower.includes('delete my data')) {
    return { intent: 'ERASE' };
  }

  if (lower.includes('remind') || lower.includes('in ') || lower.includes('at ') || lower.includes('tomorrow')) {
    let task = message.replace(/remind me to |remind me /gi, '').trim();
    
    // Improved Heuristic Time Parsing with Timezone awareness
    const now = new Date();
    // Get current time in user's timezone
    const userNowStr = now.toLocaleString('en-US', { timeZone: userTimezone });
    const userNow = new Date(userNowStr);
    
    let scheduledDate = new Date(now); // Default to now (UTC)

    // 1. Handle "tomorrow"
    if (lower.includes('tomorrow')) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
      task = task.replace(/tomorrow/gi, '').trim();
    }

    // 2. Handle "in X min/hour"
    const minuteMatch = lower.match(/in (\d+)\s*min/);
    const hourMatch = lower.match(/in (\d+)\s*hour/);
    
    if (minuteMatch) {
      const mins = parseInt(minuteMatch[1]);
      scheduledDate = new Date(now.getTime() + mins * 60000);
      task = task.replace(/in \d+\s*min(utes)?/gi, '').trim();
    } else if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      scheduledDate = new Date(now.getTime() + hours * 3600000);
      task = task.replace(/in \d+\s*hour(s)?/gi, '').trim();
    }

    // 3. Handle "at X am/pm" (Very basic heuristic)
    const timeMatch = lower.match(/at (\d+)\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const ampm = timeMatch[2].toLowerCase();
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      // This is tricky: "at 9pm" depends on the user's timezone.
      // We need to set the hours in the user's local time, then convert back to UTC.
      
      // Create a date object representing the target time in the user's timezone
      const targetInUserTZ = new Date(userNow);
      targetInUserTZ.setHours(hours, 0, 0, 0);
      
      // If the time has already passed today, assume tomorrow (unless we already handled "tomorrow")
      if (targetInUserTZ < userNow && !lower.includes('tomorrow')) {
        targetInUserTZ.setDate(targetInUserTZ.getDate() + 1);
      }
      
      // Convert back to UTC: 
      // The difference between userNow and now is the timezone offset.
      const offset = now.getTime() - userNow.getTime();
      scheduledDate = new Date(targetInUserTZ.getTime() + offset);
      
      task = task.replace(/at \d+\s*(am|pm)/gi, '').trim();
    }

    return {
      intent: 'CREATE',
      task: task || "Reminder",
      time: scheduledDate.toISOString()
    };
  }

  return { intent: 'UNKNOWN' };
};
