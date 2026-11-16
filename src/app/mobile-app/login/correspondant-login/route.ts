import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const json = (body: object, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'A valid email and password are required.' }, 400);
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.session || !data.user) {
    return json({ error: 'Invalid email or password.' }, 401);
  }

  const { data: profile, error: profileError } = await createAdminClient()
    .from('profiles')
    .select('id, full_name, role, is_active, district_id, block_id')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    return json({ error: 'Unable to verify correspondent account.' }, 500);
  }
  if (!profile || profile.role !== 'block_correspondence' || !profile.is_active) {
    return json({ error: 'Account is not an active correspondent.' }, 403);
  }

  return json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: data.session.token_type,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
    },
    user: {
      id: profile.id,
      email: data.user.email,
      full_name: profile.full_name,
      role: profile.role,
      district_id: profile.district_id,
      block_id: profile.block_id,
      must_change_password: data.user.app_metadata?.must_change_password === true,
    },
  }, 200);
}
