import { Search, Download } from 'lucide-react';
import { BillingRecord } from '../types';

interface BillingSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: 'all' | BillingRecord['status'];
  setStatusFilter: (value: 'all' | BillingRecord['status']) => void;
  dueFilter: 'all' | 15 | 30;
  setDueFilter: (value: 'all' | 15 | 30) => void;
  monthFilter: 'all' | number;
  setMonthFilter: (value: 'all' | number) => void;
}

export function BillingSearch({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dueFilter,
  setDueFilter,
  monthFilter,
  setMonthFilter,
}: BillingSearchProps) {
  return (
    <div className="shell-panel p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="section-kicker">Filters</p>
          <h3 className="text-2xl text-slate-950">Refine the current billing cycle</h3>
          <p className="text-sm text-slate-500">
            Search by client, then narrow by payment status, billing month, or due-date window.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.75fr))]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by client name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | BillingRecord['status'])}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
        >
          <option value="all">All Months</option>
          <option value={0}>January</option>
          <option value={1}>February</option>
          <option value={2}>March</option>
          <option value={3}>April</option>
          <option value={4}>May</option>
          <option value={5}>June</option>
          <option value={6}>July</option>
          <option value={7}>August</option>
          <option value={8}>September</option>
          <option value={9}>October</option>
          <option value={10}>November</option>
          <option value={11}>December</option>
        </select>

        <select
          value={dueFilter}
          onChange={(e) => setDueFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 15 | 30))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
        >
          <option value="all">All Due Dates</option>
          <option value={15}>Due by 15</option>
          <option value={30}>End of Month</option>
        </select>
      </div>
    </div>
  );
}
