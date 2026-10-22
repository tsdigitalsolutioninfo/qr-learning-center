import { setPassword } from '@/lib/auth/actions';
import Image from 'next/image';
import { LockKeyhole } from 'lucide-react';
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#e9e4cf] bg-white p-7 shadow-[0_24px_80px_-36px_rgba(23,25,87,0.2)] sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/brand-logo.png" alt="QR Learning Center Deogarh logo" width={56} height={56} className="h-14 w-14 object-contain" />
          <div><p className="text-sm font-bold tracking-wide text-[#171957]">QR LEARNING CENTER</p><p className="text-xs tracking-wider text-neutral-500">DEOGARH</p></div>
        </div>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f0d1] text-[#171957]"><LockKeyhole aria-hidden="true" size={21} /></div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#171957]">Choose a new password</h1>
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
