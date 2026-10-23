import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { istDayRange, fmt } from '@/lib/utils/ist';
import { CALL_STATUSES, INTERESTS, label } from '@/lib/utils/labels';
import type { Row } from '@/lib/types';
import { AlertCircle, CalendarClock, CheckCheck, GraduationCap, Headphones, Phone, PhoneOff, RotateCcw, Star, Users, XCircle } from 'lucide-react';

const n = async (p: PromiseLike<{ count: number | null }>) => (await p).count ?? 0;

export default async function Dashboard() {
  const profile = await requireProfile();
  const admin = profile.role === 'admin';
  const supabase = await createClient();
  const { start, end } = istDayRange();
  const st = () => supabase.from('students').select('*', { count: 'exact', head: true }).is('archived_at', null);
  const cl = () => supabase.from('call_logs').select('*', { count: 'exact', head: true }).gte('created_at', start).lt('created_at', end);
  const fu = () => supabase.from('follow_ups').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  // RLS scopes every count: admins see everything, correspondents only their block.
  const [total, uncontacted, interested, notInt, calls, connected, notConn, dueToday, overdue] = await Promise.all([
    n(st()), n(st().is('last_call_at', null)),
    n(st().eq('interest_status', 'interested')), n(st().eq('interest_status', 'not_interested')),
    n(cl()), n(cl().eq('call_status', 'connected')), n(cl().neq('call_status', 'connected')),
    n(fu().gte('due_at', start).lt('due_at', end)), n(fu().lt('due_at', start)),
  ]);
  const stats: [string, number][] = admin
    ? [['Total students', total], ['Not yet contacted', uncontacted], ['Calls today', calls], ['Connected today', connected],
       ['Not connected today', notConn], ['Interested', interested], ['Not interested', notInt], ['Follow-ups due today', dueToday], ['Overdue follow-ups', overdue]]
    : [['Students in my block', total], ['Not yet contacted', uncontacted], ['Calls today', calls], ['Connected today', connected], ['Not connected today', notConn],
       ['Interested', interested], ['Follow-ups due today', dueToday], ['Overdue follow-ups', overdue]];
  const statIcons: Record<string, typeof Users> = {
    'Total students': Users,
    'Students in my block': GraduationCap,
    'Not yet contacted': Phone,
    'Calls today': Headphones,
    'Connected today': CheckCheck,
    'Not connected today': PhoneOff,
    Interested: Star,
    'Not interested': XCircle,
    'Follow-ups due today': CalendarClock,
    'Overdue follow-ups': AlertCircle,
  };

  const { data: recent } = await supabase.from('call_logs')
    .select('id, student_id, call_status, interest_status, created_at, students(student_name, blocks(name)), profiles!call_logs_called_by_fkey(full_name)')
    .order('created_at', { ascending: false }).limit(10);

  // Action list (correspondents): overdue/today follow-ups > callback requested > uncontacted; one entry per student.
  let actions: { id: string; name: string; why: string }[] = [];
  if (!admin) {
    const [{ data: f }, { data: cb }, { data: nc }] = await Promise.all([
      supabase.from('follow_ups').select('student_id, due_at, students(student_name)').eq('status', 'pending').lt('due_at', end).order('due_at').limit(20),
      supabase.from('students').select('id, student_name').is('archived_at', null).eq('last_call_status', 'call_back_requested').limit(10),
      supabase.from('students').select('id, student_name').is('archived_at', null).is('last_call_at', null).limit(10),
    ]);
    const seen = new Set<string>();
    const add = (id: string, name: string, why: string) => { if (!seen.has(id)) { seen.add(id); actions.push({ id, name, why }); } };
    (f as Row[] | null)?.forEach((x) => add(x.student_id, x.students?.student_name, x.due_at < start ? 'Overdue follow-up' : 'Follow-up due today'));
    cb?.forEach((x) => add(x.id, x.student_name, 'Asked for a call back'));
    nc?.forEach((x) => add(x.id, x.student_name, 'Not yet contacted'));
    actions = actions.slice(0, 15);
  }
  const rows = (recent ?? []) as Row[];
  return (
    <AppShell profile={profile} title={admin ? 'Dashboard' : 'My Dashboard'}>
      <div className="pb-8 sm:pb-0">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map(([l, v]) => {
          const Icon = statIcons[l] ?? RotateCcw;
          const urgent = l === 'Overdue follow-ups';
          return <div key={l} className="card flex min-h-28 flex-col justify-between gap-3 transition-shadow hover:shadow-[0_12px_30px_-18px_rgba(23,25,87,.3)] sm:min-h-32 sm:gap-4">
            <div className="flex items-start justify-between gap-2"><div className="text-2xl font-semibold tracking-tight text-[#171957] sm:text-3xl">{v}</div><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${urgent ? 'bg-rose-50 text-rose-700' : 'bg-[#fbf5dc] text-[#776117]'}`}><Icon aria-hidden="true" size={18} strokeWidth={1.8} /></span></div>
            <div className="text-sm font-medium leading-5 text-neutral-600">{l}</div>
          </div>;
        })}
      </div>
      {!admin && (
        <section className="mt-6"><h2 className="mb-2 font-medium">Needs action</h2>
          {!actions.length ? <p className="text-sm text-neutral-600">Nothing needs action right now.</p> : (
            <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
              {actions.map((a) => (
                <li key={a.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
                  <div className="min-w-0"><Link href={`/students/${a.id}`} className="break-words font-medium underline">{a.name}</Link><div className="text-sm text-neutral-600">{a.why}</div></div>
                  <Link href={`/students/${a.id}/call`} className="btn w-full sm:w-auto">Call</Link>
                </li>))}
            </ul>)}
        </section>)}
      <section className="mt-6"><h2 className="mb-2 font-medium">Recent call activity</h2>
        {!rows.length ? <p className="text-sm text-neutral-600">No calls recorded yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-neutral-600"><tr>
            <th className="p-2">Student</th><th>Block</th><th>By</th><th>Call</th><th>Interest</th><th>When</th></tr></thead><tbody>
            {rows.map((r) => (<tr key={r.id} className="border-b"><td className="p-2"><Link className="underline" href={`/students/${r.student_id}`}>{r.students?.student_name}</Link></td>
              <td>{r.students?.blocks?.name}</td><td>{r.profiles?.full_name}</td><td>{label(CALL_STATUSES, r.call_status)}</td>
              <td>{label(INTERESTS, r.interest_status)}</td><td>{fmt(r.created_at)}</td></tr>))}
          </tbody></table></div>)}
      </section>
      </div>
    </AppShell>
  );
}
