-- Allow active admins to add call log entries for any active student.
-- Correspondents remain limited to active students in their assigned block.
drop policy cl_insert on public.call_logs;
create policy cl_insert on public.call_logs for insert to authenticated
  with check (
    called_by = auth.uid()
    and (
      public.is_active_admin()
      or (
        public.my_block_id() is not null
        and exists (
          select 1 from public.students s
          where s.id = student_id
            and s.block_id = public.my_block_id()
            and s.archived_at is null
        )
      )
    )
  );
