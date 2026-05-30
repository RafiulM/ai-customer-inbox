import type { ConversationStatus, Sentiment } from "@/lib/types";

const sentimentStyle: Record<Sentiment, { label: string; cls: string; dot: string }> = {
  marah: {
    label: "Marah",
    cls: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  netral: {
    label: "Netral",
    cls: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
  puas: {
    label: "Puas",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const s = sentimentStyle[sentiment];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

const statusStyle: Record<ConversationStatus, { label: string; cls: string }> = {
  open: { label: "Terbuka", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  closed: { label: "Selesai", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export function StatusBadge({ status }: { status: ConversationStatus }) {
  const s = statusStyle[status];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

export function Tag({ label }: { label: string }) {
  const urgent = /darurat|prioritas|refund/i.test(label);
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${
        urgent
          ? "bg-red-100 text-red-700"
          : "bg-brand-50 text-brand-700"
      }`}
    >
      {label}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: string }) {
  return (
    <span className="inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
      {channel}
    </span>
  );
}
