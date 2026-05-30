import { NextResponse } from "next/server";
import { AI_MODEL, openai, transcript, type AiMessage } from "@/lib/openai";
import { SOP_KNOWLEDGE } from "@/lib/sop";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY belum dikonfigurasi di server." },
      { status: 500 },
    );
  }

  let messages: AiMessage[];
  let customerName: string;
  let subject: string;
  try {
    const body = await req.json();
    messages = body.messages;
    customerName = body.customerName ?? "Pelanggan";
    subject = body.subject ?? "";
  } catch {
    return NextResponse.json({ error: "Body permintaan tidak valid." }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada pesan untuk dibalas." },
      { status: 400 },
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.6,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content:
            "Anda asisten AI yang menyusun draf balasan untuk agen Customer " +
            "Service. Draf HARUS mengikuti SOP perusahaan di bawah ini. Tulis " +
            "dalam Bahasa Indonesia, sopan dan empatik. Untuk pelanggan yang " +
            "marah, akui kekecewaannya lebih dulu. Balas HANYA dengan teks draf " +
            "balasan — tanpa tanda kutip, tanpa penjelasan, tanpa salam penutup " +
            `berlebihan.\n\n${SOP_KNOWLEDGE}`,
        },
        {
          role: "user",
          content:
            `Nama pelanggan: ${customerName}\nTopik tiket: ${subject}\n\n` +
            `PERCAKAPAN SEJAUH INI:\n${transcript(messages)}\n\n` +
            "Susun satu draf balasan agen yang akurat dan sesuai SOP untuk pesan " +
            "terakhir pelanggan.",
        },
      ],
    });

    const draft = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!draft) throw new Error("Model AI tidak menghasilkan draf.");
    return NextResponse.json({ draft });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Model AI gagal merespons." },
      { status: 502 },
    );
  }
}
