'use client';
import { Wifi, Zap, Crown, Rocket } from 'lucide-react';
import { PlanType } from '../types';
import React from 'react';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (planData: Omit<PlanType, 'id' | 'clients' | 'subscribers'>) => void;
}

const iconOptions = [
  { label: "Wifi", value: "wifi", component: Wifi },
  { label: "Zap", value: "zap", component: Zap },
  { label: "Crown", value: "crown", component: Crown },
  { label: "Rocket", value: "rocket", component: Rocket },
];

export function AddPlanModal({ isOpen, onClose, onSave }: AddPlanModalProps) {
  const [newPlan, setNewPlan] = React.useState({
    name: "",
    speed: "",
    price: "",
    features: "",
    color: "indigo",
    icon: "wifi",
  });

  if (!isOpen) return null;

  const handleSave = () => {
    console.log("Form content:", newPlan);
    onSave({
      name: newPlan.name,
      speed: newPlan.speed,
      price: parseFloat(newPlan.price),
      features: newPlan.features.split(',').map(f => f.trim()),
      color: newPlan.color as PlanType['color'],
      icon: newPlan.icon,
    });
    setNewPlan({ name: "", speed: "", price: "", features: "", color: "indigo", icon: "wifi" });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-3">
        <h2 className="text-xl font-semibold mb-4">Add New Plan</h2>

        <input
          type="text"
          placeholder="Plan Name"
          className="w-full border px-3 py-2 rounded"
          value={newPlan.name}
          onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Speed (e.g. 100 Mbps)"
          className="w-full border px-3 py-2 rounded"
          value={newPlan.speed}
          onChange={(e) => setNewPlan({ ...newPlan, speed: e.target.value })}
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full border px-3 py-2 rounded"
          value={newPlan.price}
          onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
        />

        <textarea
          placeholder="Features separated by commas"
          className="w-full border px-3 py-2 rounded"
          value={newPlan.features}
          onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
        />

        <div>
          <p className="text-gray-700 mb-2">Select Icon</p>
          <div className="flex gap-4">
            {iconOptions.map((option) => {
              const IconComponent = option.component;
              const isSelected = newPlan.icon === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setNewPlan({ ...newPlan, icon: option.value })}
                  className={`p-2 rounded-lg border ${isSelected ? "border-blue-600 bg-blue-100" : "border-gray-300"}`}
                >
                  <IconComponent size={24} className={isSelected ? "text-blue-600" : "text-gray-600"} />
                </button>
              );
            })}
          </div>
        </div>

        <select
          className="w-full border px-3 py-2 rounded"
          value={newPlan.color}
          onChange={(e) => setNewPlan({ ...newPlan, color: e.target.value })}
        >
          <option value="indigo">Indigo</option>
          <option value="purple">Purple</option>
          <option value="pink">Pink</option>
          <option value="amber">Amber</option>
        </select>

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave}>
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}
