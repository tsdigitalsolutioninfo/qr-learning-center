import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const json = (body: object, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const createSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  block_id: z.string().uuid(),
  is_active: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return json({ error: 'A bearer access token is required.' }, 401);
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return json({ error: 'Invalid or expired access token.' }, 401);
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) {
    return json({ error: 'Unable to verify admin account.' }, 500);
  }
  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    return json({ error: 'Account is not an active admin.' }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return json({
      error: 'Provide a valid name, email, password of at least 8 characters, and block id.',
    }, 400);
  }

  const input = parsed.data;
  const { data: block, error: blockError } = await admin
    .from('blocks')
    .select('id, district_id')
    .eq('id', input.block_id)
    .eq('is_active', true)
    .maybeSingle();
  if (blockError) {
    return json({ error: 'Unable to verify the selected block.' }, 500);
  }
  if (!block) {
    return json({ error: 'Selected block is not available.' }, 400);
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: { must_change_password: true },
  });
  if (createError || !created.user) {
    if (createError?.message.toLowerCase().includes('already')) {
      return json({ error: 'That email is already registered.' }, 409);
    }
    return json({ error: 'Could not create the authentication account.' }, 500);
  }

  const { error: insertError } = await admin.from('profiles').insert({
    id: created.user.id,
    full_name: input.full_name,
    role: 'block_correspondence',
    district_id: block.district_id,
    block_id: block.id,
    is_active: input.is_active,
  });
  if (insertError) {
    const { error: rollbackError } = await admin.auth.admin.deleteUser(created.user.id);
    if (rollbackError) {
      console.error('mobile createCorrespondent: auth rollback failed', rollbackError.code);
      return json({
        error: 'Profile creation failed and the authentication account could not be removed. Contact support.',
      }, 500);
    }
    return json({ error: 'Could not create the profile. No account was created.' }, 500);
  }

  return json({
    correspondent: {
      id: created.user.id,
      full_name: input.full_name,
      email: input.email,
      role: 'block_correspondence',
      is_active: input.is_active,
      district_id: block.district_id,
      block_id: block.id,
      must_change_password: true,
    },
  }, 201);
}
