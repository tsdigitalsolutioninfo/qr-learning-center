'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });

export async function signIn(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/login?error=' + encodeURIComponent('Enter a valid email and password.'));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect('/login?error=' + encodeURIComponent('Invalid email or password.'));
  redirect('/dashboard');
}
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
export async function setPassword(formData: FormData) {
  const pw = String(formData.get('password') ?? '');
  if (pw.length < 8) redirect('/auth/set-password?error=' + encodeURIComponent('Use at least 8 characters.'));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) redirect('/auth/set-password?error=' + encodeURIComponent(error.message));
  // Clear the first-login flag (server-only privilege).
  await createAdminClient().auth.admin.updateUserById(user.id, { app_metadata: { must_change_password: false } });
  redirect('/dashboard');
}

export async function changePassword(formData: FormData) {
  const currentPassword = String(formData.get('current_password') ?? '');
  const newPassword = String(formData.get('new_password') ?? '');
  const confirmPassword = String(formData.get('confirm_password') ?? '');
  if (!currentPassword || newPassword.length < 8) redirect('/settings?error=' + encodeURIComponent('Enter your current password and a new password with at least 8 characters.'));
  if (newPassword !== confirmPassword) redirect('/settings?error=' + encodeURIComponent('The new passwords do not match.'));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login');
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
  if (verifyError) redirect('/settings?error=' + encodeURIComponent('Your current password is incorrect.'));
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) redirect('/settings?error=' + encodeURIComponent(error.message));
  redirect('/settings?saved=1');
}
