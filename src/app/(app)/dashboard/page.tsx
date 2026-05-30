"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Avatar } from "@/components/Avatar";
import { SentimentBadge } from "@/components/badges";
import { DonutChart, VolumeBarChart } from "@/components/charts";
import {
  BellIcon,
  CheckIcon,
  InboxIcon,
  MailIcon,
  SparkIcon,
} from "@/components/icons";
import { Sidebar } from "@/components/Sidebar";
import { activityFeed, agentLeaderboard, weeklyVolume } from "@/lib/data";
import { getConversations, getCustomers } from "@/lib/db";
import { relativeTime } from "@/lib/format";
import type { ActivityItem } from "@/lib/data";
import type { Conversation, Customer } from "@/lib/types";

const CHANNEL_COLORS: Record<string, string> = {
  WhatsApp: "#22c55e",
  Email: "#6366f1",
  "Live Chat": "#0ea5e9",
  Instagram: "#ec4899",
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getConversations(), getCustomers()])
      .then(([conv, cust]) => {
        if (cancelled) return;
        setConversations(conv);
        setCustomers(cust);
        setLoading(false);
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const openCount = conversations.filter((c) => c.status === "open").length;
  const pendingCount = conversations.filter((c) => c.status === "pending").length;
  const angry = conversations.filter((c) => c.sentiment === "marah");
  const weekTotal = weeklyVolume.reduce((s, d) => s + d.masuk, 0);

  // Sentiment donut — derived from real conversation data.
  const sentimentSlices = (["puas", "netral", "marah"] as const).map((s) => ({
    label: s === "puas" ? "Puas" : s === "netral" ? "Netral" : "Marah",
    value: conversations.filter((c) => c.sentiment === s).length,
    color: s === "puas" ? "#10b981" : s === "netral" ? "#94a3b8" : "#ef4444",
  }));

  // Channel mix — derived from real conversation data.
  const channelStats = Object.entries(CHANNEL_COLORS).map(([name, color]) => ({
    name,
    color,
    value: conversations.filter((c) => c.channel === name).length,
  }));
  const channelMax = Math.max(1, ...channelStats.map((c) => c.value));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <SparkIcon width={28} height={28} className="animate-pulse text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="scroll-thin flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-7 py-4 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Selamat datang, {profile.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-slate-500">
              Ringkasan kinerja tim CS — Kamis, 21 Mei 2026
            </p>
          </div>
          <Link
            href="/inbox"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <InboxIcon width={16} height={16} />
            Buka Inbox
          </Link>
        </header>

        <div className="space-y-6 p-7">
          {/* AI insight banner */}
          <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/70 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
              <SparkIcon width={18} height={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Wawasan AI Hari Ini</p>
              <p className="text-sm text-slate-600">
                {angry.length} tiket berlabel <span className="font-medium text-red-600">marah/darurat</span>{" "}
                butuh penanganan cepat. Volume pesan naik 12% dari minggu lalu — pertimbangkan
                tambahan agen di jam sibuk (10.00–14.00).
              </p>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Tiket Minggu Ini" value={String(weekTotal)} delta="+12%" up />
            <Kpi label="Tiket Terbuka" value={String(openCount)} sub={`${pendingCount} pending`} />
            <Kpi label="Perlu Perhatian" value={String(angry.length)} delta="darurat" alert />
            <Kpi label="Rata-rata Respons" value="5 mnt" delta="-18%" up />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2" title="Volume Pesan — 7 Hari Terakhir">
              <VolumeBarChart data={weeklyVolume} />
            </Card>
            <Card title="Sentimen Pelanggan">
              <DonutChart slices={sentimentSlices} centerLabel="Total tiket dianalisis AI" />
            </Card>
          </div>

          {/* Channel + urgent queue */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="Saluran Komunikasi">
              <div className="space-y-3">
                {channelStats.map((c) => (
                  <div key={c.name}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-600">{c.name}</span>
                      <span className="font-semibold text-slate-800">{c.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.value / channelMax) * 100}%`,
                          background: c.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-2" title="Antrean Prioritas (Sentimen AI)">
              <div className="space-y-2">
                {angry.map((c) => {
                  const cust = customers.find((x) => x.id === c.customerId);
                  if (!cust) return null;
                  return (
                    <Link
                      key={c.id}
                      href="/inbox"
                      className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 transition hover:border-brand-200 hover:bg-brand-50/50"
                    >
                      <Avatar name={cust.name} size={34} color="#ef4444" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{cust.name}</p>
                        <p className="truncate text-xs text-slate-500">{c.subject}</p>
                      </div>
                      <SentimentBadge sentiment={c.sentiment} />
                      <span className="text-[11px] text-slate-400">
                        {relativeTime(c.lastMessageAt)}
                      </span>
                    </Link>
                  );
                })}
                {angry.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-400">
                    Tidak ada tiket darurat. 🎉
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Leaderboard + activity */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2" title="Kinerja Agen">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="pb-2 font-medium">Agen</th>
                    <th className="pb-2 text-center font-medium">Tiket Selesai</th>
                    <th className="pb-2 text-center font-medium">Respons</th>
                    <th className="pb-2 text-right font-medium">Kepuasan</th>
                  </tr>
                </thead>
                <tbody>
                  {agentLeaderboard.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={a.name} size={30} color={a.avatarColor} />
                          <span className="font-medium text-slate-700">{a.name}</span>
                        </div>
                      </td>
                      <td className="text-center text-slate-600">{a.resolved}</td>
                      <td className="text-center text-slate-600">{a.avgReplyMin} mnt</td>
                      <td className="py-2.5 text-right">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          {a.satisfaction}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card title="Aktivitas Terbaru">
              <div className="space-y-3">
                {activityFeed.map((a) => (
                  <ActivityRow key={a.id} item={a} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  sub,
  up,
  alert,
}: {
  label: string;
  value: string;
  delta?: string;
  sub?: string;
  up?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold ${alert ? "text-red-600" : "text-slate-900"}`}>
        {value}
      </p>
      {delta && (
        <span
          className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium ${
            alert
              ? "bg-red-50 text-red-600"
              : up
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {delta}
        </span>
      )}
      {sub && <span className="mt-1 block text-[11px] text-slate-400">{sub}</span>}
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}>
      <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

const activityStyle = {
  ai: { icon: SparkIcon, cls: "bg-brand-50 text-brand-600" },
  reply: { icon: MailIcon, cls: "bg-sky-50 text-sky-600" },
  alert: { icon: BellIcon, cls: "bg-red-50 text-red-600" },
  closed: { icon: CheckIcon, cls: "bg-emerald-50 text-emerald-600" },
} as const;

function ActivityRow({ item }: { item: ActivityItem }) {
  const s = activityStyle[item.kind];
  const Icon = s.icon;
  return (
    <div className="flex gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.cls}`}>
        <Icon width={15} height={15} />
      </div>
      <div className="min-w-0">
        <p className="text-xs leading-snug text-slate-600">{item.text}</p>
        <span className="text-[11px] text-slate-400">{item.time}</span>
      </div>
    </div>
  );
}
