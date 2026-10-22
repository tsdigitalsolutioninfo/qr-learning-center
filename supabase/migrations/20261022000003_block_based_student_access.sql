-- Student access and work queues are scoped to a correspondent's block,
-- rather than an individual student assignment.

drop policy students_cs_select on public.students;
create policy students_cs_select on public.students for select to authenticated
  using (block_id = public.my_block_id() and archived_at is null);

drop policy cl_select on public.call_logs;
drop policy cl_insert on public.call_logs;
create policy cl_select on public.call_logs for select to authenticated
  using (public.is_active_admin() or exists (
    select 1 from public.students s where s.id = student_id
      and s.block_id = public.my_block_id() and s.archived_at is null));
create policy cl_insert on public.call_logs for insert to authenticated
  with check (called_by = auth.uid() and public.my_block_id() is not null and exists (
    select 1 from public.students s where s.id = student_id
      and s.block_id = public.my_block_id() and s.archived_at is null));

drop policy fu_select on public.follow_ups;
drop policy fu_insert on public.follow_ups;
drop policy fu_update on public.follow_ups;
create policy fu_select on public.follow_ups for select to authenticated
  using (public.is_active_admin() or exists (
    select 1 from public.students s where s.id = student_id
      and s.block_id = public.my_block_id() and s.archived_at is null));
create policy fu_insert on public.follow_ups for insert to authenticated
  with check (public.is_active_admin() or (created_by = auth.uid() and assigned_to = auth.uid() and exists (
    select 1 from public.students s where s.id = student_id
      and s.block_id = public.my_block_id() and s.archived_at is null)));
create policy fu_update on public.follow_ups for update to authenticated
  using (public.is_active_admin() or exists (
    select 1 from public.students s where s.id = student_id
      and s.block_id = public.my_block_id() and s.archived_at is null))
  with check (public.is_active_admin() or exists (
    select 1 from public.students s where s.id = student_id
      and s.block_id = public.my_block_id() and s.archived_at is null));

drop policy sa_admin_select on public.student_assignments;
drop policy sa_own_select on public.student_assignments;
drop trigger students_aa on public.students;
drop function public.students_after_assign();

create or replace function public.students_before_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare d text;
begin
  d := regexp_replace(new.phone_number, '\D', '', 'g');
  if length(d) = 12 and left(d,2) = '91' then d := substr(d,3);
  elsif length(d) = 11 and left(d,1) = '0' then d := substr(d,2); end if;
  new.phone_number := d;
  return new;
end $$;

drop index public.students_assigned_idx;
drop index public.students_last_call_idx;
drop table public.student_assignments;
alter table public.students drop column assigned_to;
