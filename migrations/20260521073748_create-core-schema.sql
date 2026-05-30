-- AI Customer Support Inbox — core schema
-- Entities: profiles (CS staff), customers, conversations (tickets), messages.

-- ---------------------------------------------------------------------------
-- profiles — extends auth.users for CS agents & administrators (PRD: USERS)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null default 'Agen CS',
  email        text not null,
  role         text not null default 'agent' check (role in ('agent', 'admin')),
  avatar_color text not null default '#6366f1',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- customers — external customers (not auth users) (PRD: CUSTOMERS)
-- ---------------------------------------------------------------------------
create table public.customers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  company       text,
  joined_at     date not null default current_date,
  total_tickets integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- conversations — support tickets / chats (PRD: CONVERSATIONS)
-- ---------------------------------------------------------------------------
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers(id) on delete cascade,
  agent_id        uuid references auth.users(id) on delete set null,
  channel         text not null default 'Live Chat'
                    check (channel in ('WhatsApp', 'Email', 'Live Chat', 'Instagram')),
  subject         text not null default '',
  status          text not null default 'open'
                    check (status in ('open', 'pending', 'closed')),
  sentiment       text not null default 'netral'
                    check (sentiment in ('marah', 'netral', 'puas')),
  tags            text[] not null default '{}',
  ai_summary      text[],
  unread          integer not null default 0,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- messages — individual chat messages (PRD: MESSAGES)
-- ---------------------------------------------------------------------------
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_type     text not null check (sender_type in ('customer', 'agent', 'ai_system')),
  content         text not null default '',
  attachment_url  text,
  attachment_name text,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index idx_conversations_customer     on public.conversations (customer_id);
create index idx_conversations_agent        on public.conversations (agent_id);
create index idx_conversations_status       on public.conversations (status);
create index idx_conversations_last_message on public.conversations (last_message_at desc);
create index idx_messages_conversation      on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
--   anon            -> no access
--   authenticated   -> CS staff: full access to customers/conversations/messages
--   profiles        -> readable by all staff; each user writes only their own row
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.customers     enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- profiles
create policy "profiles readable by staff"
  on public.profiles for select to authenticated using (true);
create policy "users insert own profile"
  on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- customers
create policy "staff manage customers"
  on public.customers for all to authenticated using (true) with check (true);

-- conversations
create policy "staff manage conversations"
  on public.conversations for all to authenticated using (true) with check (true);

-- messages
create policy "staff manage messages"
  on public.messages for all to authenticated using (true) with check (true);
