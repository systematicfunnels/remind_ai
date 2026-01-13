export interface OpenRouterParsedResponse {
  intent: 'CREATE' | 'LIST' | 'DONE' | 'UNKNOWN';
  task?: string;
  time?: string;
}

export const parseWithOpenRouter = async (message: string): Promise<OpenRouterParsedResponse | null> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is missing. Skipping OpenRouter fallback.");
    return null;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://remindai.com", // Optional, for OpenRouter rankings
        "X-Title": "RemindAI"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free", // Using Mistral 7B as a free fallback
        messages: [
          {
            role: "system",
            content: `You are a reminder extraction AI. Extract the task and the scheduled time from the user's message.
            Return ONLY a JSON object in this format: {"intent": "CREATE|LIST|DONE|UNKNOWN", "task": "string", "time": "ISO8601 string"}.
            Current UTC time: ${new Date().toISOString()}.
            If the user specifies a relative time, calculate it relative to the provided UTC time.
            If the user wants to list reminders, intent is LIST. If they are done, intent is DONE.`
          },
          {
            role: "user",
            content: message
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      intent: parsed.intent || 'UNKNOWN',
      task: parsed.task,
      time: parsed.time
    };
  } catch (error) {
    console.error("OpenRouter Parsing Error:", error);
    return null;
  }
};
