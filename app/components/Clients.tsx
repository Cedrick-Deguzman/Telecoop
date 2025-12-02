import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Wifi,
} from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: "active" | "inactive" | "suspended";
  installationDate: string;
  monthlyFee: number;
  payments: { date: string }[];
}

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // --------------------------------------------------
  // Filter clients by search input
  // --------------------------------------------------
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    );
  });

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients/list");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Failed to load clients:", err);
    }
  };
  useEffect(() => {
    fetchClients();
  }, []);

  // --------------------------------------------------
  // UI helper: status colors
  // --------------------------------------------------
  const statusColor = (status: Client["status"]) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  // --------------------------------------------------
  // Get last payment date
  // --------------------------------------------------
  const getLastPayment = (client: Client) => {
    return client.payments?.length > 0
      ? new Date(client.payments[0].date).toLocaleDateString()
      : "No payments";
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------- */}
      {/* Header + Search */}
      {/* -------------------------------------------- */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Add Client
        </button>
      </div>

      {/* -------------------------------------------- */}
      {/* Stats Summary */}
      {/* -------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Clients" value={clients.length} />
        <StatCard label="Active" value={clients.filter((c) => c.status === "active").length} color="text-green-600" />
        <StatCard label="Suspended" value={clients.filter((c) => c.status === "suspended").length} color="text-red-600" />
      </div>

      {/* -------------------------------------------- */}
      {/* Clients Table */}
      {/* -------------------------------------------- */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Client", "Contact", "Plan", "Status", "Monthly Fee", "Last Payment", "Actions"].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-gray-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div>
                      <p>{client.name}</p>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(client.installationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {client.email || "N/A"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {client.phone || "N/A"}
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="mt-2 px-6 py-4 flex items-center gap-2">
                    <Wifi size={20} className="text-indigo-600" />
                    {client.plan}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>

                  {/* Fee */}
                  <td className="px-6 py-4">${client.monthlyFee.toFixed(2)}</td>

                  {/* Last Payment */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getLastPayment(client)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <ActionButton icon={<Edit size={16} />} color="blue" />
                      <ActionButton icon={<Trash2 size={16} />} color="red" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* -------------------------------------------- */}
      {/* Add Client Modal */}
      {/* -------------------------------------------- */}
      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} refresh={fetchClients} />}
    </div>
  );
}

/* -------------------------------------------- */
/* Reusable Components                          */
/* -------------------------------------------- */

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <p className="text-gray-500">{label}</p>
      <p className={`text-2xl mt-1 ${color || ""}`}>{value}</p>
    </div>
  );
}

function ActionButton({ icon, color }: { icon: React.ReactNode; color: string }) {
  return (
    <button className={`p-2 text-${color}-600 hover:bg-${color}-50 rounded`}>
      {icon}
    </button>
  );
}

/* -------------------------------------------- */
/* Modal Component                              */
/* -------------------------------------------- */

function AddClientModal({ onClose, refresh }: { onClose: () => void; refresh : () => void }) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const payload = {
      name: form.get("name")?.toString().trim(),
      email: form.get("email")?.toString().trim(),
      phone: form.get("phone")?.toString().trim(),
      plan: form.get("plan")?.toString(),
      installationDate: form.get("installationDate")?.toString(),
    };

    if (!payload.name || !payload.plan || !payload.installationDate) {
      alert("Name, plan, and installation date are required");
      return;
    }

    try {
      const res = await fetch("/api/clients/add-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add client");
        return;
      }
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while adding client");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl mb-4">Add New Client</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Full Name" name="name" required />
          <FormInput label="Email" name="email" type="email" />
          <FormInput label="Phone" name="phone" type="tel" />
          <FormSelect
            label="Plan"
            name="plan"
            required
            options={[
              "Basic 50Mbps - $49.99",
              "Standard 100Mbps - $79.99",
              "Premium 500Mbps - $129.99",
              "Ultra 1Gbps - $199.99",
            ]}
          />
          <FormInput label="Installation Date" name="installationDate" type="date" required />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function FormSelect({
  label,
  name,
  required,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-700">{label}</label>
      <select
        name={name}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select Plan</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
