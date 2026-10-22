'use client';

import { useActionState } from 'react';
import { bulkUploadStudents, type BulkUploadState } from './actions';

const initialState: BulkUploadState = { status: 'idle' };

export default function BulkStudentUploadForm() {
  const [state, formAction, pending] = useActionState(bulkUploadStudents, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="student_workbook">Select your workbook</label>
        <input id="student_workbook" name="file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required className="block min-h-32 w-full cursor-pointer rounded-xl border-2 border-dashed border-[#ded8bf] bg-[#fdfcf8] p-4 text-sm text-neutral-600 transition hover:border-[#c8b66e] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#f2edda] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#171957] hover:bg-[#fcfaef]" />
        <p className="mt-2 text-xs text-neutral-500">Excel workbook only (.xlsx)</p>
      </div>
      {state.status === 'success' && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{state.message}</p>}
      {state.status === 'error' && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p className="font-medium">{state.message}</p>
          {!!state.issues?.length && <ul className="mt-2 list-inside list-disc space-y-1">
            {state.issues.map((issue, index) => <li key={`${index}-${issue}`}>{issue}</li>)}
          </ul>}
          {!!state.remainingIssueCount && <p className="mt-2">And {state.remainingIssueCount} more issue(s).</p>}
        </div>
      )}
      <button className="btn w-full" disabled={pending}>{pending ? 'Checking and importing…' : 'Upload students'}</button>
    </form>
  );
}
