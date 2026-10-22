import { signIn } from '@/lib/auth/actions';
import { ArrowRight, BookOpenCheck, LockKeyhole, MapPin, Sparkles } from 'lucide-react';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f6f3] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#102c26] px-12 py-10 text-white lg:flex xl:px-20">
        <div className="pointer-events-none absolute -right-40 -top-32 h-[34rem] w-[34rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-16 -top-4 h-[27rem] w-[27rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-56 -left-40 h-[34rem] w-[34rem] rounded-full bg-[#d58b45]/15 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e0a057] text-[#102c26] shadow-lg shadow-black/10">
            <BookOpenCheck aria-hidden="true" size={22} />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide">ODISHA</p>
            <p className="text-xs text-white/60">EXAM OUTREACH</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl py-16">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#f0c58f]">
            <Sparkles aria-hidden="true" size={14} /> A clearer path to opportunity
          </span>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
            Every student deserves a chance to shine.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/65">
            One place to connect with students, coordinate outreach, and keep every follow-up moving forward.
          </p>
          <div className="mt-12 flex items-center gap-3 text-sm text-white/60">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-[#f0c58f]"><MapPin aria-hidden="true" size={16} /></span>
            Supporting communities across Odisha
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/40">
          <span>Odisha Exam Outreach Manager</span>
          <span>Education • Access • Opportunity</span>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e0a057]/10 blur-3xl lg:hidden" />
        <div className="relative w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102c26] text-[#f0c58f] shadow-md">
              <BookOpenCheck aria-hidden="true" size={22} />
            </span>
            <div>
              <p className="text-sm font-bold tracking-wide text-[#102c26]">ODISHA</p>
              <p className="text-xs tracking-wider text-neutral-500">EXAM OUTREACH</p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200/80 bg-white p-7 shadow-[0_24px_80px_-36px_rgba(16,44,38,0.28)] sm:p-10">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3ef] text-[#235545]">
                <LockKeyhole aria-hidden="true" size={21} />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a46a2e]">Welcome back</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#172a25]">Sign in to your workspace</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">Use the account provided by your administrator to continue.</p>
            </div>

            {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <form action={signIn} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800" htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="min-h-12 w-full rounded-xl border border-neutral-200 bg-[#fbfcfb] px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#51796a] focus:bg-white focus:ring-4 focus:ring-[#51796a]/10" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-800" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Enter your password" className="min-h-12 w-full rounded-xl border border-neutral-200 bg-[#fbfcfb] px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#51796a] focus:bg-white focus:ring-4 focus:ring-[#51796a]/10" />
              </div>
              <button className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173d32] px-4 text-sm font-semibold text-white shadow-lg shadow-[#173d32]/15 transition hover:bg-[#225746] focus:outline-none focus:ring-4 focus:ring-[#51796a]/20">
                Sign in <ArrowRight aria-hidden="true" size={17} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
            <p className="mt-6 text-center text-xs leading-5 text-neutral-400">Having trouble accessing your account? Contact your administrator.</p>
          </div>
          <p className="mt-6 text-center text-xs text-neutral-400">Secure access for authorized outreach teams</p>
        </div>
      </section>
    </main>
  );
}
