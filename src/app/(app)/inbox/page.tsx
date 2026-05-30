"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatThread } from "@/components/ChatThread";
import { ConversationList } from "@/components/ConversationList";
import { RightPanel } from "@/components/RightPanel";
import { Sidebar } from "@/components/Sidebar";
import { ToastStack, type ToastItem } from "@/components/Toast";
import { SparkIcon } from "@/components/icons";
import { aiAnalyze, aiDraft, aiSummarize } from "@/lib/aiClient";
import {
  getConversations,
  getCustomers,
  getMessages,
  insertMessage,
  markConversationRead,
  touchConversation,
} from "@/lib/db";
import type { Conversation, Customer, Message } from "@/lib/types";

export default function InboxPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastSeq = useRef(0);

  // Initial load — customers + conversations.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cust, conv] = await Promise.all([getCustomers(), getConversations()]);
        if (cancelled) return;
        setCustomers(cust);
        setConvs(conv);
        setActiveId(conv[0]?.id ?? null);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Gagal memuat data.");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load messages whenever the active conversation changes.
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    setMessages([]);
    getMessages(activeId)
      .then((m) => !cancelled && setMessages(m))
      .catch(() => !cancelled && setMessages([]));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const active = convs.find((c) => c.id === activeId) ?? null;
  const customer = active
    ? customers.find((c) => c.id === active.customerId) ?? null
    : null;

  const history = useMemo(
    () =>
      active
        ? convs.filter((c) => c.customerId === active.customerId && c.id !== active.id)
        : [],
    [convs, active],
  );

  function pushToast(t: Omit<ToastItem, "id">) {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
  }

  function selectConversation(id: string) {
    setActiveId(id);
    const target = convs.find((c) => c.id === id);
    if (target && target.unread > 0) {
      setConvs((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
      markConversationRead(id).catch(() => {});
    }
  }

  async function handleSend(content: string, attachmentName?: string) {
    if (!active || !customer) return;
    const body = content || "(lampiran terkirim)";
    try {
      const msg = await insertMessage(active.id, "agent", body, attachmentName);
      setMessages((prev) => [...prev, msg]);
      await touchConversation(active.id, {
        status: "pending",
        last_message_at: msg.createdAt,
      });
      setConvs((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? { ...c, status: "pending", lastMessageAt: msg.createdAt }
            : c,
        ),
      );
      pushToast({
        kind: "success",
        title: "Balasan terkirim",
        body: `Pesan dikirim ke ${customer.name}.`,
      });
    } catch (e) {
      pushToast({
        kind: "alert",
        title: "Gagal mengirim",
        body: e instanceof Error ? e.message : "Terjadi kesalahan.",
      });
    }
  }

  async function handleSummarize() {
    if (!active) return;
    setSummarizing(true);
    setConvs((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, aiSummary: null } : c)),
    );
    try {
      const summary = await aiSummarize(messages);
      await touchConversation(active.id, { ai_summary: summary });
      setConvs((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, aiSummary: summary } : c)),
      );
      pushToast({
        kind: "success",
        title: "Ringkasan AI siap",
        body: "Claude merangkum obrolan & menyimpannya ke database.",
      });
    } catch (e) {
      setConvs((prev) => [...prev]); // keep prior summary state intact
      pushToast({
        kind: "alert",
        title: "Ringkasan gagal",
        body: e instanceof Error ? e.message : "Layanan AI gagal.",
      });
    } finally {
      setSummarizing(false);
    }
  }

  async function handleRequestDraft(): Promise<string> {
    if (!active || !customer) throw new Error("Tidak ada percakapan aktif.");
    try {
      return await aiDraft(messages, customer.name, active.subject);
    } catch (e) {
      pushToast({
        kind: "alert",
        title: "Draf AI gagal",
        body: e instanceof Error ? e.message : "Layanan AI gagal.",
      });
      throw e;
    }
  }

  async function handleAnalyze() {
    if (!active) return;
    setAnalyzing(true);
    try {
      const { sentiment, tags } = await aiAnalyze(messages);
      await touchConversation(active.id, { sentiment, tags });
      setConvs((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, sentiment, tags } : c)),
      );
      pushToast({
        kind: sentiment === "marah" ? "alert" : "success",
        title: "Analisis AI selesai",
        body: `Sentimen terdeteksi: ${sentiment}. ${tags.length} tag diperbarui.`,
      });
    } catch (e) {
      pushToast({
        kind: "alert",
        title: "Analisis gagal",
        body: e instanceof Error ? e.message : "Layanan AI gagal.",
      });
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <SparkIcon width={28} height={28} className="animate-pulse text-brand-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-sm font-medium text-red-600">Gagal memuat inbox</p>
          <p className="mt-1 text-xs text-slate-500">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ConversationList
        conversations={convs}
        customers={customers}
        activeId={activeId ?? ""}
        onSelect={selectConversation}
      />
      {active && customer ? (
        <>
          <ChatThread
            key={active.id}
            conversation={active}
            customer={customer}
            messages={messages}
            onSend={handleSend}
            onRequestDraft={handleRequestDraft}
          />
          <RightPanel
            customer={customer}
            conversation={active}
            history={history}
            summarizing={summarizing}
            onSummarize={handleSummarize}
            analyzing={analyzing}
            onAnalyze={handleAnalyze}
          />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-slate-50 text-sm text-slate-400">
          Pilih percakapan untuk memulai.
        </div>
      )}
      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
      />
    </div>
  );
}
