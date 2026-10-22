import AppShell from '@/components/layout/AppShell';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { createStaff } from '../actions';

export default async function CreateUser({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const profile = await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: districts } = await supabase.from('districts').select('id, name, blocks(id, name, is_active)').eq('is_active', true).order('name');
  const hasBlocks = districts?.some((d) => d.blocks.some((b) => b.is_active));
  return (
    <AppShell profile={profile} title="Create staff account">
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {!hasBlocks ? <p className="text-sm text-neutral-600">Add a district and a block before creating staff.</p> : (
        <form action={createStaff} className="max-w-md space-y-3">
          <div><label className="label" htmlFor="full_name">Full name</label><input id="full_name" name="full_name" required className="input" /></div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" /></div>
          <div><label className="label" htmlFor="password">Temporary password</label>
            <input id="password" name="password" type="text" minLength={8} required autoComplete="off" className="input" />
            <p className="mt-1 text-xs text-neutral-600">Share it directly with the user (not by public channels). They must change it at first login.</p></div>
          <div><label className="label" htmlFor="block_id">District and block</label>
            <select id="block_id" name="block_id" required className="input">
              {districts!.map((d) => (
                <optgroup key={d.id} label={d.name}>
                  {d.blocks.filter((b) => b.is_active).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </optgroup>
              ))}
            </select></div>
          <div><label className="label" htmlFor="is_active">Account status</label>
            <select id="is_active" name="is_active" className="input"><option value="true">Active</option><option value="false">Inactive</option></select></div>
          <p className="text-sm text-neutral-600">Role: block correspondence. </p>
          <button className="btn w-full">Create account</button>
        </form>
      )}
    </AppShell>
  );
}
