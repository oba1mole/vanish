-- ============================================================
-- VANISH
-- One-Time Encrypted Messages
-- Database Migration 001
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- TABLE
-- ============================================================

create table if not exists public.burn_messages (
    id uuid primary key default gen_random_uuid(),

    ciphertext text not null,

    iv text not null,

    created_at timestamptz
        not null
        default now(),

    expires_at timestamptz
        not null,

    consumed_at timestamptz
);


-- ============================================================
-- BASIC CONSTRAINTS
-- ============================================================

alter table public.burn_messages
    add constraint burn_messages_ciphertext_not_empty
    check (length(ciphertext) > 0);

alter table public.burn_messages
    add constraint burn_messages_iv_not_empty
    check (length(iv) > 0);

alter table public.burn_messages
    add constraint burn_messages_expiry_valid
    check (expires_at > created_at);


-- ============================================================
-- INDEX
-- ============================================================

create index if not exists
    burn_messages_expires_at_idx
on public.burn_messages(expires_at);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.burn_messages
enable row level security;


-- ============================================================
-- IMPORTANT:
-- No SELECT policy is created.
--
-- The browser should NOT be allowed to directly
-- read ciphertext.
-- ============================================================


-- ============================================================
-- INSERT POLICY
--
-- Anonymous users may create encrypted records.
-- ============================================================

drop policy if exists
    "anonymous users can create encrypted messages"
on public.burn_messages;

create policy
    "anonymous users can create encrypted messages"
on public.burn_messages
for insert
to anon
with check (
    length(ciphertext) > 0
    and length(iv) > 0
    and expires_at > now()
);


-- ============================================================
-- ATOMIC CONSUME FUNCTION
--
-- DELETE + RETURN happens as ONE database operation.
--
-- Therefore:
--
-- Request A ──┐
--             ├── only one can successfully consume
-- Request B ──┘
--
-- The ciphertext is returned to the caller that wins
-- the DELETE operation.
-- ============================================================

create or replace function
public.consume_message(
    p_id uuid
)
returns table (
    ciphertext text,
    iv text,
    expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin

    return query
    delete from public.burn_messages
    where
        id = p_id
        and consumed_at is null
        and expires_at > now()

    returning
        burn_messages.ciphertext,
        burn_messages.iv,
        burn_messages.expires_at;

end;
$$;


-- ============================================================
-- SECURITY:
-- Remove public execution access.
-- The Edge Function uses the service-role key server-side.
-- ============================================================

revoke all
on function public.consume_message(uuid)
from public;

revoke all
on function public.consume_message(uuid)
from anon;

revoke all
on function public.consume_message(uuid)
from authenticated;


-- ============================================================
-- EXPIRED MESSAGE CLEANUP
--
-- This function can be called by a trusted server-side
-- process / scheduled job.
-- ============================================================

create or replace function
public.cleanup_expired_messages()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    deleted_count integer;
begin

    delete from public.burn_messages
    where expires_at <= now();

    get diagnostics
        deleted_count = row_count;

    return deleted_count;

end;
$$;


revoke all
on function public.cleanup_expired_messages()
from public;

revoke all
on function public.cleanup_expired_messages()
from anon;

revoke all
on function public.cleanup_expired_messages()
from authenticated;