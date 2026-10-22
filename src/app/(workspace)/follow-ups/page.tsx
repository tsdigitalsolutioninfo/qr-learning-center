import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ConfirmButton from '@/components/ui/ConfirmButton';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { fmt, istDayRange } from '@/lib/utils/ist';
import { telHref } from '@/lib/utils/phone';
import type { Row } from '@/lib/types';
import { completeFollowUp, rescheduleFollowUp, cancelFollowUp } from './actions';

const VIEWS = [['overdue', 'Overdue'], ['today', 'Due today'], ['upcoming', 'Upcoming'], ['completed', 'Completed']];
export default async function FollowUps({ searchParams }: { searchParams: Promise<{ view?: string; error?: string; saved?: string }> }) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const view = VIEWS.some(([k]) => k === sp.view) ? sp.view! : 'today';
  const { start, end } = istDayRange();
  const supabase = await createClient();
  let q = supabase.from('follow_ups')
    .select('id, due_at, status, completed_at, notes, student_id, students(student_name, phone_number, blocks(name)), profiles!follow_ups_assigned_to_fkey(full_name)').limit(100);
  if (view === 'overdue') q = q.eq('status', 'pending').lt('due_at', start).order('due_at');
  else if (view === 'today') q = q.eq('status', 'pending').gte('due_at', start).lt('due_at', end).order('due_at');
  else if (view === 'upcoming') q = q.eq('status', 'pending').gte('due_at', end).order('due_at');
  else q = q.eq('status', 'completed').order('completed_at', { ascending: false });
  const { data } = await q;
  const pending = view !== 'completed';
  return (
    <AppShell profile={profile} title="Follow-ups">
      {sp.error && <p role="alert" className="mb-3 text-sm text-red-700">{sp.error}</p>}
      {sp.saved && <p className="mb-3 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-800">Updated.</p>}
      <nav className="mb-4 flex gap-2 overflow-x-auto">{VIEWS.map(([k, l]) => <Link key={k} href={`/follow-ups?view=${k}`} className={k === view ? 'btn' : 'btn-outline'}>{l}</Link>)}</nav>
      {!data?.length ? <p className="text-sm text-neutral-600">Nothing here.</p> : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {(data as Row[]).map((f) => (
            <li key={f.id} className="space-y-2 p-3 text-sm">
              <div><Link href={`/students/${f.student_id}`} className="font-medium underline">{f.students?.student_name}</Link> · {f.students?.phone_number} · {f.students?.blocks?.name}
                <div className="text-neutral-600">{pending ? `Due ${fmt(f.due_at)}` : `Completed ${fmt(f.completed_at)}`} · {f.profiles?.full_name}</div>{f.notes && <div>{f.notes}</div>}</div>
              {pending && (
                <div className="flex flex-wrap items-center gap-2">
                  <a href={telHref(f.students?.phone_number)} className="btn">Call</a>
                  <form action={completeFollowUp}><input type="hidden" name="id" value={f.id} /><button className="btn-outline">Mark completed</button></form>
                  <form action={rescheduleFollowUp} className="flex gap-1"><input type="hidden" name="id" value={f.id} />
                    <input type="datetime-local" name="due_at" required className="input w-auto" aria-label="New date and time (IST)" /><button className="btn-outline">Reschedule</button></form>
                  <form action={cancelFollowUp}><input type="hidden" name="id" value={f.id} /><ConfirmButton message="Cancel this follow-up?">Cancel</ConfirmButton></form>
                </div>)}
            </li>))}
        </ul>)}
    </AppShell>
  );
}
