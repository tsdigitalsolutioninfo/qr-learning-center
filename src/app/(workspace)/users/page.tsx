import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { toggleUser } from './actions';

type Row = { id: string; full_name: string; is_active: boolean; blocks: { name: string; districts: { name: string } | null } | null };

export default async function Users({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const profile = await requireAdmin();
  const { created } = await searchParams;
  const supabase = await createClient();
  const users: Row[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data } = await supabase.from('profiles').select('id, full_name, is_active, blocks(name, districts(name))')
      .eq('role', 'block_correspondence').order('full_name').range(from, from + pageSize - 1).throwOnError();
    const page = (data ?? []) as unknown as Row[];
    users.push(...page);
    if (page.length < pageSize) break;
  }
  return (
    <AppShell profile={profile} title="Correspondence staff">
      {created && <p className="mb-3 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-800">Account created. Share the temporary password with the user securely.</p>}
      <Link href="/users/create" className="btn mb-4">Create user</Link>
      {!users.length ? <p className="text-sm text-neutral-600">No staff accounts yet.</p> : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-2 p-3">
              <div><div className="font-medium">{u.full_name} {!u.is_active && <span className="badge">Inactive</span>}</div>
                <div className="text-sm text-neutral-600">{u.blocks?.name}, {u.blocks?.districts?.name}</div></div>
              <form action={toggleUser}>
                <input type="hidden" name="id" value={u.id} /><input type="hidden" name="active" value={String(u.is_active)} />
                <button className="btn-outline">{u.is_active ? 'Deactivate' : 'Activate'}</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
