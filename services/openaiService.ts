import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

const getOpenAI = () => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OPENAI_API_KEY is missing. AI features will be disabled.");
      return null;
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

export interface ParsedIntent {
  intent: 'CREATE' | 'LIST' | 'DONE' | 'HELP' | 'TIMEZONE' | 'BILLING' | 'ERASE' | 'UNKNOWN';
  task?: string;
  time?: string; // ISO 8601 string
  timezone?: string; // For TIMEZONE intent
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  query?: string; // For searching specific tasks to complete
}

export const transcribeAudio = async (audioBuffer: Buffer): Promise<string | null> => {
  try {
    const openai = getOpenAI();
    if (!openai) return null;

    // OpenAI Whisper expects a file-like object
    const transcription = await openai.audio.transcriptions.create({
      file: await OpenAI.toFile(audioBuffer, 'voice.ogg'),
      model: "whisper-1",
      prompt: "This is a reminder app. The audio might be in English, Hindi, or a mix of both (Hinglish). Please transcribe accurately.",
    });

    return transcription.text;
  } catch (error) {
    console.error("OpenAI Transcription Error:", error);
    return null;
  }
};

export const parseReminderIntent = async (message: string, userTimezone: string = 'UTC'): Promise<ParsedIntent | null> => {
  try {
    const openai = getOpenAI();
    if (!openai) return null;

    const now = new Date();
    const userLocalTime = now.toLocaleString('en-US', { timeZone: userTimezone });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert Intent Extraction AI for RemindAI, a high-precision reminder service. 
          Your goal is 100% accuracy in extracting user intent, tasks, and timing.

          CORE RULES:
          1. Multi-lingual: Support English, Hindi, and Hinglish. 
          2. Task Translation: Always translate the "task" field to English for backend consistency.
          3. Time Precision: 
             - Current UTC: ${now.toISOString()}
             - User Timezone: ${userTimezone}
             - User Local Time: ${userLocalTime}
             - Use the User Local Time as the reference for relative terms like "tomorrow", "tonight", "next Monday", "in 2 hours".
             - Return "time" as a full ISO 8601 string in UTC.
          4. Recurrence: Detect daily, weekly, or monthly patterns. Default to "none".
          
          INTENTS:
          - CREATE: User wants a reminder. Requires "task" and "time".
          - LIST: User wants to see pending tasks.
          - DONE: User wants to complete a task. Use "query" for the task name to search.
          - TIMEZONE: User mentions location/timezone (e.g., "I'm in Delhi", "Set my time to PST").
          - BILLING: Questions about payment, subscription, or usage.
          - ERASE: Request to delete all data.
          - HELP: Request for instructions.
          - UNKNOWN: Fallback if message is gibberish or unrelated.

          OUTPUT FORMAT:
          Return ONLY a valid JSON object:
          {
            "intent": "CREATE" | "LIST" | "DONE" | "HELP" | "TIMEZONE" | "BILLING" | "ERASE" | "UNKNOWN",
            "task": "Clean English description of the task",
            "time": "ISO8601_UTC_STRING",
            "recurrence": "none" | "daily" | "weekly" | "monthly",
            "query": "search query for completion",
            "timezone": "IANA_Timezone_String"
          }

          EXAMPLES:
          - "remind me to call mom tomorrow at 9pm" -> {"intent": "CREATE", "task": "Call mom", "time": "2024-01-15T15:30:00Z", "recurrence": "none"}
          - "mummy ko dawai dena hai roz subah 8 baje" -> {"intent": "CREATE", "task": "Give medicine to mother", "time": "2024-01-15T02:30:00Z", "recurrence": "daily"}
          - "mark buy milk as done" -> {"intent": "DONE", "query": "buy milk"}
          - "show my tasks" -> {"intent": "LIST"}
          `
        },
        {
          role: "user",
          content: message
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0, // Set to 0 for maximum deterministic accuracy
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as ParsedIntent;
    
    // Validation for 100% accuracy
    if (parsed.intent === 'CREATE') {
      if (!parsed.task || !parsed.time) {
        console.warn("OpenAI: CREATE intent missing task or time. Returning UNKNOWN.");
        return { intent: 'UNKNOWN' };
      }
      // Ensure time is valid
      if (isNaN(Date.parse(parsed.time))) {
        console.warn("OpenAI: Invalid date format. Returning UNKNOWN.");
        return { intent: 'UNKNOWN' };
      }
    }

    if (parsed.intent === 'DONE' && !parsed.query) {
      parsed.query = message.replace(/done|complete|finish|mark/gi, '').trim();
    }

    return parsed;
  } catch (error) {
    console.error("OpenAI Parsing Error:", error);
    return null;
  }
};
