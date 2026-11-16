import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { callValues, interestValues, mockTestValues } from '@/lib/utils/labels';

const callLogSchema = z.object({
  student_id: z.string().uuid(),
  request_id: z.string().uuid(),
  call_status: z.enum(callValues),
  interest_status: z.enum(interestValues),
  exam_applications: z.array(z.enum(['jnv', 'oav', 'none'])).max(2).optional().default([])
    .refine((values) => new Set(values).size === values.length && (!values.includes('none') || values.length === 1)),
  admit_card_downloaded: z.boolean().nullable().optional().transform((value) => value ?? null),
  interested_oav: z.boolean().nullable().optional().transform((value) => value ?? null),
  previous_mock_test_attended: z.boolean().nullable().optional().transform((value) => value ?? null),
  next_mock_test_ready: z.boolean().nullable().optional().transform((value) => value ?? null),
  mock_test_status: z.enum(mockTestValues).nullable().optional().transform((value) => value ?? null),
  notes: z.string().trim().max(2000).nullable().optional().transform((value) => value || null),
  follow_up_required: z.boolean().optional().default(false),
  follow_up_at: z.string().datetime({ offset: true }).nullable().optional(),
}).superRefine((data, context) => {
  if (data.admit_card_downloaded !== null && !data.exam_applications.includes('jnv')) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['admit_card_downloaded'], message: 'JNV application is required.' });
  }
  if (data.mock_test_status && !data.exam_applications.some((exam) => exam === 'jnv' || exam === 'oav')) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['mock_test_status'], message: 'JNV or OAV application is required.' });
  }
  if (data.follow_up_required && (!data.follow_up_at || new Date(data.follow_up_at) <= new Date())) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['follow_up_at'], message: 'A future follow-up date and time is required.' });
  }
});

const json = (body: object, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return json({ error: 'A bearer access token is required.' }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const parsed = callLogSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Invalid call log. Check the required fields and call details.' }, 400);
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return json({ error: 'Invalid or expired access token.' }, 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) {
    return json({ error: 'Unable to load account profile.' }, 500);
  }
  if (!profile || !profile.is_active) {
    return json({ error: 'Account is not active.' }, 403);
  }

  const call = parsed.data;
  const { data, error } = await supabase.from('call_logs').insert({
    student_id: call.student_id,
    called_by: user.id,
    call_status: call.call_status,
    interest_status: call.interest_status,
    exam_applications: call.exam_applications.length ? call.exam_applications : null,
    admit_card_downloaded: call.admit_card_downloaded,
    interested_oav: call.interested_oav,
    previous_mock_test_attended: call.previous_mock_test_attended,
    next_mock_test_ready: call.next_mock_test_ready,
    mock_test_status: call.mock_test_status,
    notes: call.notes,
    follow_up_required: call.follow_up_required,
    follow_up_at: call.follow_up_required ? call.follow_up_at : null,
    request_id: call.request_id,
  }).select('id, created_at').single();

  if (error?.code === '23505') {
    const { data: existing, error: lookupError } = await supabase.from('call_logs')
      .select('id, created_at')
      .eq('called_by', user.id)
      .eq('request_id', call.request_id)
      .maybeSingle();
    if (lookupError || !existing) {
      console.error('mobile recordCallLog: duplicate lookup failed', lookupError?.code);
      return json({ error: 'Could not verify the existing call log.' }, 500);
    }
    return json({ call_log: existing, duplicate: true }, 200);
  }

  if (error) {
    console.error('mobile recordCallLog: insert failed', error.code);
    if (error.code === '42501') {
      return json({ error: 'Call could not be recorded. Check that the student is active.' }, 403);
    }
    if (error.code === '23503') {
      return json({ error: 'Student was not found or is not available.' }, 404);
    }
    return json({ error: 'Could not save the call log.' }, 500);
  }

  return json({ call_log: data, duplicate: false }, 201);
}
