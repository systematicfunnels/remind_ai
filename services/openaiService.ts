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

export interface ParsedReminder {
  task: string;
  time: string; // ISO 8601 string or descriptive time
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

export const parseReminderIntent = async (message: string): Promise<ParsedReminder | null> => {
  try {
    const openai = getOpenAI();
    if (!openai) return null;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a reminder extraction AI. Extract the task and the scheduled time from the user's message. 
          Return ONLY a JSON object in this format: {"task": "string", "time": "ISO8601 string"}.
          Current UTC time: ${new Date().toISOString()}.
          If the user specifies a relative time (e.g., "tomorrow 7PM"), calculate it relative to the provided UTC time.
          If you cannot extract both, return null.`
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

    const parsed = JSON.parse(content);
    if (parsed.task && parsed.time) {
      return parsed as ParsedReminder;
    }
    return null;
  } catch (error) {
    console.error("OpenAI Parsing Error:", error);
    return null;
  }
};
