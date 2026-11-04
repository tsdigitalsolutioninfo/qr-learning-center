import 'server-only';
import { createClient } from '@supabase/supabase-js';
// Server-only privileged client for account provisioning and narrowly scoped public reads.
export const createAdminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
