"use client";

import { Avatar } from "./Avatar";
import { SentimentBadge, StatusBadge, Tag } from "./badges";
import {
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  RefreshIcon,
  SparkIcon,
  SummaryIcon,
} from "./icons";
import { dateOf, relativeTime } from "@/lib/format";
import type { Conversation, Customer } from "@/lib/types";

export function RightPanel({
  customer,
  conversation,
  history,
  summarizing,
  onSummarize,
  analyzing,
  onAnalyze,
}: {
  customer: Customer;
  conversation: Conversation;
  history: Conversation[];
  summarizing: boolean;
  onSummarize: () => void;
  analyzing: boolean;
  onAnalyze: () => void;
}) {
  return (
    <div className="scroll-thin flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-white p-4">
      {/* Profile */}
      <div className="flex flex-col items-center rounded-xl bg-slate-50 p-4 text-center">
        <Avatar name={customer.name} size={56} color="#6366f1" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900">{customer.name}</h3>
        <p className="text-xs text-slate-500">{customer.company}</p>
        <div className="mt-3 w-full space-y-1.5 text-left text-xs">
          <Row icon={<MailIcon width={14} height={14} />} text={customer.email} />
          <Row icon={<PhoneIcon width={14} height={14} />} text={customer.phone} />
          <Row icon={<BuildingIcon width={14} height={14} />} text={`Bergabung ${dateOf(customer.joinedAt)}`} />
        </div>
      </div>

      {/* Ticket meta */}
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Total Tiket" value={String(customer.totalTickets)} />
        <Stat label="Tiket Ini" value={`#${conversation.id.toUpperCase()}`} />
      </div>
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Status & Sentimen</span>
          <div className="flex gap-1.5">
            <StatusBadge status={conversation.status} />
            <SentimentBadge sentiment={conversation.sentiment} />
          </div>
        </div>
        {conversation.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {conversation.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        )}
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
        >
          <SparkIcon width={13} height={13} className={analyzing ? "animate-spin" : ""} />
          {analyzing ? "Menganalisis…" : "Analisis Sentimen & Tag (AI)"}
        </button>
      </div>

      {/* AI Summarizer */}
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3">
        <div className="flex items-center gap-1.5">
          <SummaryIcon width={15} height={15} className="text-brand-600" />
          <h4 className="text-sm font-semibold text-slate-800">Ringkasan AI</h4>
          <span className="ml-auto rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
            FITUR UNGGULAN
          </span>
        </div>

        {summarizing ? (
          <div className="mt-3 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="shimmer h-3 rounded" style={{ width: `${90 - i * 12}%` }} />
            ))}
            <p className="pt-1 text-[11px] text-brand-600">AI membaca seluruh riwayat obrolan…</p>
          </div>
        ) : conversation.aiSummary ? (
          <>
            <ul className="mt-3 space-y-2">
              {conversation.aiSummary.map((point, i) => (
                <li key={i} className="flex gap-2 text-xs leading-snug text-slate-600">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <button
              onClick={onSummarize}
              className="mt-3 flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:underline"
            >
              <RefreshIcon width={12} height={12} /> Ringkas ulang
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-xs text-slate-500">
              Riwayat obrolan panjang? Buat 3 poin utama dalam satu klik.
            </p>
            <button
              onClick={onSummarize}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
            >
              <SparkIcon width={14} height={14} /> Ringkas Obrolan
            </button>
          </>
        )}
      </div>

      {/* History */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Riwayat Tiket
        </h4>
        <div className="space-y-1.5">
          {history.map((h) => (
            <div
              key={h.id}
              className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-slate-700">{h.subject}</span>
                <StatusBadge status={h.status} />
              </div>
              <span className="text-[11px] text-slate-400">{relativeTime(h.lastMessageAt)}</span>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-xs text-slate-400">Belum ada tiket lain.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <span className="text-slate-400">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 px-3 py-2">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="truncate text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
