alter table public.call_logs
  add column mock_test_status text,
  add constraint call_logs_mock_test_status_valid
    check (
      mock_test_status is null
      or mock_test_status in ('interested', 'not_interested', 'already_attended', 'not_attended_yet')
    ),
  add constraint call_logs_mock_test_requires_application
    check (
      mock_test_status is null
      or coalesce('jnv' = any(exam_applications), false)
      or coalesce('oav' = any(exam_applications), false)
    );

grant update (mock_test_status) on public.call_logs to authenticated;
