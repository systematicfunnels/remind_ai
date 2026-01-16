import { GoogleGenAI } from "@google/genai";

export type RecurrenceRule = 'none' | 'daily' | 'weekly' | 'monthly';

const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 5) return null;
  return new GoogleGenAI({ apiKey });
};

export type Intent = 'CREATE' | 'LIST' | 'DONE' | 'HELP' | 'TIMEZONE' | 'BILLING' | 'ERASE' | 'UNKNOWN';

export interface AIResponse {
  intent: Intent;
  task?: string;
  time?: string; // ISO 8601 string
  recurrence?: RecurrenceRule;
  query?: string;
  timezone?: string;
}

const fallbackParse = (message: string): AIResponse => {
  const msg = message.toLowerCase().trim();
  
  if (msg.includes('list') || msg.includes('tasks') || msg.includes('show')) {
    return { intent: 'LIST' };
  }

  if (msg.includes('done') || msg.includes('complete') || msg.includes('finish') || msg.includes('mark')) {
    const query = msg.replace(/done|complete|finish|mark|with|the|as/g, '').trim();
    return { intent: 'DONE', query: query || 'task' };
  }

  if (msg.includes('timezone') || msg.includes('time zone') || msg.includes('i am in') || msg.includes('located in')) {
    return { intent: 'TIMEZONE' };
  }

  if (msg.includes('status') || msg.includes('billing') || msg.includes('subscription')) {
    return { intent: 'BILLING' };
  }

  if (msg.includes('erase') || msg.includes('delete all my data')) {
    return { intent: 'ERASE' };
  }

  // Improved Create Heuristics
  const minuteMatch = msg.match(/in (\d+)\s*min/);
  const secondMatch = msg.match(/in (\d+)\s*sec/);
  const hourMatch = msg.match(/in (\d+)\s*hour/);
  
  if (msg.includes('remind') || minuteMatch || secondMatch || hourMatch) {
    let delay = 10;
    if (secondMatch) delay = parseInt(secondMatch[1]) / 60;
    if (minuteMatch) delay = parseInt(minuteMatch[1]);
    if (hourMatch) delay = parseInt(hourMatch[1]) * 60;

    let task = msg.replace(/remind me to |remind me |in \d+ min|in \d+ hour|in \d+ sec|at \d+/g, '').trim();
    task = task.charAt(0).toUpperCase() + task.slice(1);
    
    return {
      intent: 'CREATE',
      task: task || "Smart Reminder",
      time: new Date(Date.now() + Math.max(0.1, delay) * 60000).toISOString(),
      recurrence: msg.includes('every') ? 'daily' : 'none'
    };
  }

  return { intent: 'UNKNOWN' };
};

export const transcribeAudioWithGemini = async (audioBuffer: Buffer, mimeType: string = 'audio/ogg'): Promise<string | null> => {
  const ai = getAI();
  if (!ai) return null;

  try {
    console.log(`Gemini Voice: Transcribing with mimeType: ${mimeType}`);

    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: audioBuffer.toString('base64'),
                mimeType: mimeType
              }
            },
            { text: "Transcribe this audio exactly as heard. The audio might be in English, Hindi, or a mix of both (Hinglish). Return only the transcribed text." }
          ]
        }
      ]
    });

    const transcription = result.text?.trim() || null;
    if (transcription) {
      console.log("Gemini Voice: Successfully transcribed");
    } else {
      console.warn("Gemini Voice: Received empty transcription");
    }
    return transcription;
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    return null;
  }
};

export const processMessageWithAI = async (message: string, userTimezone: string = 'UTC'): Promise<AIResponse> => {
  const ai = getAI();
  const now = new Date();
  const currentTimeStr = now.toLocaleString("en-US", { timeZone: userTimezone });

  if (!ai) {
    console.warn("RemindAI: Running in local heuristic mode.");
    return fallbackParse(message);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `You are RemindAI Controller, a high-precision Intent Extraction AI. 
        Your goal is 100% accuracy in extracting user intent, tasks, and timing.

        CORE RULES:
        1. Multi-lingual Support: Understand English, Hindi, and Hinglish.
        2. Task Translation: Always translate the "task" field to English for backend consistency.
        3. Time Precision:
           - Current UTC: ${now.toISOString()}
           - User Timezone: ${userTimezone}
           - User Local Time: ${currentTimeStr}
           - Use the User Local Time as the reference for relative terms like "tomorrow", "tonight", "next Monday", "in 2 hours".
           - Return "time" as a full ISO 8601 string in UTC.
        4. Recurrence: Detect daily, weekly, or monthly patterns. Default to "none".

        INTENTS:
        - CREATE: User wants a reminder. Requires "task" and "time".
        - LIST: User wants to see pending tasks.
        - DONE: User wants to complete a task. Use "query" for the task name to search.
        - TIMEZONE: User mentions location/timezone (e.g., "I'm in Delhi").
        - BILLING: Questions about payment or subscription.
        - ERASE: Request to delete all data.
        - HELP: Request for instructions.
        - UNKNOWN: Fallback if message is unrelated.

        OUTPUT FORMAT:
        Return ONLY a valid JSON object:
        {
          "intent": "CREATE" | "LIST" | "DONE" | "HELP" | "TIMEZONE" | "BILLING" | "ERASE" | "UNKNOWN",
          "task": "Clean English description",
          "time": "ISO8601_UTC_STRING",
          "recurrence": "none" | "daily" | "weekly" | "monthly",
          "query": "search query for completion",
          "timezone": "IANA_Timezone_String"
        }

        EXAMPLES:
        - "mummy ko dawai dena hai roz subah 8 baje" -> {"intent": "CREATE", "task": "Give medicine to mother", "time": "2024-01-15T02:30:00Z", "recurrence": "daily"}
        - "mark call mom as done" -> {"intent": "DONE", "query": "call mom"}
        - "i am in london" -> {"intent": "TIMEZONE", "timezone": "Europe/London"}`,
        responseMimeType: "application/json",
        temperature: 0,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty AI response");
    }
    const parsed = JSON.parse(text) as AIResponse;

    // Strict Validation for 100% Accuracy
    if (parsed.intent === 'CREATE') {
      if (!parsed.task || !parsed.time) {
        console.warn("Gemini: CREATE intent missing task or time. Returning UNKNOWN.");
        return { intent: 'UNKNOWN' };
      }
      if (isNaN(Date.parse(parsed.time))) {
        console.warn("Gemini: Invalid date format. Returning UNKNOWN.");
        return { intent: 'UNKNOWN' };
      }
    }

    if (parsed.intent === 'DONE' && !parsed.query) {
      parsed.query = message.replace(/done|complete|finish|mark/gi, '').trim();
    }
    
    return parsed;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { intent: 'UNKNOWN' };
  }
};
