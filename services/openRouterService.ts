export interface OpenRouterParsedResponse {
  intent: 'CREATE' | 'LIST' | 'DONE' | 'HELP' | 'TIMEZONE' | 'BILLING' | 'ERASE' | 'UNKNOWN';
  task?: string;
  time?: string;
  timezone?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  query?: string;
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
            content: `You are RemindAI Controller, a high-precision Intent Extraction AI. 
            Your goal is 100% accuracy in extracting user intent, tasks, and timing.

            CORE RULES:
            1. Multi-lingual Support: Understand English, Hindi, and Hinglish.
            2. Task Translation: Always translate the "task" field to English.
            3. Time Precision:
               - Current UTC: ${now.toISOString()}
               - User Timezone: ${userTimezone}
               - User Local Time: ${userLocalTime}
               - Use User Local Time as reference for relative terms.
               - Return "time" as UTC ISO8601 string.
            4. Recurrence: Detect "none", "daily", "weekly", "monthly".

            INTENTS:
            - CREATE: Requires "task" and "time".
            - LIST: Show pending tasks.
            - DONE: Complete a task. Use "query" for search.
            - TIMEZONE: Update location.
            - BILLING: Payment questions.
            - ERASE: Delete data.
            - HELP: Instructions.
            - UNKNOWN: Fallback.

            Return ONLY valid JSON:
            {
              "intent": "CREATE" | "LIST" | "DONE" | "HELP" | "TIMEZONE" | "BILLING" | "ERASE" | "UNKNOWN",
              "task": "Clean English description",
              "time": "ISO8601_UTC_STRING",
              "recurrence": "none" | "daily" | "weekly" | "monthly",
              "query": "search query",
              "timezone": "IANA_Timezone_String"
            }`
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
    
    // Strict Validation for 100% Accuracy
    const validated: OpenRouterParsedResponse = {
      intent: (parsed.intent || 'UNKNOWN') as OpenRouterParsedResponse['intent'],
      task: parsed.task,
      time: parsed.time,
      timezone: parsed.timezone,
      recurrence: parsed.recurrence || 'none',
      query: parsed.query
    };

    if (validated.intent === 'CREATE') {
      if (!validated.task || !validated.time || isNaN(Date.parse(validated.time))) {
        console.warn("OpenRouter: CREATE intent missing task or time. Returning UNKNOWN.");
        return { intent: 'UNKNOWN' };
      }
    }

    if (validated.intent === 'DONE' && !validated.query) {
      validated.query = message.replace(/done|complete|finish|mark/gi, '').trim();
    }

    return validated;
  } catch (error) {
    console.error("OpenRouter Parsing Error:", error);
    return null;
  }
};
