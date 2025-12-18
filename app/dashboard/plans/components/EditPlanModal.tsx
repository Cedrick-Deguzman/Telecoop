'use client';
import { X } from 'lucide-react';
import { PlanType } from '../types';
import React from 'react';

interface EditPlanModalProps {
  plan: PlanType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPlan: PlanType) => void;
  totalSubscribers: number;
}

export function EditPlanModal({ plan, isOpen, onClose, onUpdate, totalSubscribers }: EditPlanModalProps) {
  const [editingFeatures, setEditingFeatures] = React.useState<string[]>(plan?.features || []);
  const [planStatus, setPlanStatus] = React.useState(plan?.isActive === 1 ? 'true' : 'false');

  React.useEffect(() => {
    if (plan) {
      setEditingFeatures(plan.features);
      setPlanStatus(plan.isActive === 1 ? 'true' : 'false');
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const addFeature = () => setEditingFeatures([...editingFeatures, '']);
  const updateFeature = (index: number, value: string) => setEditingFeatures(editingFeatures.map((f, i) => i === index ? value : f));
  const removeFeature = (index: number) => setEditingFeatures(editingFeatures.filter((_, i) => i !== index));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...plan, features: editingFeatures, isActive: planStatus === 'true' ? 1 : 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl">Manage Plan</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Plan Name</label>
              <input type="text" name="name" defaultValue={plan.name} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Speed</label>
              <input type="text" name="speed" defaultValue={plan.speed} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Monthly Price (₱)</label>
              <input type="number" name="price" defaultValue={plan.price} step="0.01" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Status</label>
              <select name="isActive" value={planStatus} onChange={e => setPlanStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
          {/* Current Subscribers Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                <p className="text-sm text-gray-600">Current Subscribers</p>
                <p className="text-2xl mt-1">{plan.subscribers}</p>
                </div>
                <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl mt-1">₱{(plan.subscribers * plan.price).toFixed(2)}</p>
                </div>
                <div>
                <p className="text-sm text-gray-600">Market Share</p>
                <p className="text-2xl mt-1">{((plan.subscribers / totalSubscribers) * 100).toFixed(1)}%</p>
                </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm text-gray-700">Plan Features</label>
              <button type="button" onClick={addFeature} className="text-sm text-indigo-600 hover:text-indigo-700">+ Add Feature</button>
            </div>
            <div className="space-y-2">
              {editingFeatures.map((feature, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={feature} onChange={(e) => updateFeature(i, e.target.value)} placeholder="Feature description" className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  <button type="button" onClick={() => removeFeature(i)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">X</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
