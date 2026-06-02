-- Blueprint Chart: hosted chart storage.
-- Charts persist as raw .bpc DSL text plus a jsonb meta sidecar.
-- Owner has full access to their rows; published rows are world-readable.

create table if not exists public.charts (
  id          text primary key,
  owner       uuid not null references auth.users (id) on delete cascade default auth.uid(),
  dsl         text not null,
  meta        jsonb not null default '{}'::jsonb,
  title       text not null default '',
  chart_type  text not null default '',
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists charts_owner_updated_idx
  on public.charts (owner, updated_at desc);

-- Keep updated_at fresh on every UPDATE.
create or replace function public.charts_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists charts_set_updated_at on public.charts;
create trigger charts_set_updated_at
  before update on public.charts
  for each row execute function public.charts_set_updated_at();

-- Row-Level Security
alter table public.charts enable row level security;

drop policy if exists "owner full access" on public.charts;
create policy "owner full access" on public.charts
  for all
  to authenticated
  using (auth.uid() = owner)
  with check (auth.uid() = owner);

drop policy if exists "public read published" on public.charts;
create policy "public read published" on public.charts
  for select
  to anon, authenticated
  using (published = true);

-- Table-level privileges. RLS (above) decides WHICH rows each role may touch,
-- but the role still needs the base GRANT or every statement fails with 42501.
-- anon reads published charts; authenticated owns full CRUD on its own rows.
grant select on public.charts to anon;
grant select, insert, update, delete on public.charts to authenticated;
