'use client';
import { Search, Plus, Download } from 'lucide-react';

interface ClientsSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onExport: () => void;
}

export default function ClientsSearch({
  search,
  onSearchChange,
  onAdd,
  onExport,
}: ClientsSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6 relative">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        <div className="flex items-center gap-2">
            <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
                <Download size={16} />
                Export
            </button>
            <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
                <Plus size={20} />
                Add Client
            </button>
        </div>
    </div>
  );
}
