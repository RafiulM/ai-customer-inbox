// ---------------------------------------------------------------------------
// Analytics dummy data — dashboard charts (not part of the PRD DB schema).
// Conversation/customer/message data is real and lives in the InsForge DB.
// ---------------------------------------------------------------------------

export interface DailyVolume {
  day: string;
  masuk: number;
  selesai: number;
}

export const weeklyVolume: DailyVolume[] = [
  { day: "Sen", masuk: 34, selesai: 29 },
  { day: "Sel", masuk: 41, selesai: 38 },
  { day: "Rab", masuk: 28, selesai: 31 },
  { day: "Kam", masuk: 52, selesai: 44 },
  { day: "Jum", masuk: 47, selesai: 49 },
  { day: "Sab", masuk: 23, selesai: 22 },
  { day: "Min", masuk: 18, selesai: 17 },
];

export interface AgentStat {
  id: string;
  name: string;
  avatarColor: string;
  resolved: number;
  avgReplyMin: number;
  satisfaction: number;
}

export const agentLeaderboard: AgentStat[] = [
  { id: "u-1", name: "Rafiul Maulana", avatarColor: "#6366f1", resolved: 86, avgReplyMin: 4, satisfaction: 96 },
  { id: "u-2", name: "Sari Dewanti", avatarColor: "#ec4899", resolved: 74, avgReplyMin: 6, satisfaction: 93 },
  { id: "u-4", name: "Tono Wijaya", avatarColor: "#0ea5e9", resolved: 61, avgReplyMin: 8, satisfaction: 89 },
  { id: "u-5", name: "Lina Hartati", avatarColor: "#f59e0b", resolved: 53, avgReplyMin: 7, satisfaction: 91 },
];

export interface ActivityItem {
  id: string;
  kind: "ai" | "reply" | "alert" | "closed";
  text: string;
  time: string;
}

export const activityFeed: ActivityItem[] = [
  { id: "a-1", kind: "alert", text: "Tiket darurat baru terdeteksi oleh analisis sentimen AI.", time: "09:42" },
  { id: "a-2", kind: "ai", text: "AI membuat draf balasan ber-SOP untuk tiket pengiriman.", time: "09:20" },
  { id: "a-3", kind: "reply", text: "Agen membalas tiket stok sparepart.", time: "08:55" },
  { id: "a-4", kind: "ai", text: "AI meringkas obrolan panjang menjadi 3 poin.", time: "08:30" },
  { id: "a-5", kind: "closed", text: "Tiket login member ditutup — pelanggan puas.", time: "Kemarin" },
];
