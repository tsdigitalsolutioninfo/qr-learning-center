-- Part 2: archival, last-call summary, idempotent call logging, follow-up sync, extra indexes.
alter table public.students
  add column archived_at timestamptz,
  add column last_call_at timestamptz,
  add column last_call_status text;
alter table public.call_logs add column request_id uuid;
create unique index call_logs_request_uq on public.call_logs (called_by, request_id) where request_id is not null;

create index students_active_idx on public.students (block_id, interest_status) where archived_at is null;
create index students_last_call_idx on public.students (assigned_to, last_call_at);
create index call_logs_created_idx on public.call_logs (created_at desc);
create index follow_ups_status_due_idx on public.follow_ups (status, due_at);

-- Correspondents no longer see archived students.
drop policy students_cs_select on public.students;
create policy students_cs_select on public.students for select to authenticated
  using (assigned_to = auth.uid() and block_id = public.my_block_id() and archived_at is null);

-- students.next_follow_up_at always mirrors the earliest pending follow-up.
create or replace function public.sync_next_follow_up() returns trigger
language plpgsql security definer set search_path = '' as $$
declare sid uuid := coalesce(new.student_id, old.student_id);
begin
  update public.students set next_follow_up_at =
    (select min(due_at) from public.follow_ups where student_id = sid and status = 'pending')
    where id = sid;
  return null;
end $$;
create trigger fu_sync after insert or update on public.follow_ups
  for each row execute function public.sync_next_follow_up();

-- Replaces the Part 1 trigger: one statement (the INSERT) updates log, follow-up and student summary atomically.
-- An 'unknown' interest on a call never overwrites a known interest.
create or replace function public.call_logs_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.follow_up_required then
    insert into public.follow_ups (student_id, assigned_to, call_log_id, due_at, notes, created_by)
      values (new.student_id, new.called_by, new.id, new.follow_up_at, new.notes, new.called_by)
      on conflict do nothing;
  end if;
  update public.students set
    interest_status = case when new.interest_status <> 'unknown' then new.interest_status else interest_status end,
    last_call_at = new.created_at, last_call_status = new.call_status
    where id = new.student_id;
  return new;
end $$;
