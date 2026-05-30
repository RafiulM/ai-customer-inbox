export type Role = "admin" | "agent";

export type Sentiment = "marah" | "netral" | "puas";

export type ConversationStatus = "open" | "pending" | "closed";

export type SenderType = "customer" | "agent" | "ai_system";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  joinedAt: string;
  totalTickets: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderType;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  agentId: string | null;
  channel: "WhatsApp" | "Email" | "Live Chat" | "Instagram";
  subject: string;
  status: ConversationStatus;
  sentiment: Sentiment;
  tags: string[];
  aiSummary: string[] | null;
  unread: number;
  createdAt: string;
  lastMessageAt: string;
}
