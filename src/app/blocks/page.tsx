import AppShell from '@/components/layout/AppShell';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { addBlock, toggleBlock } from './actions';

export default async function Blocks({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const profile = await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();
  const [{ data: districts }, { data: blocks }] = await Promise.all([
    supabase.from('districts').select('id, name').eq('is_active', true).order('name'),
    supabase.from('blocks').select('id, name, is_active, districts(name)').order('name'),
  ]);
  return (
    <AppShell profile={profile} title="Blocks">
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {!districts?.length ? <p className="mb-6 text-sm text-neutral-600">Add a district first.</p> : (
        <form action={addBlock} className="mb-6 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <div><label className="label" htmlFor="district_id">District</label>
            <select id="district_id" name="district_id" required className="input">
              {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></div>
          <div><label className="label" htmlFor="name">Block name</label><input id="name" name="name" required className="input" /></div>
          <div className="flex items-end"><button className="btn w-full">Add block</button></div>
        </form>
      )}
      {!blocks?.length ? <p className="text-sm text-neutral-600">No blocks yet.</p> : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {blocks.map((b) => (
            <li key={b.id} className="flex items-center justify-between p-3">
              <span>{b.name} <span className="text-sm text-neutral-500">
                ({(b.districts as unknown as { name: string } | null)?.name})</span> {!b.is_active && <span className="badge">Inactive</span>}</span>
              <form action={toggleBlock}>
                <input type="hidden" name="id" value={b.id} /><input type="hidden" name="active" value={String(b.is_active)} />
                <button className="btn-outline">{b.is_active ? 'Deactivate' : 'Activate'}</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
