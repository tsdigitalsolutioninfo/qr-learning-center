import { setPassword } from '@/lib/auth/actions';
import { BookOpenCheck, LockKeyhole } from 'lucide-react';
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#e5e9e5] bg-white p-7 shadow-[0_24px_80px_-36px_rgba(16,44,38,0.28)] sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#173d32] text-[#f0c58f]"><BookOpenCheck aria-hidden="true" size={21} /></span>
          <div><p className="text-sm font-bold tracking-wide text-[#173d32]">ODISHA</p><p className="text-xs tracking-wider text-neutral-500">EXAM OUTREACH</p></div>
        </div>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3ef] text-[#235545]"><LockKeyhole aria-hidden="true" size={21} /></div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#172a25]">Choose a new password</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-neutral-500">For security, replace the temporary password you were given.</p>
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <form action={setPassword} className="space-y-4">
          <div><label className="label" htmlFor="password">New password</label>
            <input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" className="input" /></div>
          <button className="btn w-full">Save password</button>
        </form>
      </section>
    </main>
  );
}
