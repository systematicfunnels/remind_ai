import { GoogleGenAI } from "@google/genai";

export type RecurrenceRule = 'none' | 'daily' | 'weekly' | 'monthly';

const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 5) return null;
  return new GoogleGenAI({ apiKey });
};

export type Intent = 'CREATE' | 'LIST' | 'COMPLETE' | 'HELP' | 'TIMEZONE' | 'BILLING' | 'ERASE' | 'UNKNOWN';

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
    return { intent: 'COMPLETE', query: query || 'task' };
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
    // Normalize mimeType for Gemini
    let normalizedMimeType = mimeType.split(';')[0].trim();
    if (normalizedMimeType === 'audio/mpeg' || normalizedMimeType === 'audio/mp3') {
      normalizedMimeType = 'audio/mpeg';
    } else if (normalizedMimeType.includes('ogg')) {
      normalizedMimeType = 'audio/ogg';
    }

    console.log(`Gemini Voice: Transcribing with mimeType: ${normalizedMimeType}`);

    const result = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: audioBuffer.toString('base64'),
                mimeType: normalizedMimeType
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
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `You are RemindAI Controller. Parse user input into strict JSON.
        The input can be in English, Hindi, or Hinglish. 
        Always translate the "task" field to English.
        
        Reference User Local Time: ${currentTimeStr} (${userTimezone}).
        
        Intents:
        - CREATE: Set reminder. Fields: task (string), time (ISO8601 string), recurrence (none|daily|weekly|monthly).
        - LIST: Show reminders.
        - COMPLETE: Mark task done. Fields: query (string).
        - TIMEZONE: Update location. Fields: timezone (e.g., "Europe/London").
        - BILLING: Check status/subscription.
        - ERASE: Delete all personal data.
        - HELP: Instructions.
        - UNKNOWN: Fallback.

        Always return time in UTC ISO8601 format. If user says "tomorrow", use the provided Reference User Local Time to calculate the correct UTC time.`,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty AI response");
    }
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { intent: 'UNKNOWN' };
  }
};
