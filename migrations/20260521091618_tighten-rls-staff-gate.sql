-- Tighten overly permissive RLS policies (advisor: security/rls-permissive).
-- The "staff manage *" policies granted ALL access to every authenticated JWT
-- via USING (true) / WITH CHECK (true) -- any signed-up auth user, staff or
-- not, could read/write all conversations, messages, and customer PII.
-- Fix: gate access on actual staff membership (a row in public.profiles).

-- SECURITY DEFINER helper: bypasses RLS so it can be called from a policy on
-- public.profiles itself without recursion. STABLE so it is evaluated once.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
  );
$$;

-- conversations
drop policy if exists "staff manage conversations" on public.conversations;
create policy "staff manage conversations"
  on public.conversations for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- messages (same flaw)
drop policy if exists "staff manage messages" on public.messages;
create policy "staff manage messages"
  on public.messages for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- customers (same flaw -- exposes customer PII)
drop policy if exists "staff manage customers" on public.customers;
create policy "staff manage customers"
  on public.customers for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- profiles: staff directory was readable by any authenticated JWT
drop policy if exists "profiles readable by staff" on public.profiles;
create policy "profiles readable by staff"
  on public.profiles for select to authenticated
  using (public.is_staff());
