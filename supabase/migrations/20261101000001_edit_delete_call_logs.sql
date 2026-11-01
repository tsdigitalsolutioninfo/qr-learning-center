-- Allow authenticated users to maintain call history for students they can access.
create policy cl_update on public.call_logs for update to authenticated
  using (public.is_active_admin() or exists (
    select 1 from public.students s where s.id = student_id
      and s.block_id = public.my_block_id() and s.archived_at is null))
  with check (public.is_active_admin() or exists (
    select 1 from public.students s where s.id = student_id
      and s.block_id = public.my_block_id() and s.archived_at is null));
create policy cl_delete on public.call_logs for delete to authenticated
  using (public.is_active_admin() or exists (
    select 1 from public.students s where s.id = student_id
      and s.block_id = public.my_block_id() and s.archived_at is null));

revoke update on public.call_logs from authenticated;
grant update (
  call_status, interest_status, exam_applications, admit_card_downloaded,
  interested_oav, notes, follow_up_required, follow_up_at
) on public.call_logs to authenticated;
grant delete on public.call_logs to authenticated;

alter table public.follow_ups
  drop constraint follow_ups_call_log_id_fkey,
  add constraint follow_ups_call_log_id_fkey
    foreign key (call_log_id) references public.call_logs(id) on delete cascade;

create or replace function public.sync_next_follow_up() returns trigger
language plpgsql security definer set search_path = '' as $$
declare sid uuid;
begin
  sid := case when tg_op = 'DELETE' then old.student_id else new.student_id end;
  update public.students set next_follow_up_at =
    (select min(due_at) from public.follow_ups where student_id = sid and status = 'pending')
    where id = sid;
  return null;
end $$;

-- Keep call-derived student fields and linked follow-ups correct after any change.
drop trigger cl_ai on public.call_logs;
create or replace function public.sync_call_log_side_effects() returns trigger
language plpgsql security definer set search_path = '' as $$
declare sid uuid;
begin
  if tg_op = 'DELETE' then
    sid := old.student_id;
  else
    sid := new.student_id;
    if new.follow_up_required then
      insert into public.follow_ups as existing (student_id, assigned_to, call_log_id, due_at, notes, created_by)
        values (new.student_id, new.called_by, new.id, new.follow_up_at, new.notes, new.called_by)
        on conflict (call_log_id) where call_log_id is not null do update
          set due_at = excluded.due_at,
              notes = excluded.notes,
              status = case when existing.status = 'cancelled' then 'pending' else existing.status end,
              completed_at = case when existing.status = 'cancelled' then null else existing.completed_at end;
    else
      update public.follow_ups set status = 'cancelled'
        where call_log_id = new.id and status = 'pending';
    end if;
  end if;

  update public.students set
    interest_status = coalesce((
      select cl.interest_status from public.call_logs cl
      where cl.student_id = sid and cl.interest_status <> 'unknown'
      order by cl.created_at desc, cl.id desc limit 1
    ), 'unknown'),
    last_call_at = (select cl.created_at from public.call_logs cl
      where cl.student_id = sid order by cl.created_at desc, cl.id desc limit 1),
    last_call_status = (select cl.call_status from public.call_logs cl
      where cl.student_id = sid order by cl.created_at desc, cl.id desc limit 1)
    where id = sid;
  return null;
end $$;
create trigger cl_sync after insert or update or delete on public.call_logs
  for each row execute function public.sync_call_log_side_effects();
revoke execute on function public.sync_call_log_side_effects() from public, anon;

-- Deleting a call removes its linked follow-up, so include deletes in summary synchronization.
drop trigger fu_sync on public.follow_ups;
create trigger fu_sync after insert or update or delete on public.follow_ups
  for each row execute function public.sync_next_follow_up();
