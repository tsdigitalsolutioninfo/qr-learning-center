import AppShell from '@/components/layout/AppShell';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import BlockCardActions from '@/components/blocks/BlockCardActions';
import { z } from 'zod';

export default async function Blocks({ searchParams }: { searchParams: Promise<{ error?: string; district?: string }> }) {
  const profile = await requireAdmin();
  const { error, district } = await searchParams;
  const supabase = await createClient();
  const { data: districts } = await supabase.from('districts').select('id, name').order('name');
  const selectedDistrict = z.string().uuid().safeParse(district).success ? district : undefined;
  let blocksQuery = supabase.from('blocks').select('id, name, is_active, districts(name)').order('name');
  if (selectedDistrict) blocksQuery = blocksQuery.eq('district_id', selectedDistrict);
  const { data: blocks } = await blocksQuery;

  return (
    <AppShell profile={profile} title="Blocks">
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {!districts?.length && <p className="mb-6 text-sm text-neutral-600">Add a district first.</p>}
      {districts?.length ? (
        <form action="/blocks" method="get" className="mb-4 flex items-center gap-2">
          <label htmlFor="district-filter" className="text-sm font-medium text-neutral-700">District</label>
          <select id="district-filter" name="district" defaultValue={selectedDistrict ?? ''} className="input w-auto min-w-0 flex-1 py-2 text-sm">
            <option value="">All districts</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className="btn shrink-0 px-3 py-2 text-sm">Filter</button>
        </form>
      ) : null}
      {!blocks?.length ? <p className="text-sm text-neutral-600">{selectedDistrict ? 'No blocks in this district.' : 'No blocks yet.'}</p> : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {blocks.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 p-3 sm:gap-4 sm:p-4">
              <span className="min-w-0 break-words">{b.name} <span className="text-sm text-neutral-500">
                ({(b.districts as unknown as { name: string } | null)?.name})</span> {!b.is_active && <span className="badge">Inactive</span>}</span>
              <BlockCardActions id={b.id} name={b.name} active={b.is_active} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
