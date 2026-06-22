import { Technician } from '../types';
import { Pencil, Phone, MapPin, Briefcase } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  on_leave: 'bg-amber-100 text-amber-700',
};
const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
};

interface Props {
  technicians: Technician[];
  onEdit: (t: Technician) => void;
}

export function TechniciansTable({ technicians, onEdit }: Props) {
  if (!technicians.length) {
    return (
      <div className="shell-panel px-5 py-16 text-center text-slate-400">
        <p className="text-lg font-medium">No technicians found</p>
        <p className="text-sm mt-1">Add your first technician to get started.</p>
      </div>
    );
  }

  return (
    <div className="shell-panel overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200/70 bg-slate-50/60">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Technician</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Area</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Jobs</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {technicians.map(t => (
            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-4 font-medium text-slate-900">{t.name}</td>
              <td className="px-5 py-4 text-slate-600">
                {t.contactNumber ? (
                  <span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" />{t.contactNumber}</span>
                ) : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-5 py-4 text-slate-600">
                {t.area ? (
                  <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{t.area}</span>
                ) : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Briefcase size={13} className="text-slate-400" />
                  {t._count?.installations ?? 0}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[t.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <button onClick={() => onEdit(t)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                  <Pencil size={12} /> Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
