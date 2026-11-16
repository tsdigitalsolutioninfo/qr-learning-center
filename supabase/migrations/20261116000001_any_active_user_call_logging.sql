create or replace function public.can_record_call_for_student(p_student_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_active
    )
    and exists (
      select 1 from public.students s
      where s.id = p_student_id and s.archived_at is null
    )
$$;

revoke execute on function public.can_record_call_for_student(uuid) from public, anon;
grant execute on function public.can_record_call_for_student(uuid) to authenticated;

drop policy cl_insert on public.call_logs;
create policy cl_insert on public.call_logs for insert to authenticated
  with check (
    called_by = auth.uid()
    and public.can_record_call_for_student(student_id)
  );

drop policy cl_select on public.call_logs;
create policy cl_select on public.call_logs for select to authenticated
  using (
    public.is_active_admin()
    or (
      called_by = auth.uid()
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.is_active
      )
    )
    or exists (
      select 1 from public.students s
      where s.id = student_id
        and s.block_id = public.my_block_id()
        and s.archived_at is null
    )
  );
