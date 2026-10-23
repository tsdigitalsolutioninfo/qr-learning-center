'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState } from 'react';
import AddDistrictModal from '@/components/districts/AddDistrictModal';
import AddBlockModal from '@/components/blocks/AddBlockModal';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Menu,
  LogOut,
  Settings,
  UserRound,
  Map,
  Phone,
  Users,
  X,
} from 'lucide-react';
import { signOut } from '@/lib/auth/actions';
import type { Profile } from '@/lib/auth/session';

const ShellAlreadyRendered = createContext(false);

function titleForPath(pathname: string, role: Profile['role']) {
  if (pathname === '/dashboard') return role === 'admin' ? 'Dashboard' : 'My Dashboard';
  if (pathname === '/students') return role === 'admin' ? 'Students' : 'Block Students';
  if (pathname === '/students/new') return 'Add student';
  if (/^\/students\/[^/]+\/call$/.test(pathname)) return 'Record call result';
  if (/^\/students\/[^/]+$/.test(pathname)) return 'Student details';
  if (pathname === '/calls') return role === 'admin' ? 'Calls' : 'Call History';
  if (pathname === '/follow-ups') return 'Follow-ups';
  if (pathname === '/districts') return 'Districts';
  if (pathname === '/blocks') return 'Blocks';
  if (pathname === '/users/create') return 'Create staff account';
  if (pathname === '/users') return 'Correspondence staff';
  if (pathname === '/settings') return 'Settings';
  return 'Workspace';
}

const ADMIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/follow-ups', label: 'Follow-ups', icon: ClipboardList },
  { href: '/districts', label: 'Districts', icon: Map },
  { href: '/blocks', label: 'Blocks', icon: Building2 },
  { href: '/users', label: 'Correspondence', icon: Users },
];

const CS_NAV = [
  { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'My Students', icon: Users },
  { href: '/calls', label: 'Call History', icon: Phone },
  { href: '/follow-ups', label: 'Follow-ups', icon: ClipboardList },
];

export default function AppShell({ profile, title, children }: { profile: Profile; title?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const alreadyRendered = useContext(ShellAlreadyRendered);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const nav = profile.role === 'admin' ? ADMIN_NAV : CS_NAV;
  const pageTitle = title ?? titleForPath(pathname, profile.role);

  if (alreadyRendered) return <>{children}</>;

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
    <ShellAlreadyRendered.Provider value={true}>
    <div className="min-h-screen bg-[#f8f7f1] md:flex">
      <aside className={`relative hidden shrink-0 bg-[#10133f] text-white transition-[width] duration-200 md:flex md:min-h-screen md:flex-col ${collapsed ? 'md:w-[4.5rem]' : 'md:w-[17rem]'}`}>
        <div className={`flex h-16 items-center border-b border-white/10 ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}>
          <Image src="/brand-logo.png" alt="QR Learning Center Deogarh" width={40} height={40} priority className={`h-10 w-10 shrink-0 object-contain ${collapsed ? 'hidden' : ''}`} />
          <span className={`min-w-0 text-[13px] font-semibold leading-tight tracking-tight ${collapsed ? 'sr-only' : ''}`}>QR Learning Center<span className="block text-[11px] font-medium text-white/60">Deogarh</span></span>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#d3b13b] focus:ring-offset-2 focus:ring-offset-[#10133f] ${collapsed ? 'mx-auto' : 'ml-auto'}`}
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
          <Image src="/brand-logo.png" alt="" width={36} height={36} priority className="h-9 w-9 shrink-0 object-contain md:hidden" />
          <span className="min-w-0 md:hidden">
            <span className="block truncate text-xs font-semibold leading-tight tracking-tight text-[#171957]">QR Learning Center</span>
            <span className="mt-0.5 block text-[10px] font-medium leading-tight text-neutral-500">Deogarh</span>
          </span>
          {collapsed && <div className="hidden items-center gap-2 md:flex">
            <Image src="/brand-logo.png" alt="" width={36} height={36} priority className="h-9 w-9 shrink-0 object-contain" />
            <span className="text-[13px] font-semibold leading-tight tracking-tight text-[#171957]">QR Learning Center<span className="block text-[11px] font-medium text-neutral-500">Deogarh</span></span>
          </div>}
          </div>
          <div className="relative flex shrink-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="max-w-56 truncate text-sm font-semibold text-[#17172b]">{profile.full_name}</p>
              <p className="text-xs text-neutral-500">{profile.role === 'admin' ? 'Administrator workspace' : 'Block correspondence workspace'}</p>
            </div>
            <button type="button" onClick={() => setProfileMenuOpen((open) => !open)} aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={profileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e9e4cf] bg-[#fbf5dc] text-[#171957] transition hover:bg-[#f5edc8] focus:outline-none focus:ring-4 focus:ring-[#171957]/10">
              <UserRound aria-hidden="true" size={19} />
            </button>
            {profileMenuOpen && <>
              <button type="button" aria-label="Close profile menu" className="fixed inset-0 z-30 cursor-default" onClick={() => setProfileMenuOpen(false)} />
              <div role="menu" aria-label="Profile options" className="absolute right-0 top-full z-40 mt-3 w-64 overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white p-1.5 shadow-[0_18px_45px_-20px_rgba(23,25,87,.35)]">
                <div className="border-b border-[#eeeadd] px-3 py-3 sm:hidden"><p className="truncate text-sm font-semibold text-[#17172b]">{profile.full_name}</p><p className="mt-0.5 text-xs text-neutral-500">{profile.role === 'admin' ? 'Administrator workspace' : 'Block correspondence workspace'}</p></div>
                <Link role="menuitem" href="/settings" onClick={() => setProfileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#26274e] hover:bg-[#fbfaf6]"><Settings aria-hidden="true" size={17} className="text-neutral-500" /> Settings</Link>
                <form action={signOut}>
                  <button role="menuitem" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"><LogOut aria-hidden="true" size={17} /> Log out</button>
                </form>
              </div>
            </>}
          </div>
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
          <div className={`mb-5 flex ${pathname === '/students' || pathname === '/districts' || pathname === '/blocks' || pathname === '/users' ? 'flex-row items-center' : 'flex-col items-start'} justify-between gap-3 border-b border-[#e9e4cf] pb-4 sm:mb-7 sm:flex-row sm:items-center sm:gap-4 sm:pb-5`}>
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a711d] sm:text-[11px] sm:tracking-[0.18em]">QR Learning Center | Deogarh</p>
              <h1 className="text-xl font-semibold tracking-tight text-[#171957] sm:text-2xl md:text-[1.75rem]">{pageTitle}</h1>
            </div>
            {pathname === '/districts' && profile.role === 'admin' ? <AddDistrictModal /> : pathname === '/blocks' && profile.role === 'admin' ? <AddBlockModal /> : pathname === '/users' && profile.role === 'admin' ? <Link href="/users/create" className="btn shrink-0 px-3">Create user</Link> : (pathname === '/students' && profile.role === 'admin' && (
              <Link href="/students/new" className="btn shrink-0 px-3 sm:w-auto">Add student</Link>
            ))}
          </div>
          {children}
        </main>
      </div>
    </div>
    </ShellAlreadyRendered.Provider>
  );
}
