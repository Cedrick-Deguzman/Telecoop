'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Receipt,
  Box,
  Infinity,
  X,
  Menu,
  LogOut,
  Wrench,
  UserCog,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

type View = 'dashboard' | 'clients' | 'billing' | 'payments' | 'plans' | 'napboxes' | 'technicians' | 'installations';

const navigation = [
  { id: 'dashboard' as View, name: 'Dashboard', icon: LayoutDashboard, note: 'Overview and activity' },
  { id: 'clients' as View, name: 'Clients', icon: Users, note: 'Subscribers and profiles' },
  { id: 'billing' as View, name: 'Monthly Billing', icon: Receipt, note: 'Invoices and due accounts' },
  { id: 'payments' as View, name: 'Payments History', icon: CreditCard, note: 'Settled collections' },
  { id: 'plans' as View, name: 'Plans', icon: Package, note: 'Packages and pricing' },
  { id: 'napboxes' as View, name: 'Napboxes', icon: Box, note: 'Port availability' },
  { id: 'technicians' as View, name: 'Technicians', icon: UserCog, note: 'Field technician management' },
  { id: 'installations' as View, name: 'Installations', icon: Wrench, note: 'Installation job tracking' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const currentView = pathname.split('/')[2] || 'dashboard';
  const currentSection = navigation.find((item) => item.id === currentView) ?? navigation[0];
  const { data: session, status } = useSession();
  const todayLabel = new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="flex min-h-screen bg-transparent text-slate-900">
      <aside
        className={`sticky top-3 m-3 flex h-[calc(100vh-1.5rem)] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0b1f3b_0%,#12325d_52%,#0d2341_100%)] text-white shadow-[0_28px_60px_rgba(13,35,65,0.28)] transition-all duration-300 ${
          sidebarOpen ? 'w-80 p-5' : 'w-[5.5rem] p-3'
        }`}
      >
        <div className={`min-h-0 flex-1 overflow-y-auto ${sidebarOpen ? 'space-y-6 pr-1' : 'space-y-7'}`}>
          <div
            className={`grid-fade relative overflow-hidden border border-white/10 bg-white/6 ${
              sidebarOpen ? 'rounded-[1.6rem] p-4' : 'rounded-[1.7rem] p-2'
            }`}
          >
            <div className={`relative flex gap-4 ${sidebarOpen ? 'items-start justify-between' : 'justify-center'}`}>
              {sidebarOpen ? (
                <div className="space-y-3">
                  <div className="flex items-center text-[2rem] leading-none">
                    <span>Telec</span>
                    <Infinity className="mx-1 mt-1 text-red-400" size={34} strokeWidth={2.4} />
                    <span>p</span>
                  </div>
                  <p className="max-w-[14rem] text-sm text-slate-300">
                    Network, subscribers, and collections in one focused workspace.
                  </p>
                </div>
              ) : null}

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`border border-white/12 bg-white/8 text-slate-100 transition hover:bg-white/12 ${
                  sidebarOpen
                    ? 'rounded-2xl p-2.5'
                    : 'flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-white/10'
                }`}
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <nav className={sidebarOpen ? 'space-y-2' : 'flex flex-col items-center gap-3'}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <a
                  key={item.id}
                  href={`/dashboard/${item.id === 'dashboard' ? '' : item.id}`}
                  title={item.name}
                  aria-label={item.name}
                  className={`nav-pill flex items-center ${
                    sidebarOpen
                      ? `gap-3 px-4 py-3 ${
                          isActive
                            ? 'border-white/18 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                            : 'text-slate-200 hover:bg-white/8'
                        }`
                      : `h-12 w-12 justify-center rounded-[1.15rem] ${
                          isActive
                            ? 'border-sky-200/30 bg-sky-300/20 text-sky-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                            : 'text-slate-200 hover:bg-white/10'
                        }`
                  }`}
                >
                  <div
                    className={`rounded-2xl ${
                      sidebarOpen
                        ? `p-2 ${isActive ? 'bg-sky-300/20 text-sky-100' : 'bg-white/8 text-slate-200'}`
                        : 'p-0'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  {sidebarOpen && (
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="truncate text-xs text-slate-300">{item.note}</p>
                    </div>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        <div className={`shrink-0 pt-4 ${sidebarOpen ? 'space-y-4' : 'flex justify-center'}`}>
          {sidebarOpen && (
            <div className="rounded-[1.4rem] border border-white/12 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Signed In</p>
              <p className="mt-2 text-base font-semibold text-white">
                {status === 'loading' ? 'Loading user...' : session?.user?.name ?? 'Telecoop Admin'}
              </p>
              <p className="mt-1 text-sm text-slate-300">{todayLabel}</p>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
            className={`flex items-center justify-center gap-3 border border-white/12 bg-white/8 text-sm font-semibold text-slate-50 transition hover:bg-red-500/90 ${
              sidebarOpen ? 'w-full rounded-[1.2rem] px-4 py-3' : 'h-12 w-12 rounded-[1.15rem]'
            }`}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 px-3 pb-4 pt-3">
        <div className="shell-panel-strong min-h-[calc(100vh-1.5rem)] overflow-hidden">
          <header className="border-b border-slate-200/70 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="section-kicker">Telecoop Control Center</p>
                <div>
                  <h1 className="text-3xl text-slate-900 sm:text-4xl">{currentSection.name}</h1>
                  <p className="mt-1 text-sm text-slate-500">{currentSection.note}</p>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 px-4 py-3 text-sm text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-900">
                  {status === 'loading' ? 'Welcome back!' : `Welcome back, ${session?.user?.name ?? 'User'}!`}
                </p>
                <p className="mt-1">{todayLabel}</p>
              </div>
            </div>
          </header>

          <div className="p-5 sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
