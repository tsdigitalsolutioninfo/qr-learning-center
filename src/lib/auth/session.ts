import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Profile = {
  id: string; full_name: string; role: 'admin' | 'block_correspondence'; is_active: boolean; must_change_password: boolean;
};

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('id, full_name, role, is_active').eq('id', user.id).maybeSingle();
  if (!data) return null;
  // app_metadata can only be written by the server-side admin client, so users cannot clear it themselves.
  return { ...data, must_change_password: user.app_metadata?.must_change_password === true } as Profile;
}
export async function requireProfile(): Promise<Profile> {
  const p = await getProfile();
  if (!p) redirect('/login');
  if (!p.is_active) redirect('/unauthorized?reason=inactive');
  if (p.must_change_password) redirect('/auth/set-password');
  return p;
}
export async function requireAdmin(): Promise<Profile> {
  const p = await requireProfile();
  if (p.role !== 'admin') redirect('/unauthorized');
  return p;
}
