import { Search, Plus } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export function NapBoxesSearch({ value, onChange, onAdd }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search NAP boxes by name or location..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        <Plus size={20} />
        Add NAP Box
      </button>
    </div>
  );
}
