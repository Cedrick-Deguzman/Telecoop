import { Technician } from '../types';
import { UserCheck, UserX, Users } from 'lucide-react';

export function TechniciansStats({ technicians }: { technicians: Technician[] }) {
  const active = technicians.filter(t => t.status === 'active').length;
  const inactive = technicians.filter(t => t.status === 'inactive' || t.status === 'on_leave').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="shell-panel px-5 py-4 flex items-center gap-4">
        <div className="rounded-2xl bg-indigo-50 p-3"><Users size={20} className="text-indigo-600" /></div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-slate-900">{technicians.length}</p>
        </div>
      </div>
      <div className="shell-panel px-5 py-4 flex items-center gap-4">
        <div className="rounded-2xl bg-emerald-50 p-3"><UserCheck size={20} className="text-emerald-600" /></div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Active</p>
          <p className="text-2xl font-bold text-slate-900">{active}</p>
        </div>
      </div>
      <div className="shell-panel px-5 py-4 flex items-center gap-4">
        <div className="rounded-2xl bg-rose-50 p-3"><UserX size={20} className="text-rose-600" /></div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Inactive / On Leave</p>
          <p className="text-2xl font-bold text-slate-900">{inactive}</p>
        </div>
      </div>
    </div>
  );
}
