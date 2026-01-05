import { Search, Download } from 'lucide-react';

interface PaymentsSearchProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export function PaymentsSearch({ searchTerm, setSearchTerm }: PaymentsSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by client or invoice..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Export Button */}
      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
        <Download size={20} />
        Export
      </button>
    </div>
  );
}
