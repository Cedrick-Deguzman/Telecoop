'use client';
import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Technician } from './types';
import { useTechnicians } from './hooks/useTechnicians';
import { TechniciansStats } from './components/TechniciansStats';
import { TechniciansTable } from './components/TechniciansTable';
import { AddEditTechnicianModal } from './components/AddEditTechnicianModal';

export default function TechniciansContainer() {
  const { technicians, filtered, loading, search, setSearch, fetchTechnicians } = useTechnicians();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Technician | null>(null);

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (t: Technician) => { setEditing(t); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shell-panel h-16 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TechniciansStats technicians={technicians} />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or area..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <Plus size={18} /> Add Technician
        </button>
      </div>

      <TechniciansTable technicians={filtered} onEdit={openEdit} />

      {showModal && (
        <AddEditTechnicianModal
          technician={editing}
          onClose={closeModal}
          onSuccess={fetchTechnicians}
        />
      )}
    </div>
  );
}
