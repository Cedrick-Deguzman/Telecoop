// app/components/ui/ActionButton.tsx
"use client";

import React from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  color?: string; // optional, defaults to gray
  onClick?: () => void;
}

const colorClasses: Record<string, string> = {
  gray: "text-slate-600 hover:bg-slate-100",
  yellow: "text-amber-700 hover:bg-amber-100",
  blue: "text-sky-700 hover:bg-sky-100",
  green: "text-emerald-700 hover:bg-emerald-100",
  red: "text-rose-700 hover:bg-rose-100",
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  color = "gray",
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border border-slate-200/80 p-2 transition-colors ${colorClasses[color] || colorClasses.gray}`}
    >
      {icon}
    </button>
  );
};
