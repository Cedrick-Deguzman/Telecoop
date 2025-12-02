import { Wifi, Zap, Crown, Rocket, Users, DollarSign, TrendingUp } from 'lucide-react';

const plans = [
  {
    id: 1,
    name: 'Basic 50Mbps',
    speed: '50 Mbps',
    price: 49.99,
    subscribers: 145,
    color: 'indigo',
    icon: Wifi,
    features: [
      'Download: 50 Mbps',
      'Upload: 10 Mbps',
      'Unlimited Data',
      'Email Support',
      'Basic Router Included',
    ],
  },
  {
    id: 2,
    name: 'Standard 100Mbps',
    speed: '100 Mbps',
    price: 79.99,
    subscribers: 230,
    color: 'purple',
    icon: Zap,
    features: [
      'Download: 100 Mbps',
      'Upload: 20 Mbps',
      'Unlimited Data',
      '24/7 Phone Support',
      'Advanced Router Included',
      'Free Installation',
    ],
  },
  {
    id: 3,
    name: 'Premium 500Mbps',
    speed: '500 Mbps',
    price: 129.99,
    subscribers: 98,
    color: 'pink',
    icon: Crown,
    features: [
      'Download: 500 Mbps',
      'Upload: 100 Mbps',
      'Unlimited Data',
      'Priority 24/7 Support',
      'Premium Router + Mesh',
      'Free Installation & Setup',
      'Static IP Option',
    ],
  },
  {
    id: 4,
    name: 'Ultra 1Gbps',
    speed: '1 Gbps',
    price: 199.99,
    subscribers: 45,
    color: 'amber',
    icon: Rocket,
    features: [
      'Download: 1 Gbps',
      'Upload: 250 Mbps',
      'Unlimited Data',
      'Dedicated Support Line',
      'Enterprise Router + Mesh',
      'Professional Installation',
      'Static IP Included',
      'Business SLA',
    ],
  },
];

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    icon: 'text-indigo-600',
    border: 'border-indigo-200',
    button: 'bg-indigo-600 hover:bg-indigo-700',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    button: 'bg-purple-600 hover:bg-purple-700',
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

export function Plans() {
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscribers, 0);
  const totalRevenue = plans.reduce((sum, plan) => sum + (plan.subscribers * plan.price), 0);

  return (
    <div className="space-y-6">
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
              <p className="text-2xl mt-1">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500">Average ARPU</p>
              <p className="text-2xl mt-1">${(totalRevenue / totalSubscribers).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const colors = colorClasses[plan.color as keyof typeof colorClasses];
          
          return (
            <div key={plan.id} className={`bg-white rounded-lg shadow-sm border-2 ${colors.border} overflow-hidden`}>
              <div className={`${colors.bg} p-6`}>
                <div className={`${colors.iconBg} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                  <Icon className={colors.icon} size={24} />
                </div>
                <h3 className="text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              <div className="p-6">
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

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">{feature}</span>
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
                  <td className="px-4 py-4">${plan.price}</td>
                  <td className="px-4 py-4">{plan.subscribers}</td>
                  <td className="px-4 py-4">${(plan.subscribers * plan.price).toFixed(2)}</td>
                  <td className="px-4 py-4">
                    {((plan.subscribers / totalSubscribers) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
