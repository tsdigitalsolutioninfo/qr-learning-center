# Database setup (Part 1)

## Apply
`supabase link --project-ref <ref>` then `supabase db push` (or paste the migration in the SQL editor).
After 30 Oct 2026 the grants in the migration are required; they are already included.
Also check Dashboard > Settings > Data API that the tables are exposed.

## First admin (no public registration)
1. Dashboard > Authentication > Users > "Add user" (disable public sign-ups in Auth settings).
2. In the SQL editor (runs as postgres, bypasses RLS) run once:
   insert into public.profiles (id, full_name, role) values ('<auth-user-uuid>', 'Your Name', 'admin');
3. Recovery: repeat with a new auth user, or reset the password from the dashboard. Rotate the service key in Settings > API Keys.

## Security tests (use two accounts: admin A, correspondent C in block X)
- C: `select` students -> only active rows in block X.
- C: insert call_log with called_by = another user -> rejected.
- C: insert call_log for a student in another block -> rejected.
- C: update/delete call_logs -> permission denied.
- C: update own profile role/is_active -> 0 rows (no policy).
- C: manage call logs and follow-ups only for students in block X.
- A: student records are visible to the correspondent assigned to their block; no individual student assignment is performed.
- Anonymous (no JWT): every table -> permission denied.

## Known limitations
- Admin call-log correction with audit trail is not built (needs an extra table beyond the seven specified); planned for Part 2.
- Untested against a live Supabase instance: please run the tests above.
