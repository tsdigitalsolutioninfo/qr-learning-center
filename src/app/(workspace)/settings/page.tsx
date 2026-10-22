import { changePassword } from '@/lib/auth/actions';
import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';
import { LockKeyhole } from 'lucide-react';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const profile = await requireProfile();
  const { error, saved } = await searchParams;
  return (
    <AppShell profile={profile} title="Settings">
      <div className="max-w-2xl overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white shadow-[0_10px_28px_-22px_rgba(23,25,87,.3)]">
        <div className="flex items-center gap-3 border-b border-[#eeeadd] px-5 py-5 sm:px-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbf5dc] text-[#776117]"><LockKeyhole aria-hidden="true" size={20} /></span>
          <div><h2 className="text-lg font-semibold text-[#171957]">Password & security</h2><p className="mt-0.5 text-sm text-neutral-500">Change the password for your workspace account.</p></div>
        </div>
        <div className="p-5 sm:p-7">
          {saved && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Your password was updated.</p>}
          {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <form action={changePassword} className="space-y-5">
            <div><label className="label" htmlFor="current_password">Current password</label><input id="current_password" name="current_password" type="password" autoComplete="current-password" required className="input" /></div>
            <div><label className="label" htmlFor="new_password">New password</label><input id="new_password" name="new_password" type="password" autoComplete="new-password" minLength={8} required className="input" /><p className="mt-1.5 text-xs text-neutral-500">Use at least 8 characters.</p></div>
            <div><label className="label" htmlFor="confirm_password">Confirm new password</label><input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} required className="input" /></div>
            <div className="flex justify-end border-t border-[#eeeadd] pt-5"><button className="btn"><LockKeyhole aria-hidden="true" size={16} /> Update password</button></div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
