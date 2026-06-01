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
    <div className="shell-panel grid-fade relative p-5">
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0 space-y-2">
          <p className="section-kicker">{label}</p>
          <p className={`max-w-full break-words text-[clamp(1.8rem,2.5vw,2.25rem)] leading-tight tracking-tight ${color || ""}`}>
            {value}
          </p>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {icon && (
          <div className="shrink-0 rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-slate-700 shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
