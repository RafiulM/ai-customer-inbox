import { insforge } from "./insforge";
import type {
  Conversation,
  Customer,
  Message,
  Role,
  User,
} from "./types";

// ---- Row shapes (snake_case, as stored in Postgres) ----------------------

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  joined_at: string;
  total_tickets: number;
}

interface ConversationRow {
  id: string;
  customer_id: string;
  agent_id: string | null;
  channel: Conversation["channel"];
  subject: string;
  status: Conversation["status"];
  sentiment: Conversation["sentiment"];
  tags: string[];
  ai_summary: string[] | null;
  unread: number;
  created_at: string;
  last_message_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_type: Message["senderType"];
  content: string;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_color: string;
}

// ---- Mappers -------------------------------------------------------------

const toCustomer = (r: CustomerRow): Customer => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone ?? "",
  company: r.company ?? "",
  joinedAt: r.joined_at,
  totalTickets: r.total_tickets,
});

const toConversation = (r: ConversationRow): Conversation => ({
  id: r.id,
  customerId: r.customer_id,
  agentId: r.agent_id,
  channel: r.channel,
  subject: r.subject,
  status: r.status,
  sentiment: r.sentiment,
  tags: r.tags ?? [],
  aiSummary: r.ai_summary,
  unread: r.unread,
  createdAt: r.created_at,
  lastMessageAt: r.last_message_at,
});

const toMessage = (r: MessageRow): Message => ({
  id: r.id,
  conversationId: r.conversation_id,
  senderType: r.sender_type,
  content: r.content,
  attachmentUrl: r.attachment_url ?? undefined,
  attachmentName: r.attachment_name ?? undefined,
  createdAt: r.created_at,
});

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#0ea5e9", "#f59e0b", "#10b981"];

// ---- Queries -------------------------------------------------------------

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await insforge.database.from("customers").select();
  if (error) throw new Error(error.message);
  return (data as CustomerRow[]).map(toCustomer);
}

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await insforge.database
    .from("conversations")
    .select()
    .order("last_message_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ConversationRow[]).map(toConversation);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await insforge.database
    .from("messages")
    .select()
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as MessageRow[]).map(toMessage);
}

// ---- Mutations -----------------------------------------------------------

export async function insertMessage(
  conversationId: string,
  senderType: Message["senderType"],
  content: string,
  attachmentName?: string,
): Promise<Message> {
  const { data, error } = await insforge.database
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        sender_type: senderType,
        content,
        attachment_name: attachmentName ?? null,
        attachment_url: attachmentName ? "#" : null,
      },
    ])
    .select();
  if (error) throw new Error(error.message);
  return toMessage((data as MessageRow[])[0]);
}

export async function touchConversation(
  conversationId: string,
  patch: Partial<{
    status: Conversation["status"];
    last_message_at: string;
    ai_summary: string[];
    unread: number;
    agent_id: string;
    sentiment: Conversation["sentiment"];
    tags: string[];
  }>,
): Promise<void> {
  const { error } = await insforge.database
    .from("conversations")
    .update(patch)
    .eq("id", conversationId);
  if (error) throw new Error(error.message);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await touchConversation(conversationId, { unread: 0 });
}

// ---- Profiles ------------------------------------------------------------

export async function ensureProfile(
  userId: string,
  name: string,
  email: string,
): Promise<User> {
  const { data: existing } = await insforge.database
    .from("profiles")
    .select()
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    const r = existing as ProfileRow;
    return {
      id: r.id,
      name: r.full_name,
      email: r.email,
      role: r.role,
      avatarColor: r.avatar_color,
    };
  }

  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const { data, error } = await insforge.database
    .from("profiles")
    .insert([
      {
        id: userId,
        full_name: name || "Agen CS",
        email,
        role: "agent",
        avatar_color: color,
      },
    ])
    .select();
  if (error) throw new Error(error.message);
  const r = (data as ProfileRow[])[0];
  return {
    id: r.id,
    name: r.full_name,
    email: r.email,
    role: r.role,
    avatarColor: r.avatar_color,
  };
}
