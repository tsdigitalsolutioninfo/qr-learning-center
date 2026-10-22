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

Not in this build (Part 2): reports, charts, settings, user detail page.

## Part 2 additions
- Apply the second migration too (`supabase db push`): archival, last-call summary, idempotent call logging, follow-up sync, indexes.
- Day boundaries use Asia/Kolkata. Overdue = pending and due before today; Due today = pending due within today.
- Student imports: admins can download an `.xlsx` template from Add student. Required columns are Student Name, Phone Number, District, and Block; School, Class, and Notes are optional. District and block names must match active records. Imports do not require an active correspondent for a block, and accept up to 500 rows and 5 MB; invalid rows or phone numbers already in the student list cancel the entire import. Imported students are visible to correspondents associated with their block once a correspondent is active.
- Not yet built: reports + charts + CSV export, edit-student form, settings page.
- Run `npm run typecheck && npm run lint` first: nothing here has been compiled or run against a live Supabase project.
