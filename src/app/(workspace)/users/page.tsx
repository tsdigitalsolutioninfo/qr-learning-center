import AppShell from '@/components/layout/AppShell';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import UserCardActions from '@/components/users/UserCardActions';

type Row = { id: string; full_name: string; is_active: boolean; blocks: { name: string; districts: { name: string } | null } | null };

export default async function Users({ searchParams }: { searchParams: Promise<{ created?: string; error?: string }> }) {
  const profile = await requireAdmin();
  const { created, error } = await searchParams;
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
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {!users.length ? <p className="text-sm text-neutral-600">No staff accounts yet.</p> : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 p-3 sm:gap-4 sm:p-4">
              <div className="min-w-0"><div className="break-words font-medium">{u.full_name} {!u.is_active && <span className="badge">Inactive</span>}</div>
                <div className="text-sm text-neutral-600">{u.blocks?.name}, {u.blocks?.districts?.name}</div></div>
              <UserCardActions id={u.id} name={u.full_name} active={u.is_active} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
