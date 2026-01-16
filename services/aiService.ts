import { parseReminderIntent as parseWithOpenAI } from './openaiService';
import { processMessageWithAI as parseWithGemini } from './geminiService';
import { parseWithOpenRouter } from './openRouterService';
import { logger } from '@/lib/logger';

export type Intent = 'CREATE' | 'LIST' | 'DONE' | 'HELP' | 'TIMEZONE' | 'BILLING' | 'ERASE' | 'UNKNOWN';

export type RecurrenceRule = 'none' | 'daily' | 'weekly' | 'monthly';

export interface UnifiedAIResponse {
  intent: Intent;
  task?: string;
  time?: string; // ISO string for CREATE
  query?: string; // For searching specific tasks to complete
  timezone?: string; // For TIMEZONE intent
  recurrence?: RecurrenceRule;
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
export const unifiedParseIntent = async (message: string, userTimezone: string = 'Asia/Kolkata'): Promise<UnifiedAIResponse> => {
  const lowerMsg = message.toLowerCase().trim();

  // Quick Command Heuristics (Save API calls for simple commands)
  const isList = ['list', '/list', 'lista', 'ver', 'soochi', 'dikhao'].includes(lowerMsg);
  const isDone = ['done', '/done', 'listo', 'hecho', 'ho gaya', 'khatam'].includes(lowerMsg);
  const isHelp = ['help', '/help', 'start', '/start', 'ayuda', 'madad'].includes(lowerMsg);
  const isBilling = ['status', 'billing', '/status', 'pago'].includes(lowerMsg);
  const isErase = ['erase', 'delete my data', '/erase', 'borrar'].includes(lowerMsg);

  if (isList) return { intent: 'LIST' };
  if (isDone) return { intent: 'DONE' };
  if (isHelp) return { intent: 'HELP' };
  if (isBilling) return { intent: 'BILLING' };
  if (isErase) return { intent: 'ERASE' };

  // 1. Try OpenAI (4s timeout)
  try {
    const openAIResult = await withTimeout(parseWithOpenAI(message, userTimezone), 4000, null);
    if (openAIResult && openAIResult.intent !== 'UNKNOWN') {
      logger.info(`AI Pipeline: OpenAI Success [${openAIResult.intent}]`);
      return {
        intent: openAIResult.intent as Intent,
        task: openAIResult.task,
        time: openAIResult.time,
        query: openAIResult.query,
        timezone: openAIResult.timezone,
        recurrence: openAIResult.recurrence as RecurrenceRule
      };
    }
  } catch (error) {
    logger.warn("AI Pipeline: OpenAI failed or timed out, falling back to Gemini");
  }

  // 2. Try Gemini (4s timeout)
  try {
    const geminiResult = await withTimeout(parseWithGemini(message, userTimezone), 4000, { intent: 'UNKNOWN' });
    if (geminiResult && geminiResult.intent !== 'UNKNOWN') {
      logger.info(`AI Pipeline: Gemini Success [${geminiResult.intent}]`);
      return {
        intent: geminiResult.intent as Intent,
        task: geminiResult.task,
        time: geminiResult.time,
        query: geminiResult.query,
        timezone: geminiResult.timezone,
        recurrence: geminiResult.recurrence as RecurrenceRule
      };
    }
  } catch (error) {
    logger.warn("AI Pipeline: Gemini failed or timed out, falling back to OpenRouter");
  }

  // 3. Try OpenRouter (Final LLM Fallback - 5s timeout)
  try {
    const orResult = await withTimeout(parseWithOpenRouter(message, userTimezone), 5000, null);
    if (orResult && orResult.intent !== 'UNKNOWN') {
      logger.info(`AI Pipeline: OpenRouter Success [${orResult.intent}]`);
      return {
        intent: orResult.intent as Intent,
        task: orResult.task,
        time: orResult.time,
        query: orResult.query,
        timezone: orResult.timezone,
        recurrence: orResult.recurrence as RecurrenceRule
      };
    }
  } catch (error) {
    logger.error("AI Pipeline: OpenRouter failed", { error });
  }

  // 4. Final Local Heuristic Fallback (Last Resort)
  logger.info("AI Pipeline: All LLMs failed, using local heuristics");
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

    // 2. Handle "in X min/hour/day"
    const minuteMatch = lower.match(/in (\d+)\s*min/);
    const hourMatch = lower.match(/in (\d+)\s*hour/);
    const dayMatch = lower.match(/in (\d+)\s*day/);
    
    if (minuteMatch) {
      const mins = parseInt(minuteMatch[1]);
      scheduledDate = new Date(now.getTime() + mins * 60000);
      task = task.replace(/in \d+\s*min(utes)?/gi, '').trim();
    } else if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      scheduledDate = new Date(now.getTime() + hours * 3600000);
      task = task.replace(/in \d+\s*hour(s)?/gi, '').trim();
    } else if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      scheduledDate = new Date(now.getTime() + days * 86400000);
      task = task.replace(/in \d+\s*day(s)?/gi, '').trim();
    }

    // 3. Handle "at X am/pm" (Supports HH:mm format)
    const timeMatch = lower.match(/at (\d+)(?::(\d+))?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3].toLowerCase();
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      const targetInUserTZ = new Date(userNow);
      targetInUserTZ.setHours(hours, minutes, 0, 0);
      
      if (targetInUserTZ < userNow && !lower.includes('tomorrow')) {
        targetInUserTZ.setDate(targetInUserTZ.getDate() + 1);
      }
      
      const offset = now.getTime() - userNow.getTime();
      scheduledDate = new Date(targetInUserTZ.getTime() + offset);
      
      task = task.replace(/at \d+\s*(am|pm)/gi, '').trim();
    }

    // 4. Handle Recurrence heuristics
    let recurrence: RecurrenceRule = 'none';
    if (lower.includes('every day') || lower.includes('daily')) {
      recurrence = 'daily';
      task = task.replace(/every day|daily/gi, '').trim();
    } else if (lower.includes('every week') || lower.includes('weekly')) {
      recurrence = 'weekly';
      task = task.replace(/every week|weekly/gi, '').trim();
    } else if (lower.includes('every month') || lower.includes('monthly')) {
      recurrence = 'monthly';
      task = task.replace(/every month|monthly/gi, '').trim();
    }

    return {
      intent: 'CREATE',
      task: task || "Reminder",
      time: scheduledDate.toISOString(),
      recurrence
    };
  }

  return { intent: 'UNKNOWN' };
};
