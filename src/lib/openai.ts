import OpenAI from "openai";

// Server-side only. OPENROUTER_API_KEY must never reach the browser.
export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "X-Title": "AI Customer Support Inbox",
  },
});

// Claude Sonnet 4.6 — fast and capable, well-suited to high-volume CS tasks.
export const AI_MODEL = "anthropic/claude-sonnet-4.6";

export interface AiMessage {
  senderType: "customer" | "agent" | "ai_system";
  content: string;
}

const ROLE_LABEL: Record<AiMessage["senderType"], string> = {
  customer: "Pelanggan",
  agent: "Agen CS",
  ai_system: "Sistem",
};

/** Render a conversation into a plain-text transcript for the model. */
export function transcript(messages: AiMessage[]): string {
  return messages
    .filter((m) => m.senderType !== "ai_system")
    .map((m) => `[${ROLE_LABEL[m.senderType]}]: ${m.content}`)
    .join("\n");
}

/** Extract a JSON object from a model response, tolerating ```json fences. */
export function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
