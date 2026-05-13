create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  client text not null,
  contact_person text,
  email text,
  phone text,
  country text,
  project_category text,
  project_type text,
  status text not null default 'New',
  notes text,
  source_email_id text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.active_projects (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references public.enquiries(id),
  project_client text not null,
  conveyor_type text,
  conveyor_quantity integer,
  total_slot integer,
  estimated_employees integer,
  soiled_chute text,
  total_contract numeric(12, 2) not null default 0,
  expect_installation text,
  shipment_status text not null default 'Not Started',
  overall_status text not null default 'In Progress',
  peripherals text,
  drawings text,
  final_quote_file text,
  po_file text,
  drawing_files jsonb not null default '[]'::jsonb,
  purchase_items jsonb not null default '[]'::jsonb,
  payments jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.processed_emails (
  id uuid primary key default gen_random_uuid(),
  provider_message_id text not null unique,
  subject text,
  sender text,
  received_at timestamptz,
  enquiry_id uuid references public.enquiries(id),
  processed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_is_approved()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_approved = true
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_enquiries_updated_at on public.enquiries;
create trigger set_enquiries_updated_at
before update on public.enquiries
for each row execute function public.set_updated_at();

drop trigger if exists set_active_projects_updated_at on public.active_projects;
create trigger set_active_projects_updated_at
before update on public.active_projects
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.enquiries enable row level security;
alter table public.active_projects enable row level security;
alter table public.processed_emails enable row level security;

drop policy if exists "approved users can read profiles" on public.profiles;
create policy "approved users can read profiles"
on public.profiles for select
to authenticated
using (public.current_user_is_approved() or id = auth.uid());

drop policy if exists "users can update own profile name" on public.profiles;
create policy "users can update own profile name"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and is_approved = false);

drop policy if exists "approved users can read enquiries" on public.enquiries;
create policy "approved users can read enquiries"
on public.enquiries for select
to authenticated
using (public.current_user_is_approved());

drop policy if exists "approved users can insert enquiries" on public.enquiries;
create policy "approved users can insert enquiries"
on public.enquiries for insert
to authenticated
with check (public.current_user_is_approved());

drop policy if exists "approved users can update enquiries" on public.enquiries;
create policy "approved users can update enquiries"
on public.enquiries for update
to authenticated
using (public.current_user_is_approved())
with check (public.current_user_is_approved());

drop policy if exists "approved users can read active projects" on public.active_projects;
create policy "approved users can read active projects"
on public.active_projects for select
to authenticated
using (public.current_user_is_approved());

drop policy if exists "approved users can insert active projects" on public.active_projects;
create policy "approved users can insert active projects"
on public.active_projects for insert
to authenticated
with check (public.current_user_is_approved());

drop policy if exists "approved users can update active projects" on public.active_projects;
create policy "approved users can update active projects"
on public.active_projects for update
to authenticated
using (public.current_user_is_approved())
with check (public.current_user_is_approved());

drop policy if exists "approved users can read processed emails" on public.processed_emails;
create policy "approved users can read processed emails"
on public.processed_emails for select
to authenticated
using (public.current_user_is_approved());

drop policy if exists "approved users can insert processed emails" on public.processed_emails;
create policy "approved users can insert processed emails"
on public.processed_emails for insert
to authenticated
with check (public.current_user_is_approved());

alter publication supabase_realtime add table public.enquiries;
alter publication supabase_realtime add table public.active_projects;
