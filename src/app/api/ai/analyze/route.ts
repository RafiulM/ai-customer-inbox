import { NextResponse } from "next/server";
import {
  AI_MODEL,
  openai,
  parseJsonResponse,
  transcript,
  type AiMessage,
} from "@/lib/openai";

export const runtime = "nodejs";

interface AnalyzeResult {
  sentiment: "marah" | "netral" | "puas";
  tags: string[];
}

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY belum dikonfigurasi di server." },
      { status: 500 },
    );
  }

  let messages: AiMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return NextResponse.json({ error: "Body permintaan tidak valid." }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada pesan untuk dianalisis." },
      { status: 400 },
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "Anda mesin analisis sentimen untuk tiket Customer Service. Balas " +
            "HANYA dengan JSON valid, tanpa teks lain.",
        },
        {
          role: "user",
          content:
            "Analisis percakapan pelanggan berikut. Tentukan:\n" +
            '1. "sentiment": salah satu dari "marah", "netral", atau "puas".\n' +
            '2. "tags": 2-4 label kategori singkat dalam Bahasa Indonesia ' +
            '(contoh: "Pengiriman", "Refund", "Garansi", "Darurat", "Stok"). ' +
            'Jika sentimen "marah", sertakan tag "Darurat".\n\n' +
            'Format balasan: {"sentiment":"...","tags":["...","..."]}' +
            `\n\nPERCAKAPAN:\n${transcript(messages)}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = parseJsonResponse<AnalyzeResult>(raw);
    const sentiment = (["marah", "netral", "puas"] as const).includes(parsed.sentiment)
      ? parsed.sentiment
      : "netral";
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t) => typeof t === "string").slice(0, 4)
      : [];
    return NextResponse.json({ sentiment, tags });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Model AI gagal merespons." },
      { status: 502 },
    );
  }
}
