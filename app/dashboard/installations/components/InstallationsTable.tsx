import { Installation } from '../types';
import { Pencil, User, Calendar, UserPlus, CheckCircle2, Phone, MapPin } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
  rescheduled: 'bg-purple-100 text-purple-700',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
  rescheduled: 'Rescheduled',
};

function fmt(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  installations: Installation[];
  onEdit: (i: Installation) => void;
  onConvert: (i: Installation) => void;
}

export function InstallationsTable({ installations, onEdit, onConvert }: Props) {
  if (!installations.length) {
    return (
      <div className="shell-panel px-5 py-16 text-center text-slate-400">
        <p className="text-lg font-medium">No job orders found</p>
        <p className="text-sm mt-1">Click "New Job Order" to start tracking an installation.</p>
      </div>
    );
  }

  return (
    <div className="shell-panel overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200/70 bg-slate-50/60">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Prospect</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Technician</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Scheduled</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {installations.map(i => {
            const isConverted = !!i.clientId;
            const canConvert = i.status === 'completed' && !isConverted;
            return (
              <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{i.prospectName ?? '—'}</p>
                  {i.prospectPhone && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone size={11} />{i.prospectPhone}
                    </p>
                  )}
                  {i.prospectAddress && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} />{i.prospectAddress}
                    </p>
                  )}
                  {isConverted && (
                    <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={11} /> Client Added
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {i.technician
                    ? <span className="flex items-center gap-1.5"><User size={13} className="text-slate-400" />{i.technician.name}</span>
                    : <span className="text-slate-300">Unassigned</span>}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" />{fmt(i.scheduledDate)}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[i.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {STATUS_LABEL[i.status] ?? i.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {canConvert && (
                      <button
                        onClick={() => onConvert(i)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <UserPlus size={12} /> Convert to Client
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(i)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
