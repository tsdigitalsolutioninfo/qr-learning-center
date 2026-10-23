import { signIn } from '@/lib/auth/actions';
import { getProfile } from '@/lib/auth/session';
import Image from 'next/image';
import { ArrowRight, LockKeyhole, MapPin, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const profile = await getProfile();
  if (profile) {
    if (!profile.is_active) redirect('/unauthorized?reason=inactive');
    if (profile.must_change_password) redirect('/auth/set-password');
    redirect('/dashboard');
  }

  const { error } = await searchParams;

  return (
    <main className="login-root fixed inset-0 top-0 z-0 m-0 h-dvh min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-[#f8f7f1] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-dvh flex-col justify-between overflow-hidden bg-[#10133f] px-12 py-10 text-white lg:flex xl:px-20">
        <div className="pointer-events-none absolute -right-40 -top-32 h-[34rem] w-[34rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-16 -top-4 h-[27rem] w-[27rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-56 -left-40 h-[34rem] w-[34rem] rounded-full bg-[#d3b13b]/15 blur-3xl" />

        <div className="relative z-10 flex items-center gap-4">
          <Image src="/brand-logo.png" alt="QR Learning Center Deogarh logo" width={76} height={76} priority className="h-[4.75rem] w-[4.75rem] object-contain" />
          <div>
            <p className="text-sm font-semibold tracking-wide">QR LEARNING CENTER</p>
            <p className="text-xs text-white/60">DEOGARH</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl py-16">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#ead37a]">
            <Sparkles aria-hidden="true" size={14} /> A clearer path to opportunity
          </span>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
            Every student deserves a chance to shine.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/65">
            One place to connect with students, coordinate outreach, and keep every follow-up moving forward.
          </p>
          <div className="mt-12 flex items-center gap-3 text-sm text-white/60">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-[#ead37a]"><MapPin aria-hidden="true" size={16} /></span>
            Supporting communities across Odisha
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/40">
          <span>QR Learning Center Deogarh</span>
          <span>Learning • Growth • Opportunity</span>
        </div>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center px-5 py-12 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#d3b13b]/15 blur-3xl lg:hidden" />
        <div className="relative w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image src="/brand-logo.png" alt="QR Learning Center Deogarh logo" width={60} height={60} priority className="h-[3.75rem] w-[3.75rem] object-contain" />
            <div>
              <p className="text-sm font-bold tracking-wide text-[#171957]">QR LEARNING CENTER</p>
              <p className="text-xs tracking-wider text-neutral-500">DEOGARH</p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#e9e4cf] bg-white p-5 shadow-[0_24px_80px_-36px_rgba(23,25,87,0.2)] sm:p-8 lg:p-10">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f0d1] text-[#171957]">
                <LockKeyhole aria-hidden="true" size={21} />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a711d]">Welcome back</p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#171957] sm:text-3xl">Sign in to your workspace</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">Use the account provided by your administrator to continue.</p>
            </div>

            {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <form action={signIn} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800" htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="min-h-12 w-full rounded-xl border border-[#e4dfcd] bg-[#fdfcf8] px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#6568a0] focus:bg-white focus:ring-4 focus:ring-[#171957]/10" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Enter your password" className="min-h-12 w-full rounded-xl border border-[#e4dfcd] bg-[#fdfcf8] px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#6568a0] focus:bg-white focus:ring-4 focus:ring-[#171957]/10" />
              </div>
              <button className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d3b13b] px-4 text-sm font-semibold text-[#171957] shadow-lg shadow-[#171957]/10 transition hover:bg-[#e0c65c] focus:outline-none focus:ring-4 focus:ring-[#d3b13b]/25">
                Sign in <ArrowRight aria-hidden="true" size={17} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
            <p className="mt-6 text-center text-xs leading-5 text-neutral-400">Having trouble accessing your account? Contact your administrator.</p>
          </div>
          <p className="mt-6 text-center text-xs text-neutral-400">Secure access for QR Learning Center staff</p>
        </div>
      </section>
    </main>
  );
}
