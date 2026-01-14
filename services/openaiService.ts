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
}

export const transcribeAudio = async (audioBuffer: Buffer): Promise<string | null> => {
  try {
    const openai = getOpenAI();
    if (!openai) return null;

    // OpenAI Whisper expects a file-like object
    const transcription = await openai.audio.transcriptions.create({
      file: await OpenAI.toFile(audioBuffer, 'voice.ogg'),
      model: "whisper-1",
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

    const userLocalTime = new Date().toLocaleString('en-US', { timeZone: userTimezone });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a intent extraction AI for RemindAI. 
          Extract the intent and relevant details from the user's message. 
          
          Valid Intents:
          - CREATE: User wants to set a reminder. Extract "task" and "time" (ISO8601).
          - LIST: User wants to see pending reminders.
          - DONE: User wants to complete a reminder.
          - TIMEZONE: User mentions their location or timezone. Extract "timezone" (e.g., "Asia/Kolkata").
          - BILLING: User asks about subscription, status, or usage.
          - ERASE: User wants to delete their data.
          - HELP: User asks for help.
          - UNKNOWN: Intent not clear.

          Return ONLY a JSON object in this format: {"intent": "string", "task": "string", "time": "ISO8601", "timezone": "string"}.
          Current UTC time: ${new Date().toISOString()}.
          User Timezone: ${userTimezone}.
          User Local Time: ${userLocalTime}.
          
          When extracting time for CREATE, always return it as a full ISO8601 string in UTC.
          If the user says "tomorrow", use their User Local Time to determine what "tomorrow" means.
          `
        },
        {
          role: "user",
          content: message
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    return JSON.parse(content) as ParsedIntent;
  } catch (error) {
    console.error("OpenAI Parsing Error:", error);
    return null;
  }
};
