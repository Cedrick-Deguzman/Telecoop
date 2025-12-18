'use client';

import { PlansStats } from "./components/PlansStats";
import { PlanCard } from "./components/PlanCard";
import { PlanTable } from "./components/PlansTable";
import { EditPlanModal } from "./components/EditPlanModal";
import { AddPlanModal } from "./components/AddPlanModal";
import { usePlans } from "./hooks/usePlans";

export function PlansContainer() {
  const {
    plans,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Plans</h2>
        <button
          onClick={() => setShowAddPlan(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Plan
        </button>
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
