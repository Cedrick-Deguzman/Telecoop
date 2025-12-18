'use client';
import { useState } from 'react';
import { LayoutDashboard, Users, CreditCard, Package, Receipt, Box, Infinity, X, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

type View = 'dashboard' | 'clients' | 'billing' | 'payments' | 'plans' | 'napboxes';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const currentView = pathname.split('/')[2] || 'dashboard'; // dashboard if /dashboard
  const navigation = [
    { id: 'dashboard' as View, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients' as View, name: 'Clients', icon: Users },
    { id: 'billing' as View, name: 'Monthly Billing', icon: Receipt },
    { id: 'payments' as View, name: 'Payments History', icon: CreditCard },
    { id: 'plans' as View, name: 'Plans', icon: Package },
    { id: 'napboxes' as View, name: 'Napboxes', icon: Box },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-indigo-900 text-white transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-20'
        }`}
        >
        <div className="flex items-center justify-between p-6">
            {sidebarOpen && (
            <span className="text-2xl flex items-center">
                Telec
                <Infinity className="text-red-500 mt-2" size={35} strokeWidth={2.5} />
                p
            </span>
            )}
            <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-indigo-800"
            >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </div>

        <nav className="mt-8">
            {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
                <a
                key={item.id}
                href={`/dashboard/${item.id === 'dashboard' ? '' : item.id}`}
                className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${
                    isActive
                    ? 'bg-indigo-800 border-l-4 border-white'
                    : 'hover:bg-indigo-800'
                }`}
                >
                <Icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
                </a>
            );
            })}
        </nav>
        </aside>


      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-6">
            <h1 className="text-3xl">{navigation.find((i) => i.id === currentView)?.name}</h1>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
