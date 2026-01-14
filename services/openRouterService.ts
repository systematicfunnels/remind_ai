export interface OpenRouterParsedResponse {
  intent: 'CREATE' | 'LIST' | 'DONE' | 'HELP' | 'TIMEZONE' | 'BILLING' | 'ERASE' | 'UNKNOWN';
  task?: string;
  time?: string;
  timezone?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export const parseWithOpenRouter = async (message: string, userTimezone: string = 'UTC'): Promise<OpenRouterParsedResponse | null> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is missing. Skipping OpenRouter fallback.");
    return null;
  }

  try {
    const now = new Date();
    const userLocalTime = now.toLocaleString('en-US', { timeZone: userTimezone });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://remindai.com",
        "X-Title": "RemindAI"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are an expert Intent Extraction AI. Goal: 100% accuracy.
            
            CORE RULES:
            1. Language: English, Hindi, Hinglish. Translate "task" to English.
            2. Time: 
               - UTC Now: ${now.toISOString()}
               - User Local Time: ${userLocalTime} (${userTimezone})
               - Return "time" in UTC ISO8601.
            3. Recurrence: Detect daily, weekly, monthly. Default "none".

            INTENTS:
            - CREATE: {"task": "...", "time": "...", "recurrence": "..."}
            - LIST, DONE, TIMEZONE, BILLING, ERASE, HELP, UNKNOWN.

            Return ONLY JSON.`
          },
          {
            role: "user",
            content: message
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    
    // Validation
    const validated: OpenRouterParsedResponse = {
      intent: parsed.intent || 'UNKNOWN',
      task: parsed.task,
      time: parsed.time,
      timezone: parsed.timezone,
      recurrence: parsed.recurrence || 'none'
    };

    if (validated.intent === 'CREATE') {
      if (!validated.task || !validated.time || isNaN(Date.parse(validated.time))) {
        return { intent: 'UNKNOWN' };
      }
    }

    return validated;
  } catch (error) {
    console.error("OpenRouter Parsing Error:", error);
    return null;
  }
};
