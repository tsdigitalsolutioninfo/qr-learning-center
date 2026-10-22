import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  return <AppShell profile={profile}>{children}</AppShell>;
}
