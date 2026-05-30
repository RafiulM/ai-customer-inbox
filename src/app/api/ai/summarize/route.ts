import { NextResponse } from "next/server";
import {
  AI_MODEL,
  openai,
  parseJsonResponse,
  transcript,
  type AiMessage,
} from "@/lib/openai";

export const runtime = "nodejs";

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
      { error: "Tidak ada pesan untuk diringkas." },
      { status: 400 },
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.3,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "Anda asisten AI untuk agen Customer Service. Tugas Anda meringkas " +
            "percakapan pelanggan agar agen cepat memahami konteks. Balas HANYA " +
            "dengan JSON valid, tanpa teks lain.",
        },
        {
          role: "user",
          content:
            "Ringkas percakapan berikut menjadi TEPAT 3 poin utama dalam Bahasa " +
            "Indonesia. Tiap poin singkat, padat, fokus pada: masalah inti, " +
            "detail penting (nominal/nomor order/lampiran), dan permintaan terakhir " +
            'pelanggan.\n\nFormat balasan: {"summary":["poin 1","poin 2","poin 3"]}' +
            `\n\nPERCAKAPAN:\n${transcript(messages)}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = parseJsonResponse<{ summary: string[] }>(raw);
    if (!Array.isArray(parsed.summary) || parsed.summary.length === 0) {
      throw new Error("Format ringkasan tidak terduga.");
    }
    return NextResponse.json({ summary: parsed.summary.slice(0, 3) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Model AI gagal merespons." },
      { status: 502 },
    );
  }
}
