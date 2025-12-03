import { useState, useEffect } from "react";
import { Wifi, Zap, Crown, Rocket, Users, DollarSign, TrendingUp } from 'lucide-react';

type PlanType = {
  id: number;
  name: string;
  speed: string;
  price: number;
  color: "indigo" | "purple" | "pink" | "amber";
  features: string[];
  clients: any[]; // you can make a Client type if needed
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
  
  useEffect(() => {
    const fetchPlans = async () => {
      const res = await fetch("/api/plans/add-plan");
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
    setPlans((prev) => [...prev, createdPlan]);

    setShowAddPlan(false);
    setNewPlan({ name: "", speed: "", price: "", features: "", color: "", icon: "" });

    const updated = await fetch("/api/plan").then(r => r.json());
    setPlans(updated);
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
              {/* <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Subscribers</span>
                  <span>{plan.clients.length}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${colors.button}`}
                    style={{
                      width:
                        totalSubscribers === 0
                          ? "0%"
                          : `${(plan.clients.length / totalSubscribers) * 100}%`,
                    }}
                  />
                </div>
              </div> */}

              {/* Features */}
              <div className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-2 text-white rounded-lg ${colors.button}`}>
                Manage Plan
              </button>
            </div>
          </div>
        );
      })}
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
  </div>
);
}

