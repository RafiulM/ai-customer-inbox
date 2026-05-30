import type { Message, Sentiment } from "./types";

// Browser-side wrappers around the server AI route handlers. The LLM call and
// the OpenRouter key stay server-side in /api/ai/*.

function toAiMessages(messages: Message[]) {
  return messages.map((m) => ({ senderType: m.senderType, content: m.content }));
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || "Layanan AI gagal merespons.");
  }
  return json as T;
}

export async function aiSummarize(messages: Message[]): Promise<string[]> {
  const { summary } = await postJson<{ summary: string[] }>("/api/ai/summarize", {
    messages: toAiMessages(messages),
  });
  return summary;
}

export async function aiDraft(
  messages: Message[],
  customerName: string,
  subject: string,
): Promise<string> {
  const { draft } = await postJson<{ draft: string }>("/api/ai/draft", {
    messages: toAiMessages(messages),
    customerName,
    subject,
  });
  return draft;
}

export async function aiAnalyze(
  messages: Message[],
): Promise<{ sentiment: Sentiment; tags: string[] }> {
  return postJson<{ sentiment: Sentiment; tags: string[] }>("/api/ai/analyze", {
    messages: toAiMessages(messages),
  });
}
