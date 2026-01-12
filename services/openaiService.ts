import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedReminder {
  task: string;
  time: string; // ISO 8601 string or descriptive time
}

export const parseReminderIntent = async (message: string): Promise<ParsedReminder | null> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a reminder extraction AI. Extract the task and the scheduled time from the user's message. 
          Return ONLY a JSON object in this format: {"task": "string", "time": "ISO8601 string"}.
          If the time is relative (e.g., "tomorrow 7PM"), calculate it relative to the current time: ${new Date().toISOString()}.
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
