import AppShell from '@/components/layout/AppShell';
import DistrictBlockSelect from '@/components/students/DistrictBlockSelect';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { addStudent } from '../actions';

export default async function NewStudent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const profile = await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from('districts').select('id, name, blocks(id, name, is_active)').eq('is_active', true).order('name');
  const districts = (data ?? []).map((d) => ({ id: d.id, name: d.name, blocks: d.blocks.filter((b) => b.is_active) })).filter((d) => d.blocks.length);
  return (
    <AppShell profile={profile} title="Add student">
      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
      {!districts.length ? <p className="text-sm text-neutral-600">Add districts and blocks first.</p> : (
        <form action={addStudent} className="max-w-md space-y-3">
          <div><label className="label" htmlFor="student_name">Student name</label><input id="student_name" name="student_name" required className="input" /></div>
          <div><label className="label" htmlFor="phone_number">Phone number</label><input id="phone_number" name="phone_number" inputMode="tel" required placeholder="10-digit mobile, +91 allowed" className="input" /></div>
          <DistrictBlockSelect districts={districts} />
          <div><label className="label" htmlFor="school_name">School (optional)</label><input id="school_name" name="school_name" className="input" /></div>
          <div><label className="label" htmlFor="class_name">Class (optional)</label><input id="class_name" name="class_name" className="input" /></div>
          <div><label className="label" htmlFor="notes">Notes (optional)</label><textarea id="notes" name="notes" rows={3} className="input" /></div>
          <button className="btn w-full">Save student</button>
        </form>)}
    </AppShell>
  );
}
