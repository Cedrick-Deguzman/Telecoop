// app/components/ui/StatCard.tsx
"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string; // optional, e.g., "text-green-600"
  subtitle?: string | React.ReactNode;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, color, subtitle, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-gray-500">{label}</p>
      <p className={`text-2xl mt-1 ${color || ""}`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
};
