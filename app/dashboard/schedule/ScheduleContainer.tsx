'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, User, MapPin, Phone } from 'lucide-react';
import { Installation, InstallationStatus } from '../installations/types';

const STATUS_CONFIG: Record<InstallationStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
  pending:     { label: 'Pending',     bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-200' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   border: 'border-blue-200'  },
  completed:   { label: 'Completed',   bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400',  border: 'border-green-200' },
  failed:      { label: 'Failed',      bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-400',    border: 'border-red-200'   },
  rescheduled: { label: 'Rescheduled', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400', border: 'border-purple-200'},
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function toDateKey(dateStr: string) {
  return dateStr.slice(0, 10);
}

function makeDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function ScheduleContainer() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayKey = makeDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string>(todayKey);

  const fetchInstallations = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/installations');
      const data = await res.json();
      setInstallations(data);
    } catch (err) {
      console.error('Failed to fetch installations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchInstallations(); }, [fetchInstallations]);

  const byDate = installations.reduce<Record<string, Installation[]>>((acc, inst) => {
    if (!inst.scheduledDate) return acc;
    const key = toDateKey(inst.scheduledDate);
    (acc[key] ??= []).push(inst);
    return acc;
  }, {});

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDay(todayKey);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const monthTotal = Object.entries(byDate)
    .filter(([k]) => k.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))
    .reduce((sum, [, arr]) => sum + arr.length, 0);

  const selectedInstalls = byDate[selectedDay] ?? [];

  const selectedLabel = new Intl.DateTimeFormat('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date(selectedDay + 'T00:00:00'));

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="shell-panel h-16 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar: legend + stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(Object.entries(STATUS_CONFIG) as [InstallationStatus, typeof STATUS_CONFIG[InstallationStatus]][]).map(([key, cfg]) => (
            <span key={key} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{monthTotal}</span> job{monthTotal !== 1 ? 's' : ''} this month
          </span>
          <button
            onClick={goToday}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
        {/* Calendar */}
        <div className="shell-panel overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500 hover:text-slate-800">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500 hover:text-slate-800">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">
            {DAYS.map(d => (
              <div key={d} className="py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 divide-x divide-slate-100">
            {cells.map((day, i) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="min-h-[110px] border-b border-slate-100 bg-slate-50/40"
                  />
                );
              }

              const key          = makeDateKey(viewYear, viewMonth, day);
              const dayInstalls  = byDate[key] ?? [];
              const isToday      = key === todayKey;
              const isSelected   = key === selectedDay;
              const hasJobs      = dayInstalls.length > 0;

              return (
                <div
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  className={`min-h-[110px] border-b border-slate-100 p-2 cursor-pointer transition-colors select-none ${
                    isSelected
                      ? 'bg-indigo-50/80'
                      : hasJobs
                      ? 'hover:bg-slate-50'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Day number */}
                  <div className="mb-1.5 flex justify-start">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Job pills */}
                  <div className="space-y-0.5">
                    {dayInstalls.slice(0, 3).map(inst => {
                      const cfg  = STATUS_CONFIG[inst.status];
                      const name = inst.prospectName ?? inst.client?.name ?? 'Unknown';
                      return (
                        <div
                          key={inst.id}
                          className={`truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${cfg.bg} ${cfg.text}`}
                        >
                          {name}
                        </div>
                      );
                    })}
                    {dayInstalls.length > 3 && (
                      <p className="pl-1 text-[10px] font-medium text-slate-400">
                        +{dayInstalls.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="shell-panel overflow-hidden flex flex-col max-h-[calc(100vh-240px)] sticky top-6">
          <div className="px-5 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <CalendarDays size={17} className="text-indigo-500 shrink-0" />
              <h3 className="font-semibold text-slate-900 text-sm leading-tight">{selectedLabel}</h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {selectedInstalls.length === 0
                ? 'No jobs scheduled'
                : `${selectedInstalls.length} job${selectedInstalls.length > 1 ? 's' : ''} scheduled`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedInstalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <CalendarDays size={38} className="text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-400">No installations</p>
                <p className="text-xs text-slate-300 mt-1">Click a day with jobs to see details</p>
              </div>
            ) : (
              selectedInstalls.map(inst => {
                const cfg  = STATUS_CONFIG[inst.status];
                const name = inst.prospectName ?? inst.client?.name ?? 'Unknown';
                return (
                  <div key={inst.id} className={`rounded-xl border p-4 space-y-2.5 ${cfg.border} ${cfg.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-slate-400">#{inst.id}</span>
                    </div>

                    <p className={`font-bold text-sm ${cfg.text}`}>{name}</p>

                    {inst.technician && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <User size={12} className="shrink-0 text-slate-400" />
                        <span>{inst.technician.name}</span>
                      </div>
                    )}
                    {inst.prospectPhone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone size={12} className="shrink-0 text-slate-400" />
                        <span>{inst.prospectPhone}</span>
                      </div>
                    )}
                    {inst.prospectAddress && (
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                        <span className="leading-snug">{inst.prospectAddress}</span>
                      </div>
                    )}
                    {inst.notes && (
                      <p className="border-t border-white/60 pt-2 text-xs italic text-slate-500 leading-snug">
                        {inst.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
