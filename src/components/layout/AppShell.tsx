'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Menu,
  LogOut,
  Map,
  Phone,
  Users,
  X,
} from 'lucide-react';
import { signOut } from '@/lib/auth/actions';
import type { Profile } from '@/lib/auth/session';

const ADMIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/follow-ups', label: 'Follow-ups', icon: ClipboardList },
  { href: '/districts', label: 'Districts', icon: Map },
  { href: '/blocks', label: 'Blocks', icon: Building2 },
  { href: '/users', label: 'Users', icon: Users },
];

const CS_NAV = [
  { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'My Students', icon: Users },
  { href: '/calls', label: 'Call History', icon: Phone },
  { href: '/follow-ups', label: 'Follow-ups', icon: ClipboardList },
];

export default function AppShell({ profile, title, children }: { profile: Profile; title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = profile.role === 'admin' ? ADMIN_NAV : CS_NAV;

  const links = nav.map(({ href, label, icon: Icon }) => {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
    return (
      <Link
        key={href}
        href={href}
        title={collapsed ? label : undefined}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
          active ? 'bg-[#d3b13b] font-semibold text-[#10133f] shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
        } ${collapsed ? 'justify-center' : ''}`}
      >
        <Icon aria-hidden="true" size={18} className="shrink-0" />
        <span className={collapsed ? 'sr-only' : 'truncate'}>{label}</span>
      </Link>
    );
  });

  return (
    <div className="min-h-screen bg-[#f8f7f1] md:flex">
      <aside className={`relative hidden shrink-0 bg-[#10133f] text-white transition-[width] duration-200 md:flex md:min-h-screen md:flex-col ${collapsed ? 'md:w-[4.5rem]' : 'md:w-[17rem]'}`}>
        <div className={`flex h-16 items-center border-b border-white/10 ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}>
          <Image src="/brand-logo.png" alt="QR Learning Center Deogarh" width={40} height={40} priority className="h-10 w-10 shrink-0 object-contain" />
          <span className={`min-w-0 text-[13px] font-semibold leading-tight tracking-tight ${collapsed ? 'sr-only' : ''}`}>QR Learning Center<span className="block text-[11px] font-medium text-white/60">Deogarh</span></span>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/20 ${collapsed ? 'absolute left-[3.25rem] top-3 z-10' : 'ml-auto'}`}
          >
            {collapsed ? <ChevronRight aria-hidden="true" size={18} /> : <ChevronLeft aria-hidden="true" size={18} />}
          </button>
        </div>
        <div className="px-4 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
          <span className={collapsed ? 'sr-only' : ''}>Workspace</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 pb-4" aria-label="Main navigation">{links}</nav>
        <div className="border-t border-white/10 px-4 py-4 text-[11px] text-white/55">
          <span className={collapsed ? 'sr-only' : ''}>Learning · Growth · Opportunity</span>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-[#e9e4cf]/90 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#171957] hover:bg-[#f2edda] md:hidden">
            {mobileOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
          <div className="min-w-0 text-sm">
            <span className="block truncate font-semibold text-[#17172b]">{profile.full_name}</span>
            <span className="hidden text-xs text-neutral-500 sm:block">{profile.role === 'admin' ? 'Administrator workspace' : 'Block correspondence workspace'}</span>
          </div>
          </div>
          <form action={signOut}>
            <button className="btn-outline min-h-10 gap-2 px-3" aria-label="Sign out">
              <LogOut aria-hidden="true" size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </header>
        {mobileOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/30 md:hidden" />}
        <aside id="mobile-sidebar" className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[calc(100vw_-_2rem)] flex-col bg-[#10133f] text-white shadow-2xl transition-transform duration-200 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Mobile sidebar" aria-hidden={!mobileOpen}>
          <div className="flex h-[4.5rem] items-center gap-3 border-b border-white/10 px-4">
            <Image src="/brand-logo.png" alt="QR Learning Center Deogarh" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold tracking-tight text-white">QR Learning Center</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">Deogarh</p>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white">
              <X aria-hidden="true" size={19} />
            </button>
          </div>
          <p className="px-5 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Workspace</p>
          <nav className="flex flex-1 flex-col gap-1.5 px-3" aria-label="Mobile navigation">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-label={label} aria-current={active ? 'page' : undefined}
                className={`flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-3.5 text-[15px] transition-colors ${active ? 'bg-[#d3b13b] font-semibold text-[#10133f] shadow-sm' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}>
                <Icon aria-hidden="true" size={19} className="shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
          </nav>
          <div className="border-t border-white/10 px-4 py-4">
            <p className="truncate text-sm font-medium text-white">{profile.full_name}</p>
            <p className="mt-1 text-xs text-white/50">{profile.role === 'admin' ? 'Administrator' : 'Block correspondence'}</p>
          </div>
        </aside>
        <main className="mx-auto w-full max-w-7xl p-4 md:px-8 md:py-8">
          <div className="mb-7 border-b border-[#e9e4cf] pb-5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a711d]">QR Learning Center | Deogarh</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171957] md:text-[1.75rem]">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
