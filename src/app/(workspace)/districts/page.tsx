import AppShell from '@/components/layout/AppShell';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { toggleDistrict } from './actions';

export default async function Districts({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const profile = await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: districts } = await supabase.from('districts').select('id, name, is_active').order('name');
  return (
    <AppShell profile={profile} title="Districts">
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {!districts?.length ? <p className="text-sm text-neutral-600">No districts yet.</p> : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {districts.map((d) => (
          <li key={d.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
              <span className="break-words">{d.name} {!d.is_active && <span className="badge">Inactive</span>}</span>
              <form action={toggleDistrict}>
                <input type="hidden" name="id" value={d.id} /><input type="hidden" name="active" value={String(d.is_active)} />
                <button className="btn-outline w-full sm:w-auto">{d.is_active ? 'Deactivate' : 'Activate'}</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
