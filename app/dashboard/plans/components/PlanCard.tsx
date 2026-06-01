import { PlanType, PlanColorClasses } from "../types";
import { formatCurrency } from "@/app/utils/format";

interface PlanCardProps {
  plan: PlanType;
  totalSubscribers: number;
  colors: PlanColorClasses;
  onManage: (plan: PlanType) => void;
}

export function PlanCard({ plan, totalSubscribers, colors, onManage }: PlanCardProps) {
  const colorClasses = colors[plan.color as keyof typeof colors];

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 ${colorClasses.border}`}>
      <div className={`${colorClasses.bg} p-6`}>
        <h3 className="text-xl mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl">{formatCurrency(plan.price)}</span>
          <span className="text-gray-500">/month</span>
        </div>
      </div>

      <div className="p-6">
        <SubscribersBar plan={plan} totalSubscribers={totalSubscribers} colors={colorClasses} />

        <div className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onManage(plan)}
          className={`w-full py-2 text-white rounded-lg ${colorClasses.button}`}
        >
          Manage Plan
        </button>
      </div>
    </div>
  );
}

function SubscribersBar({
  plan,
  totalSubscribers,
  colors,
}: {
  plan: PlanType;
  totalSubscribers: number;
  colors: PlanColorClasses[PlanType["color"]];
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-600">Subscribers</span>
        <span>{plan.subscribers}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${colors.button}`}
          style={{ width: `${totalSubscribers ? (plan.subscribers / totalSubscribers) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
