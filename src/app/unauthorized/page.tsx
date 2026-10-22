import { signOut } from '@/lib/auth/actions';
import Image from 'next/image';
import { ShieldAlert } from 'lucide-react';
export default async function Unauthorized({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#e9e4cf] bg-white p-5 shadow-[0_24px_80px_-36px_rgba(23,25,87,0.2)] sm:p-10">
      <div className="mb-8 flex items-center gap-3">
        <Image src="/brand-logo.png" alt="QR Learning Center Deogarh logo" width={56} height={56} className="h-14 w-14 object-contain" />
        <div><p className="text-sm font-bold tracking-wide text-[#171957]">QR LEARNING CENTER</p><p className="text-xs tracking-wider text-neutral-500">DEOGARH</p></div>
      </div>
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f0d1] text-[#171957]"><ShieldAlert aria-hidden="true" size={21} /></div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#171957]">{reason === 'inactive' ? 'Account deactivated' : 'Not authorized'}</h1>
      <p className="mb-6 text-sm leading-6 text-neutral-600">
        {reason === 'inactive' ? 'Your account is inactive. Contact an administrator.' : 'You do not have permission to view this page.'}
      </p>
      <form action={signOut}><button className="btn-outline">Sign out</button></form>
      </section>
    </main>
  );
}
