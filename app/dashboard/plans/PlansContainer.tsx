'use client';

import { Download } from 'lucide-react';
import { exportToCsv } from '@/lib/exportToCsv';
import { PlansStats } from "./components/PlansStats";
import { PlanCard } from "./components/PlanCard";
import { PlanTable } from "./components/PlansTable";
import { EditPlanModal } from "./components/EditPlanModal";
import { AddPlanModal } from "./components/AddPlanModal";
import { usePlans } from "./hooks/usePlans";
import { PlansSkeleton } from "../components/PageSkeletons";

export function PlansContainer() {
  const {
    plans,
    loading,
    selectedPlan,
    showAddPlan,
    setShowAddPlan,
    setSelectedPlan,
    handleAddPlan,
    handleUpdatePlan,
    handleManagePlan,
    totalSubscribers,
    totalRevenue,
    colorClasses,
  } = usePlans();

  if (loading) {
    return <PlansSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Plans</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv('plans', plans.map(p => ({
              'Plan Name': p.name,
              'Speed': p.speed,
              'Price (PHP)': p.price,
              'Subscribers': p.subscribers,
              'Monthly Revenue (PHP)': p.price * p.subscribers,
              'Status': p.isActive === false ? 'Inactive' : 'Active',
            })))}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowAddPlan(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Plan
          </button>
        </div>
      </div>

      <PlansStats totalSubscribers={totalSubscribers} totalRevenue={totalRevenue} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            totalSubscribers={totalSubscribers}
            colors={colorClasses}
            onManage={handleManagePlan}
          />
        ))}
      </div>

      <PlanTable plans={plans} totalSubscribers={totalSubscribers} />

      <AddPlanModal
        isOpen={showAddPlan}
        onClose={() => setShowAddPlan(false)}
        onSave={handleAddPlan}
      />

      <EditPlanModal
        isOpen={!!selectedPlan}
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onUpdate={handleUpdatePlan}
        totalSubscribers={totalSubscribers}
      />
    </div>
  );
}
