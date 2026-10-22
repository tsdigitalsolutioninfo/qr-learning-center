# Setup (no email provider needed)
1. `npm install`; copy `.env.example` to `.env.local` and fill in values (Supabase > Settings > API). `SUPABASE_SECRET_KEY` is server-only; set it in your host's env settings too (never NEXT_PUBLIC_).
2. Apply the migration: `supabase link --project-ref <ref> && supabase db push` (see SETUP_DB.md; includes the required explicit GRANTs).
3. Auth settings: disable public sign-ups. No email templates or SMTP are used.
4. Create the first admin: follow SETUP_DB.md.
5. `npm run dev`, then `npm run typecheck && npm run lint`.

## How staff accounts work
Admin > Users > Create user: enter name, email, block and a temporary password. Give the password to the user directly.
At first login the user is forced to choose their own password (flag stored in server-only app_metadata).
Forgotten password: an admin can reset it in the Supabase dashboard (Authentication > Users); not self-service without email.

Not in this build (Part 2): students, calling, follow-ups, reports, charts, settings, user detail page.

## Part 2 additions
- Apply the second migration too (`supabase db push`): archival, last-call summary, idempotent call logging, follow-up sync, indexes.
- Day boundaries use Asia/Kolkata. Overdue = pending and due before today; Due today = pending due within today.
- Not yet built: CSV/Excel import, reports + charts + CSV export, edit-student form, bulk assignment, settings page.
- Run `npm run typecheck && npm run lint` first: nothing here has been compiled or run against a live Supabase project.
