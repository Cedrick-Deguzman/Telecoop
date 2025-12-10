import { useState, useEffect } from "react";
import { Wifi, Zap, Crown, Rocket, Users, DollarSign, TrendingUp, X } from 'lucide-react';

type PlanType = {
  id: number;
  name: string;
  speed: string;
  price: number;
  color: "indigo" | "purple" | "pink" | "amber";
  features: string[];
  clients: any[]; // you can make a Client type if needed
  isActive?: number;
  subscribers: number;
  icon: string;
};

export function Plans() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    speed: "",
    price: "",
    features: "",
    color: "",
    icon: "wifi",
  }); 
  const [selectedPlan, setSelectedPlan] = useState<PlanType| null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingFeatures, setEditingFeatures] = useState<string[]>([]);
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscribers, 0);
  const totalRevenue = plans.reduce((sum, plan) => sum + (plan.subscribers * plan.price), 0);
  const [planStatus, setPlanStatus] = useState<string>('false');

  const handleManagePlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setEditingFeatures([...plan.features]);
    setPlanStatus(plan.isActive === 1 ? 'true' : 'false');
    setShowManageModal(true);
  };

  const handleUpdatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const formData = new FormData(e.currentTarget);
    const updatedPlanData = {
      id: selectedPlan.id,
      name: formData.get('name') as string,
      speed: formData.get('speed') as string,
      price: parseFloat(formData.get('price') as string),
      isActive: planStatus === 'true' ? 1 : 0,
      features: editingFeatures,
      color: selectedPlan.color,
      icon: selectedPlan.icon,
    };

    try {
      const res = await fetch("/api/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlanData),
      });

      if (!res.ok) {
        alert("Failed to update plan");
        return;
      }

      const updatedPlan = await res.json();

      // Normalize for UI to prevent NaN issues
      const normalizedPlan = {
        ...updatedPlan,
        clients: selectedPlan.clients || [],        // preserve existing clients
        subscribers: selectedPlan.clients?.length || 0, // recalc subscribers
      };

      // Update state
      setPlans(prev => prev.map(p => p.id === selectedPlan.id ? normalizedPlan : p));

      setShowManageModal(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("Error updating plan");
    }
  };


  const addFeature = () => {
    setEditingFeatures([...editingFeatures, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...editingFeatures];
    updated[index] = value;
    setEditingFeatures(updated);
  };

  const removeFeature = (index: number) => {
    setEditingFeatures(editingFeatures.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchPlans = async () => {
      const res = await fetch("/api/plans");
      const data = await res.json();
      setPlans(data);
    };
    fetchPlans();
  }, []);

  // Color presets (dynamic UI)
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      icon: 'text-indigo-600',
      border: 'border-indigo-200',
      button: 'bg-indigo-600 hover:bg-indigo-700',
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-300",
      text: "text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700",
    },
    pink: {
      bg: 'bg-pink-50',
      iconBg: 'bg-pink-100',
      icon: 'text-pink-600',
      border: 'border-pink-200',
      button: 'bg-pink-600 hover:bg-pink-700',
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      icon: 'text-amber-600',
      border: 'border-amber-200',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
  };

  const iconOptions = [
    { label: "Wifi", value: "wifi", component: Wifi },
    { label: "Zap", value: "zap", component: Zap },
    { label: "Crown", value: "crown", component: Crown },
    { label: "Rocket", value: "rocket", component: Rocket },
  ];

  // Add Plan
  const handleAddPlan = async () => {
    const planData = {
      name: newPlan.name,
      speed: newPlan.speed,
      price: parseFloat(newPlan.price),
      features: newPlan.features.split(",").map(f => f.trim()),
      color: newPlan.color,
      icon: newPlan.icon,
    };

    const res = await fetch("/api/plans/add-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planData),
    });

    if (!res.ok) {
      alert("Error creating plan");
      return;
    }
    
    const createdPlan = await res.json(); // your API should return the created plan

      // Update state instead of full refresh
      const normalizedPlan = {
      ...createdPlan,
      clients: [],           // new plan has no clients yet
      subscribers: 0,        // so subscriber count = 0
    };

    // update state without refetch
    setPlans(prev => [...prev, normalizedPlan]);

    setShowAddPlan(false);
    setNewPlan({ name: "", speed: "", price: "", features: "", color: "", icon: "" });
    };


  return (
  <div className="space-y-6">

    {/* Header */}
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Available Plans</h2>
      <button
        onClick={() => setShowAddPlan(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        + Add Plan
      </button>
    </div>

    {/* Overview Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Users className="text-indigo-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500">Total Subscribers</p>
            <p className="text-2xl mt-1">{totalSubscribers}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500">Monthly Revenue</p>
            <p className="text-2xl mt-1">₱{totalRevenue.toFixed(2)}</p>
          </div>
          </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-full">
            <TrendingUp className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-gray-500">ARPU (Average Revenue Per Unit)</p>
             <p className="text-2xl mt-1">
              ₱{totalSubscribers > 0 ? (totalRevenue / totalSubscribers).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Plans Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => {
        const colors = colorClasses[plan.color as keyof typeof colorClasses] ?? colorClasses.indigo;

        return (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-sm border-2 ${colors.border}`}
          >
            <div className={`${colors.bg} p-6`}>
              <h3 className="text-xl mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl">₱{plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>

            <div className="p-6">
              {/* Subscribers */}
               <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Subscribers</span>
                    <span>{plan.subscribers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors.button}`}
                      style={{ width: `${(plan.subscribers / totalSubscribers) * 100}%` }}
                    />
                  </div>
                </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              <button
              onClick={() => handleManagePlan(plan)}
              className={`w-full py-2 text-white rounded-lg ${colors.button}`}>
                Manage Plan
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Plan Performance */}
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl mb-4">Plan Performance</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500">Plan Name</th>
              <th className="px-4 py-3 text-left text-gray-500">Speed</th>
              <th className="px-4 py-3 text-left text-gray-500">Price</th>
              <th className="px-4 py-3 text-left text-gray-500">Subscribers</th>
              <th className="px-4 py-3 text-left text-gray-500">Monthly Revenue</th>
              <th className="px-4 py-3 text-left text-gray-500">Market Share</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">{plan.name}</td>
                <td className="px-4 py-4">{plan.speed}</td>
                <td className="px-4 py-4">₱{plan.price}</td>
                <td className="px-4 py-4">{plan.subscribers}</td>
                <td className="px-4 py-4">₱{((plan.subscribers || 0) * plan.price).toFixed(2)}</td>
                <td className="px-4 py-4">
                   {totalSubscribers > 0
                  ? (((plan.subscribers || 0) / totalSubscribers) * 100).toFixed(1)
                  : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Add Plan Modal */}
    {showAddPlan && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Add New Plan</h2>

          <div className="space-y-3">

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

            <div className="mb-4">
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

            <div className="flex justify-end mt-4 gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowAddPlan(false)}>
                Cancel
              </button>

              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAddPlan}>
                Save Plan
              </button>
            </div>

          </div>
        </div>
      </div>
    )}

    {/* Manage Plan Modal */}
      {showManageModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl">Manage Plan</h2>
              <button 
                onClick={() => {
                  setShowManageModal(false);
                  setSelectedPlan(null);
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Plan Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedPlan.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Speed</label>
                  <input
                    type="text"
                    name="speed"
                    defaultValue={selectedPlan.speed}
                    placeholder="e.g., 100 Mbps"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Monthly Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    defaultValue={selectedPlan.price}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Status</label>
                  <select
                    name="isActive"
                    value={planStatus}
                    onChange={(e) => setPlanStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
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
                    <p className="text-2xl mt-1">{selectedPlan.subscribers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl mt-1">${(selectedPlan.subscribers * selectedPlan.price).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Market Share</p>
                    <p className="text-2xl mt-1">{((selectedPlan.subscribers / totalSubscribers) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm text-gray-700">Plan Features</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {editingFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Feature description"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowManageModal(false);
                    setSelectedPlan(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
  </div>
);
}

