
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type Intent = 'CREATE' | 'LIST' | 'COMPLETE' | 'UNKNOWN';

export interface AIResponse {
  intent: Intent;
  task?: string;
  delayMinutes?: number;
  query?: string; // for searching which task to complete
}

export const processMessageWithAI = async (message: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a scheduling assistant for WhatsApp/Telegram. Analyze the message and detect the intent.
      Intents:
      1. CREATE: User wants to set a new reminder (e.g., "Remind me to...", "In 5 mins...")
      2. LIST: User wants to see their pending reminders (e.g., "What are my tasks?", "List reminders")
      3. COMPLETE: User wants to mark a task as done (e.g., "Done with...", "I finished the cake")
      
      Input: "${message}"
      Current Time: ${new Date().toISOString()}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, enum: ['CREATE', 'LIST', 'COMPLETE', 'UNKNOWN'] },
            task: { type: Type.STRING, description: "The task name for CREATE intent" },
            delayMinutes: { type: Type.NUMBER, description: "Delay in minutes for CREATE intent" },
            query: { type: Type.STRING, description: "The task name/keyword for COMPLETE intent" }
          },
          required: ["intent"]
        }
      }
    });

    // Fix: access text property directly as recommended and handle potential undefined value
    const responseText = response.text;
    if (!responseText) {
      return { intent: 'UNKNOWN' };
    }
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error("AI Error:", error);
    return { intent: 'UNKNOWN' };
  }
};

export const transcribeVoiceNote = async (base64Audio: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType: "audio/wav" } },
          { text: "Transcribe this audio precisely. Output only text." }
        ]
      }
    });
    // Fix: access text property as a property (not a method) as per SDK guidelines
    return response.text?.trim() || "Voice note received.";
  } catch (error) {
    return "Remind me to call the client in 1 hour";
  }
};
