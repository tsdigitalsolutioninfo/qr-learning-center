import { notFound } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { telHref } from '@/lib/utils/phone';
import { CALL_STATUSES, INTERESTS } from '@/lib/utils/labels';
import { recordCall } from '../../actions';

export default async function RecordCall({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const profile = await requireProfile();
  const { id } = await params; const { error } = await searchParams;
  const supabase = await createClient();
  const { data: s } = await supabase.from('students').select('id, student_name, phone_number, interest_status').eq('id', id).maybeSingle();
  if (!s) notFound();
  return (
    <AppShell profile={profile} title="Record call result">
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {profile.role === 'admin' ? <p className="text-sm">Only a correspondent assigned to this block can record calls.</p> : (
        <form action={recordCall} className="max-w-md space-y-3">
          <input type="hidden" name="student_id" value={s.id} /><input type="hidden" name="request_id" value={crypto.randomUUID()} />
          <div className="card"><div className="font-medium">{s.student_name}</div><div className="text-sm">{s.phone_number}</div>
            <a href={telHref(s.phone_number)} className="btn mt-2 w-full">Call now</a>
            <p className="mt-2 text-xs text-neutral-600">Calling opens your phone dialer. Come back and record the outcome below; nothing is logged automatically.</p></div>
          <div><label className="label" htmlFor="call_status">Call status</label><select id="call_status" name="call_status" required className="input">
            {CALL_STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label className="label" htmlFor="interest_status">Student interest</label><select id="interest_status" name="interest_status" defaultValue={s.interest_status} className="input">
            {INTERESTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label className="label" htmlFor="notes">Conversation notes</label><textarea id="notes" name="notes" rows={4} className="input" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="follow_up_required" className="h-5 w-5" /> Follow-up required</label>
          <div><label className="label" htmlFor="follow_up_at">Follow-up date and time (IST)</label><input id="follow_up_at" name="follow_up_at" type="datetime-local" className="input" /></div>
          <button className="btn w-full">Save call result</button>
        </form>)}
    </AppShell>
  );
}
