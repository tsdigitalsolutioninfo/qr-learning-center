-- Odisha Exam Outreach Manager: initial schema, RLS and explicit grants.
-- Explicit GRANTs are included because Supabase no longer auto-grants Data API
-- access to new public tables (from 30 Oct 2026).

-- ===== Helpers =====
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- ===== Tables =====
create table public.districts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index districts_name_uq on public.districts (lower(trim(name)));

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts(id),
  name text not null check (length(trim(name)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, district_id)  -- target for composite FKs (block/district consistency)
);
create unique index blocks_name_uq on public.blocks (district_id, lower(trim(name)));

create table public.profiles (
  id uuid primary key references auth.users(id),
  full_name text not null check (length(trim(full_name)) > 0),
  role text not null check (role in ('admin','block_correspondence')),
  district_id uuid,
  block_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (block_id, district_id) references public.blocks(id, district_id),
  check (role = 'admin' or (block_id is not null and district_id is not null))
);
create index profiles_block_idx on public.profiles (block_id) where role = 'block_correspondence';

create table public.students (
  id uuid primary key default gen_random_uuid(),
  student_name text not null check (length(trim(student_name)) > 0),
  phone_number text not null check (phone_number ~ '^[6-9][0-9]{9}$'),
  district_id uuid not null references public.districts(id),
  block_id uuid not null,
  school_name text,
  class_name text,
  interest_status text not null default 'unknown'
    check (interest_status in ('unknown','interested','not_interested','maybe_later','registered')),
  assigned_to uuid references public.profiles(id),
  notes text,
  next_follow_up_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (block_id, district_id) references public.blocks(id, district_id)
);
-- Phone is deliberately NOT unique; duplicates are detected in the import workflow.
create index students_phone_idx on public.students (phone_number);
create index students_block_idx on public.students (block_id);
create index students_assigned_idx on public.students (assigned_to);

create table public.student_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  assigned_to uuid not null references public.profiles(id),
  assigned_by uuid not null references public.profiles(id),
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz
);
create unique index one_active_assignment_uq on public.student_assignments (student_id) where unassigned_at is null;
create index student_assignments_user_idx on public.student_assignments (assigned_to);

create table public.call_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  called_by uuid not null references public.profiles(id),
  call_status text not null check (call_status in
    ('connected','not_connected','busy','switched_off','invalid_number','disconnected','call_back_requested')),
  interest_status text not null check (interest_status in
    ('unknown','interested','not_interested','maybe_later','registered')),
  notes text,
  follow_up_required boolean not null default false,
  follow_up_at timestamptz,
  call_started_at timestamptz,
  call_ended_at timestamptz,
  created_at timestamptz not null default now(),
  check (not follow_up_required or follow_up_at is not null),
  check (call_ended_at is null or call_started_at is null or call_ended_at >= call_started_at)
);
create index call_logs_student_idx on public.call_logs (student_id, created_at desc);
create index call_logs_user_idx on public.call_logs (called_by, created_at desc);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  assigned_to uuid not null references public.profiles(id),
  call_log_id uuid references public.call_logs(id),
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','completed','cancelled')),
  notes text,
  created_by uuid not null references public.profiles(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index follow_ups_call_log_uq on public.follow_ups (call_log_id) where call_log_id is not null; -- idempotent
create index follow_ups_user_due_idx on public.follow_ups (assigned_to, due_at) where status = 'pending';
create index follow_ups_student_idx on public.follow_ups (student_id);

-- ===== updated_at triggers =====
create trigger t_upd before update on public.districts for each row execute function public.set_updated_at();
create trigger t_upd before update on public.blocks for each row execute function public.set_updated_at();
create trigger t_upd before update on public.profiles for each row execute function public.set_updated_at();
create trigger t_upd before update on public.students for each row execute function public.set_updated_at();
create trigger t_upd before update on public.follow_ups for each row execute function public.set_updated_at();

-- ===== Authorization helpers (SECURITY DEFINER avoids recursive RLS) =====
create or replace function public.is_active_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active) $$;

create or replace function public.my_block_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select block_id from public.profiles
    where id = auth.uid() and role = 'block_correspondence' and is_active $$;

create or replace function public.my_district_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select district_id from public.profiles
    where id = auth.uid() and role = 'block_correspondence' and is_active $$;

-- ===== Business-rule triggers =====
-- Normalize phone (keep last 10 digits of +91 / 0 prefixed input) and validate assignee.
create or replace function public.students_before_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare d text;
begin
  d := regexp_replace(new.phone_number, '\D', '', 'g');
  if length(d) = 12 and left(d,2) = '91' then d := substr(d,3);
  elsif length(d) = 11 and left(d,1) = '0' then d := substr(d,2); end if;
  new.phone_number := d;
  if new.assigned_to is not null and not exists (
    select 1 from public.profiles p where p.id = new.assigned_to
      and p.role = 'block_correspondence' and p.is_active and p.block_id = new.block_id) then
    raise exception 'assigned_to must be an active block correspondent of the student''s block';
  end if;
  return new;
