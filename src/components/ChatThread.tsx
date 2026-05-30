"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { ChannelBadge, SentimentBadge, StatusBadge, Tag } from "./badges";
import { FileIcon, PaperclipIcon, SendIcon, SparkIcon } from "./icons";
import { timeOf } from "@/lib/format";
import type { Conversation, Customer, Message } from "@/lib/types";

export function ChatThread({
  conversation,
  customer,
  messages,
  onSend,
  onRequestDraft,
}: {
  conversation: Conversation;
  customer: Customer;
  messages: Message[];
  onSend: (content: string, attachmentName?: string) => void;
  onRequestDraft: () => Promise<string>;
}) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset composer when switching conversation.
  useEffect(() => {
    setText("");
    setAttachment(null);
    setDrafting(false);
  }, [conversation.id]);

  async function generateDraft() {
    setDrafting(true);
    try {
      const draft = await onRequestDraft();
      setText(draft);
    } catch {
      // Parent surfaces the error via toast.
    } finally {
      setDrafting(false);
    }
  }

  function send() {
    if (!text.trim() && !attachment) return;
    onSend(text.trim(), attachment ?? undefined);
    setText("");
    setAttachment(null);
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <Avatar name={customer.name} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-slate-900">{customer.name}</h2>
            <SentimentBadge sentiment={conversation.sentiment} />
          </div>
          <p className="truncate text-xs text-slate-500">{conversation.subject}</p>
        </div>
        <div className="flex items-center gap-2">
          <ChannelBadge channel={conversation.channel} />
          <StatusBadge status={conversation.status} />
        </div>
      </div>

      {/* AI tag bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-5 py-2">
        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
          <SparkIcon width={13} height={13} /> Label AI:
        </span>
        {conversation.tags.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </div>

      {/* Messages */}
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} customerName={customer.name} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-slate-200 bg-white p-3">
        {attachment && (
          <div className="mb-2 flex w-fit items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600">
            <FileIcon width={14} height={14} />
            {attachment}
            <button
              onClick={() => setAttachment(null)}
              className="text-slate-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        )}
        <div className="rounded-xl border border-slate-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            rows={3}
            placeholder="Tulis balasan… atau buat draf dengan AI"
            className="w-full resize-none rounded-t-xl px-3 py-2.5 text-sm outline-none"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setAttachment(f.name);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                title="Lampirkan file"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <PaperclipIcon width={17} height={17} />
              </button>
              <button
                onClick={generateDraft}
                disabled={drafting}
                className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-60"
              >
                <SparkIcon width={14} height={14} className={drafting ? "animate-spin" : ""} />
                {drafting ? "AI menyusun…" : "AI Draft"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] text-slate-400 sm:block">⌘+Enter kirim</span>
              <button
                onClick={send}
                disabled={!text.trim() && !attachment}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
              >
                <SendIcon width={15} height={15} />
                Kirim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, customerName }: { message: Message; customerName: string }) {
  if (message.senderType === "ai_system") {
    return (
      <div className="flex justify-center">
        <span className="flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 text-[11px] text-slate-500">
          <SparkIcon width={12} height={12} />
          {message.content}
        </span>
      </div>
    );
  }

  const isAgent = message.senderType === "agent";
  return (
    <div className={`flex gap-2.5 ${isAgent ? "flex-row-reverse" : ""}`}>
      <Avatar
        name={isAgent ? "Agen CS" : customerName}
        size={32}
        color={isAgent ? "#6366f1" : "#64748b"}
      />
      <div className={`max-w-[72%] ${isAgent ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isAgent
              ? "rounded-tr-sm bg-brand-600 text-white"
              : "rounded-tl-sm bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          {message.content}
          {message.attachmentName && (
            <a
              href={message.attachmentUrl}
              onClick={(e) => e.preventDefault()}
              className={`mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                isAgent ? "bg-brand-700/60" : "bg-slate-100 text-slate-600"
              }`}
            >
              <FileIcon width={14} height={14} />
              {message.attachmentName}
            </a>
          )}
        </div>
        <span className="mt-1 px-1 text-[11px] text-slate-400">{timeOf(message.createdAt)}</span>
      </div>
    </div>
  );
}
