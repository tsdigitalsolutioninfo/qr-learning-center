import AppShell from '@/components/layout/AppShell';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import BlockCardActions from '@/components/blocks/BlockCardActions';

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
      {!districts?.length && <p className="mb-6 text-sm text-neutral-600">Add a district first.</p>}
      {!blocks?.length ? <p className="text-sm text-neutral-600">No blocks yet.</p> : (
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
