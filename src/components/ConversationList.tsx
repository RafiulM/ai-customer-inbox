"use client";

import { useMemo, useState } from "react";
import { Avatar } from "./Avatar";
import { ChannelBadge, SentimentBadge } from "./badges";
import { SearchIcon } from "./icons";
import { relativeTime } from "@/lib/format";
import type { Conversation, Customer } from "@/lib/types";

type Filter = "all" | "open" | "pending" | "closed";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "open", label: "Terbuka" },
  { key: "pending", label: "Pending" },
  { key: "closed", label: "Selesai" },
];

const sentimentRank = { marah: 0, netral: 1, puas: 2 };

export function ConversationList({
  conversations,
  customers,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  customers: Customer[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const custOf = (id: string) => customers.find((c) => c.id === id)!;

  const sorted = useMemo(() => {
    return [...conversations]
      .filter((c) => filter === "all" || c.status === filter)
      .filter((c) => {
        if (!query.trim()) return true;
        const cust = custOf(c.customerId);
        const q = query.toLowerCase();
        return (
          cust.name.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // AI sentiment priority: marah/darurat float to top.
        if (sentimentRank[a.sentiment] !== sentimentRank[b.sentiment]) {
          return sentimentRank[a.sentiment] - sentimentRank[b.sentiment];
        }
        return +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, filter, query]);

  const urgentCount = conversations.filter((c) => c.sentiment === "marah").length;

  return (
    <div className="flex w-[340px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-slate-900">Kotak Masuk</h1>
          {urgentCount > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
              {urgentCount} darurat
            </span>
          )}
        </div>
        <div className="relative mt-3">
          <SearchIcon
            width={16}
            height={16}
            className="absolute left-2.5 top-2.5 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pelanggan atau topik…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-brand-400 focus:bg-white"
          />
        </div>
        <div className="mt-3 flex gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto">
        {sorted.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            Tidak ada percakapan.
          </p>
        )}
        {sorted.map((c) => {
          const cust = custOf(c.customerId);
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`relative flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition ${
                active ? "bg-brand-50" : "hover:bg-slate-50"
              }`}
            >
              {active && <span className="absolute left-0 top-0 h-full w-0.5 bg-brand-600" />}
              <Avatar name={cust.name} size={40} color={c.sentiment === "marah" ? "#ef4444" : "#64748b"} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {cust.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {relativeTime(c.lastMessageAt)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{c.subject}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <SentimentBadge sentiment={c.sentiment} />
                  <ChannelBadge channel={c.channel} />
                  {c.unread > 0 && (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
