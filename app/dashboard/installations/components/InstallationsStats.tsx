import { Installation } from '../types';
import { ClipboardList, Clock, CheckCircle, XCircle } from 'lucide-react';

export function InstallationsStats({ installations }: { installations: Installation[] }) {
  const now = new Date();
  const thisMonth = installations.filter(i => {
    const d = new Date(i.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const pending = installations.filter(i => i.status === 'pending' || i.status === 'in_progress').length;
  const completed = installations.filter(i => i.status === 'completed').length;
  const failed = installations.filter(i => i.status === 'failed').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="shell-panel px-5 py-4 flex items-center gap-4">
        <div className="rounded-2xl bg-indigo-50 p-3"><ClipboardList size={20} className="text-indigo-600" /></div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">This Month</p>
          <p className="text-2xl font-bold text-slate-900">{thisMonth}</p>
        </div>
      </div>
      <div className="shell-panel px-5 py-4 flex items-center gap-4">
        <div className="rounded-2xl bg-amber-50 p-3"><Clock size={20} className="text-amber-600" /></div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-slate-900">{pending}</p>
        </div>
      </div>
      <div className="shell-panel px-5 py-4 flex items-center gap-4">
        <div className="rounded-2xl bg-emerald-50 p-3"><CheckCircle size={20} className="text-emerald-600" /></div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Completed</p>
          <p className="text-2xl font-bold text-slate-900">{completed}</p>
        </div>
      </div>
      <div className="shell-panel px-5 py-4 flex items-center gap-4">
        <div className="rounded-2xl bg-rose-50 p-3"><XCircle size={20} className="text-rose-600" /></div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Failed</p>
          <p className="text-2xl font-bold text-slate-900">{failed}</p>
        </div>
      </div>
    </div>
  );
}
