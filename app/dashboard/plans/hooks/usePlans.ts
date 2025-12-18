'use client';
import { useState, useEffect } from 'react';
import { Wifi, Zap, Crown, Rocket } from 'lucide-react';
import { PlanType } from '../types';
import { totalmem } from 'os';

export function usePlans() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [editingFeatures, setEditingFeatures] = useState<string[]>([]);
  const [planStatus, setPlanStatus] = useState('true');
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    speed: '',
    price: '',
    features: '',
    color: 'indigo',
    icon: 'wifi',
  });

  const iconOptions = [
    { label: "Wifi", value: "wifi", component: Wifi },
    { label: "Zap", value: "zap", component: Zap },
    { label: "Crown", value: "crown", component: Crown },
    { label: "Rocket", value: "rocket", component: Rocket },
  ];

  const colorClasses = {
    indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', icon: 'text-indigo-600', border: 'border-indigo-200', button: 'bg-indigo-600 hover:bg-indigo-700' },
    purple: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-600", button: "bg-purple-600 hover:bg-purple-700" },
    pink: { bg: 'bg-pink-50', iconBg: 'bg-pink-100', icon: 'text-pink-600', border: 'border-pink-200', button: 'bg-pink-600 hover:bg-pink-700' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', icon: 'text-amber-600', border: 'border-amber-200', button: 'bg-amber-600 hover:bg-amber-700' },
  };

  useEffect(() => {
    const fetchPlans = async () => {
      const res = await fetch("/api/plans");
      const data = await res.json();
      setPlans(data);
    };
    fetchPlans();
  }, []);

  const handleManagePlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setEditingFeatures([...plan.features]);
    setPlanStatus(plan.isActive === 1 ? 'true' : 'false');
    setShowManageModal(true);
  };

  const handleUpdatePlan = async (updatedPlan: PlanType) => {
    
  try {
    const res = await fetch("/api/plans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPlan),
    });

    if (!res.ok) throw new Error("Failed to update plan");

    const savedPlan = await res.json();

    // Normalize for UI
    const normalizedPlan = {
      ...savedPlan,
      clients: savedPlan.clients || [],        // preserve existing clients
      subscribers: savedPlan.clients?.length || 0,
    };

    setPlans(prev => prev.map(p => p.id === normalizedPlan.id ? normalizedPlan : p));
    setShowManageModal(false);
    setSelectedPlan(null);
  } catch (error) {
    console.error(error);
    alert("Error updating plan");
  }
};


  const addFeature = () => setEditingFeatures([...editingFeatures, '']);
  const updateFeature = (index: number, value: string) => setEditingFeatures(editingFeatures.map((f, i) => i === index ? value : f));
  const removeFeature = (index: number) => setEditingFeatures(editingFeatures.filter((_, i) => i !== index));

  const handleAddPlan = async (planData: Omit<PlanType, 'id' | 'clients' | 'subscribers'>) => {
     try {
        const res = await fetch("/api/plans/add-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
        });

        if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error creating plan");
        }

        const createdPlan = await res.json();

        // Add the new plan to the state, initialize clients & subscribers
        setPlans(prev => [...prev, { ...createdPlan, clients: [], subscribers: 0 }]);

        // Reset modal state with defaults
        setNewPlan({ name: "", speed: "", price: "", features: "", color: "indigo", icon: "wifi" });
        setShowAddPlan(false);
    } catch (error) {
        console.error(error);
        alert("Error creating plan");
    }
  };

  return {
    plans,
    selectedPlan,
    showAddPlan,
    showManageModal,
    newPlan,
    editingFeatures,
    planStatus,
    iconOptions,
    colorClasses,
    setShowAddPlan,
    setSelectedPlan,
    setEditingFeatures,
    setPlanStatus,
    setNewPlan,
    handleManagePlan,
    handleUpdatePlan,
    addFeature,
    updateFeature,
    removeFeature,
    handleAddPlan,
    totalSubscribers: plans.reduce((sum, plan) => sum + (plan.subscribers || 0), 0),
    totalRevenue: plans.reduce((sum, plan) => sum + ((plan.subscribers || 0) * plan.price), 0),
  };
}
