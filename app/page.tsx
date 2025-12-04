'use client';
import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Payments } from './components/Payments';
import { Plans } from './components/Plans';
import { LayoutDashboard, Users, CreditCard, Package, Menu, X, Receipt } from 'lucide-react';
import { Billing } from './components/Billing';

type View = 'dashboard' | 'clients' | 'billing' | 'payments' | 'plans';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { id: 'dashboard' as View, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients' as View, name: 'Clients', icon: Users },
    { id: 'billing' as View, name: 'Monthly Billing', icon: Receipt },
    { id: 'payments' as View, name: 'Payments History', icon: CreditCard },
    { id: 'plans' as View, name: 'Plans', icon: Package },
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
          {sidebarOpen && <span className="text-2xl">Telecoop</span>}
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
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${
                  currentView === item.id
                    ? 'bg-indigo-800 border-l-4 border-white'
                    : 'hover:bg-indigo-800'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-6">
            <h1 className="text-3xl">
              {navigation.find((item) => item.id === currentView)?.name}
            </h1>
          </div>
        </header>

        <div className="p-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'clients' && <Clients />}
          {currentView === 'billing' && <Billing/>}
          {currentView === 'payments' && <Payments />}
          {currentView === 'plans' && <Plans />}
        </div>
      </main>
    </div>
  );
}