end $$;
create trigger students_bw before insert or update on public.students
  for each row execute function public.students_before_write();

-- Keep assignment history, current assignee and pending follow-ups consistent.
create or replace function public.students_after_assign() returns trigger
language plpgsql security definer set search_path = '' as $$
declare actor uuid := coalesce(auth.uid(), new.created_by);
begin
  if tg_op = 'UPDATE' and new.assigned_to is not distinct from old.assigned_to then return new; end if;
  update public.student_assignments set unassigned_at = now()
    where student_id = new.id and unassigned_at is null;
  if new.assigned_to is not null then
    if actor is null then raise exception 'cannot determine assigning user'; end if;
    insert into public.student_assignments (student_id, assigned_to, assigned_by)
      values (new.id, new.assigned_to, actor);
    update public.follow_ups set assigned_to = new.assigned_to
      where student_id = new.id and status = 'pending';
  else
    update public.follow_ups set status = 'cancelled'
      where student_id = new.id and status = 'pending';
  end if;
  return new;
end $$;
create trigger students_aa after insert or update of assigned_to on public.students
  for each row execute function public.students_after_assign();

create or replace function public.follow_ups_before_write() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'completed' and new.completed_at is null then new.completed_at := now(); end if;
  if new.status <> 'completed' then new.completed_at := null; end if;
  return new;
end $$;
create trigger fu_bw before insert or update on public.follow_ups
  for each row execute function public.follow_ups_before_write();

-- A call log updates the student summary and creates its follow-up (once).
create or replace function public.call_logs_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.students set interest_status = new.interest_status,
    next_follow_up_at = case when new.follow_up_required then new.follow_up_at else null end
    where id = new.student_id;
  if new.follow_up_required then
    insert into public.follow_ups (student_id, assigned_to, call_log_id, due_at, notes, created_by)
      values (new.student_id, new.called_by, new.id, new.follow_up_at, new.notes, new.called_by)
      on conflict do nothing;
  end if;
  return new;
end $$;
create trigger cl_ai after insert on public.call_logs
  for each row execute function public.call_logs_after_insert();

-- Lock down function execution
revoke execute on all functions in schema public from public, anon;
grant execute on function public.is_active_admin(), public.my_block_id(), public.my_district_id() to authenticated;

-- ===== RLS =====
alter table public.districts enable row level security;
alter table public.blocks enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.student_assignments enable row level security;
alter table public.call_logs enable row level security;
alter table public.follow_ups enable row level security;

-- districts / blocks
create policy districts_admin_all on public.districts for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
create policy districts_own_select on public.districts for select to authenticated
  using (id = public.my_district_id());
create policy blocks_admin_all on public.blocks for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
create policy blocks_own_select on public.blocks for select to authenticated
  using (id = public.my_block_id());

-- profiles: admin manages; users read self. No client INSERT/DELETE (service role only).
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_active_admin());
create policy profiles_admin_update on public.profiles for update to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());

-- students: admin all; correspondents read only their assigned students in their block
create policy students_admin_all on public.students for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
create policy students_cs_select on public.students for select to authenticated
  using (assigned_to = auth.uid() and block_id = public.my_block_id());

create policy sa_admin_select on public.student_assignments for select to authenticated
  using (public.is_active_admin());
create policy sa_own_select on public.student_assignments for select to authenticated
  using (assigned_to = auth.uid());

-- call logs: append-only for users
create policy cl_select on public.call_logs for select to authenticated
  using (public.is_active_admin() or called_by = auth.uid());
create policy cl_insert on public.call_logs for insert to authenticated
  with check (called_by = auth.uid() and public.my_block_id() is not null and exists (
    select 1 from public.students s where s.id = student_id
      and s.assigned_to = auth.uid() and s.block_id = public.my_block_id()));

-- follow-ups
create policy fu_select on public.follow_ups for select to authenticated
  using (public.is_active_admin() or assigned_to = auth.uid());
create policy fu_insert on public.follow_ups for insert to authenticated
  with check (public.is_active_admin() or (created_by = auth.uid() and assigned_to = auth.uid() and exists (
    select 1 from public.students s where s.id = student_id
      and s.assigned_to = auth.uid() and s.block_id = public.my_block_id())));
create policy fu_update on public.follow_ups for update to authenticated
  using (public.is_active_admin() or (assigned_to = auth.uid() and public.my_block_id() is not null))
  with check (public.is_active_admin() or (assigned_to = auth.uid() and public.my_block_id() is not null));

-- ===== Explicit grants (RLS still decides row access) =====
grant select, insert, update, delete on public.districts to authenticated;
grant select, insert, update, delete on public.blocks to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select on public.student_assignments to authenticated;
grant select, insert on public.call_logs to authenticated;          -- no UPDATE/DELETE
grant select, insert, update on public.follow_ups to authenticated; -- no DELETE (cancel instead)

-- anon gets nothing: no public data.
grant all on public.districts, public.blocks, public.profiles, public.students,
  public.student_assignments, public.call_logs, public.follow_ups to service_role;
