// app/components/ui/ActionButton.tsx
"use client";

import React from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  color?: string; // optional, defaults to gray
  onClick?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  color = "gray",
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-${color}-600 hover:bg-${color}-50 rounded`}
    >
      {icon}
    </button>
  );
};
