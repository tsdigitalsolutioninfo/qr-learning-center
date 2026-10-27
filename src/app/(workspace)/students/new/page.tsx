import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import DistrictBlockSelect from '@/components/students/DistrictBlockSelect';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { addStudent } from '../actions';
import BulkStudentUploadForm from '../BulkStudentUploadForm';

export default async function NewStudent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const profile = await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from('districts').select('id, name, blocks(id, name, is_active)').eq('is_active', true).order('name');
  const districts = (data ?? []).map((d) => ({ id: d.id, name: d.name, blocks: d.blocks.filter((b) => b.is_active) })).filter((d) => d.blocks.length);
  return (
    <AppShell profile={profile} title="Add student">
      {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!districts.length ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Add at least one active district and block before adding students.</p> : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <section className="!mt-0 overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)]">
            <div className="border-b border-[#eeeadd] px-5 py-4 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a711d]">One student</p><h2 className="mt-1 text-lg font-semibold text-[#171957]">Enter student details</h2><p className="mt-1 text-sm text-neutral-500">Add a single student to the active list.</p></div>
            <form action={addStudent} className="space-y-4 p-5 sm:p-6">
              <div><label className="label" htmlFor="student_name">Student name</label><input id="student_name" name="student_name" required autoComplete="name" className="input" /></div>
              <div><label className="label" htmlFor="phone_number">Phone number</label><input id="phone_number" name="phone_number" type="tel" inputMode="tel" required placeholder="10-digit mobile, +91 allowed" className="input" /></div>
              <DistrictBlockSelect districts={districts} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="school_name">School <span className="font-normal text-neutral-400">(optional)</span></label><input id="school_name" name="school_name" className="input" /></div>
                <div><label className="label" htmlFor="class_name">Class <span className="font-normal text-neutral-400">(optional)</span></label><input id="class_name" name="class_name" className="input" /></div>
              </div>
              <div><label className="label" htmlFor="notes">Notes <span className="font-normal text-neutral-400">(optional)</span></label><textarea id="notes" name="notes" rows={3} className="input min-h-24 resize-y" /></div>
              <button className="btn w-full">Save student</button>
            </form>
          </section>

          <section className="!mt-0 overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)]">
            <div className="border-b border-[#eeeadd] px-5 py-4 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a711d]">Many students</p><h2 className="mt-1 text-lg font-semibold text-[#171957]">Bulk upload from Excel</h2><p className="mt-1 text-sm text-neutral-500">Add a whole group using the provided workbook template.</p></div>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-xl border border-[#eeeadd] bg-[#fdfcf8] p-4">
                <p className="text-sm font-semibold text-[#26274e]">Before you upload</p>
                <ol className="mt-2 space-y-2 text-sm leading-5 text-neutral-600">
                  <li className="flex gap-2"><span className="font-semibold text-[#8a711d]">1.</span><span>Download the template and fill in student, district, and block details. Phone numbers are optional; enter a 10-digit number with or without +91.</span></li>
                  <li className="flex gap-2"><span className="font-semibold text-[#8a711d]">2.</span><span>Choose the completed <strong className="font-medium text-neutral-700">.xlsx</strong> workbook below.</span></li>
                  <li className="flex gap-2"><span className="font-semibold text-[#8a711d]">3.</span><span>Review any row errors and correct the workbook before retrying.</span></li>
                </ol>
                <Link className="btn-outline mt-4 w-full sm:w-auto" href="/students/template">Download Excel template</Link>
              </div>
              <div className="rounded-xl border border-[#e9e4cf] bg-white p-4">
                <BulkStudentUploadForm />
              </div>
              <p className="text-xs leading-5 text-neutral-500">Maximum 500 students and 5 MB per workbook. Every row is checked before import; if any row is invalid, no students are imported. Duplicate phone numbers are allowed. Students are assigned to the correspondent for their block.</p>
            </div>
          </section>
        </div>)}
    </AppShell>
  );
}
