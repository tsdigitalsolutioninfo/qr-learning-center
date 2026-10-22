import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth/session';
export default async function Home() {
  const p = await getProfile();
  redirect(p ? '/dashboard' : '/login');
}
