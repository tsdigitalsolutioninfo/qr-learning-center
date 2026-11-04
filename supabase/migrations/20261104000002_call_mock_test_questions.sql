alter table public.call_logs
  add column previous_mock_test_attended boolean,
  add column next_mock_test_ready boolean;

grant update (previous_mock_test_attended, next_mock_test_ready)
  on public.call_logs to authenticated;
