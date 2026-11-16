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

## Mobile admin login API
`POST /mobile-app/login/admin-login` accepts an admin's email and password:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

On success it returns the session tokens and admin profile, including `must_change_password`. Non-admin and inactive accounts are rejected.

## Mobile correspondent management API
All endpoints require an active admin's Supabase access token in `Authorization: Bearer <access_token>`.

- `GET /mobile-app/admin/correspondents` returns all correspondent accounts, including each account's `is_active` status and block/district.
- `PATCH /mobile-app/admin/correspondents` accepts a JSON body with `id` and one or more of `full_name`, `block_id`, or `is_active`. Block changes require an active block and update its district at the same time.
- `DELETE /mobile-app/admin/correspondents?id=<uuid>` permanently deletes an account when no records refer to it. It returns `409` if linked records prevent deletion; deactivate the account instead to preserve history.
- `POST /mobile-app/admin/create-correspondents` creates a correspondent from JSON fields `full_name`, `email`, `password`, and `block_id`; optional `is_active` defaults to `true`. New users must change their password at first login.

## Mobile call logging API
`POST /mobile-app/correspondant/call-logs` records a call for any active student. Any signed-in account with an active profile can use it, including admins and correspondents from other blocks. Send the Supabase access token as `Authorization: Bearer <access_token>` and a JSON body:

```json
{
  "student_id": "student-uuid",
  "request_id": "client-generated-uuid",
  "call_status": "connected",
  "interest_status": "interested",
  "exam_applications": ["jnv"],
  "admit_card_downloaded": true,
  "interested_oav": null,
  "previous_mock_test_attended": false,
  "next_mock_test_ready": true,
  "mock_test_status": "interested",
  "notes": "Asked about the next mock test.",
  "follow_up_required": true,
  "follow_up_at": "2026-12-01T10:30:00+05:30"
}
```

`student_id`, `request_id`, `call_status`, and `interest_status` are required. `call_status` accepts `connected`, `not_connected`, `busy`, `switched_off`, `invalid_number`, `disconnected`, or `call_back_requested`; `interest_status` accepts `unknown`, `interested`, `not_interested`, `maybe_later`, or `registered`. Applications are `jnv`, `oav`, or `none`; mock-test status is `interested`, `not_interested`, `already_attended`, or `not_attended_yet`. The optional application, question, notes, and follow-up fields follow the web call form's rules; booleans can be `true`, `false`, or `null`. A requested follow-up must have a future ISO 8601 timestamp. Generate a new `request_id` for each call and reuse it only when retrying that same request. New calls return `201` with `{ "call_log": { "id": "...", "created_at": "..." }, "duplicate": false }`; a recognized retry returns `200` with the existing call-log ID and `"duplicate": true`. Callers can read their own call logs; admins and correspondents can also read logs under the existing admin and same-block rules.

Not in this build (Part 2): reports, charts, settings, user detail page.

## Part 2 additions
- Apply the second migration too (`supabase db push`): archival, last-call summary, idempotent call logging, follow-up sync, indexes.
- Day boundaries use Asia/Kolkata. Overdue = pending and due before today; Due today = pending due within today.
- Student imports: admins can download an `.xlsx` template from Add student. Required columns are Student Name, Phone Number, District, and Block; School, Class, and Notes are optional. District and block names must match active records. Imports do not require an active correspondent for a block, and accept up to 500 rows and 5 MB; invalid rows or phone numbers already in the student list cancel the entire import. Imported students are visible to correspondents associated with their block once a correspondent is active.
- Not yet built: reports + charts + CSV export, edit-student form, settings page.
- Run `npm run typecheck && npm run lint` first: nothing here has been compiled or run against a live Supabase project.
