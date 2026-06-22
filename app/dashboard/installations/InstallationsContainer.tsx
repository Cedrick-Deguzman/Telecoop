'use client';
import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Installation } from './types';
import { useInstallations } from './hooks/useInstallations';
import { InstallationsStats } from './components/InstallationsStats';
import { InstallationsTable } from './components/InstallationsTable';
import { AddEditInstallationModal } from './components/AddEditInstallationModal';
import AddClientModal from '@/app/dashboard/clients/components/AddClientModal';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

export default function InstallationsContainer() {
  const { installations, filtered, technicians, plans, napboxes, loading, search, setSearch, statusFilter, setStatusFilter, fetchAll } = useInstallations();
  const [showJobModal, setShowJobModal] = useState(false);
  const [editing, setEditing] = useState<Installation | null>(null);
  const [convertingJob, setConvertingJob] = useState<Installation | null>(null);

  const openNew = () => { setEditing(null); setShowJobModal(true); };
  const openEdit = (i: Installation) => { setEditing(i); setShowJobModal(true); };
  const closeJobModal = () => { setShowJobModal(false); setEditing(null); };

  const handleConvert = (i: Installation) => setConvertingJob(i);
  const closeConvertModal = () => setConvertingJob(null);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="shell-panel h-16 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstallationsStats installations={installations} />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by prospect or technician..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium whitespace-nowrap"
          >
            <Plus size={16} /> New Job Order
          </button>
        </div>
      </div>

      <div className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of{' '}
        <span className="font-semibold text-slate-900">{installations.length}</span> job orders
      </div>

      <InstallationsTable installations={filtered} onEdit={openEdit} onConvert={handleConvert} />

      {showJobModal && (
        <AddEditInstallationModal
          installation={editing}
          technicians={technicians}
          onClose={closeJobModal}
          onSuccess={fetchAll}
        />
      )}

      {convertingJob && (
        <AddClientModal
          plans={plans}
          napboxes={napboxes}
          defaultName={convertingJob.prospectName ?? ''}
          defaultPhone={convertingJob.prospectPhone ?? ''}
          defaultInstallationDate={convertingJob.completedDate?.slice(0, 10) ?? ''}
          installationId={convertingJob.id}
          onClose={closeConvertModal}
          onSuccess={() => { closeConvertModal(); void fetchAll(); }}
        />
      )}
    </div>
  );
}
