import React from "react";
import { StatCard } from "@/app/components/ui/StatCard";
import { Client } from "../types"; 

interface StatsSummaryProps {
  clients: Client[];
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ clients }) => {
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === "active").length;
  const inactiveClients = clients.filter(c => c.status === "inactive").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard label="Total Clients" value={totalClients} />
      <StatCard label="Active" value={activeClients} color="text-green-600" />
      <StatCard label="Inactive" value={inactiveClients} color="text-red-600" />
    </div>
  );
};
