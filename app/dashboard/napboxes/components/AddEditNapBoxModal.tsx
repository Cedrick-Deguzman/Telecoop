import { useState } from 'react';
import { X } from 'lucide-react';
import { NapBox } from '../types';

export function AddEditNapBoxModal({
  napBox,
  onClose,
  onSaved,
}: {
  napBox: NapBox | null;
  onClose: () => void;
  onSaved: (napBox: NapBox) => void;
}) {
  const [form, setForm] = useState({
    name: napBox?.name ?? '',
    location: napBox?.location ?? '',
    totalPorts: napBox?.totalPorts ?? 24,
    status: napBox?.status ?? 'active',
    installDate: napBox?.installDate?.split('T')[0] ?? '',
  });

  async function handleSubmit() {
    const res = await fetch('/api/napboxes', {
      method: napBox ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id: napBox?.id }),
    });

    const data = await res.json();
    if (res.ok) onSaved(data);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl">
            {napBox ? 'Edit NAP Box' : 'Add NAP Box'}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
            onClose();
          }}
          className="space-y-4"
        >
        <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Total Ports</label>
            <input
            type="number"
            value={form.totalPorts}
            onChange={(e) => setForm({ ...form, totalPorts: parseInt(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as NapBox['status'] })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Install Date</label>
            <input
            type="date"
            value={form.installDate}
            onChange={(e) => setForm({ ...form, installDate: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        </div>
        <div className="mt-6">
        <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
            {napBox ? 'Save Changes' : 'Add NAP Box'}
        </button>
        </div>
        </form>
      </div>
    </div>
  );
}
