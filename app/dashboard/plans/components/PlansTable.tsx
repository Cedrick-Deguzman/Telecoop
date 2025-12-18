import { PlanType } from "../types";

interface PlanTableProps {
  plans: PlanType[];
  totalSubscribers: number;
}

export function PlanTable({ plans, totalSubscribers }: PlanTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
      <h2 className="text-xl mb-4">Plan Performance</h2>
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
          {plans.map(plan => (
            <tr key={plan.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">{plan.name}</td>
              <td className="px-4 py-4">{plan.speed}</td>
              <td className="px-4 py-4">₱{plan.price}</td>
              <td className="px-4 py-4">{plan.subscribers}</td>
              <td className="px-4 py-4">₱{(plan.subscribers * plan.price).toFixed(2)}</td>
              <td className="px-4 py-4">{totalSubscribers ? ((plan.subscribers / totalSubscribers) * 100).toFixed(1) : 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
