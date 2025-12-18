import { Search, Download } from 'lucide-react';
import { BillingRecord } from '../types';

interface BillingSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: 'all' | BillingRecord['status'];
  setStatusFilter: (value: 'all' | BillingRecord['status']) => void;
}

export function BillingSearch({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: BillingSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by client name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Filters / Actions */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | BillingRecord['status'])
          }
          className="px-4 py-2 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>

        {/* Export (future feature) */}
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300
                     rounded-lg hover:bg-gray-50 text-sm"
        >
          <Download size={18} />
          Export
        </button>
      </div>
    </div>
  );
}
