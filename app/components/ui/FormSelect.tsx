// app/components/ui/FormSelect.tsx
"use client";

import React from "react";

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  required?: boolean;
  options: Option[];
  defaultValue?: string | number;
  placeholder?: string;
  value?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  required = false,
  options,
  defaultValue,
  placeholder,
  value,
  disabled = false,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-700">{label}</label>
      <select
        name={name}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        {...(value !== undefined
          ? { value, onChange } // controlled
          : { defaultValue: defaultValue?.toString() || "" } // uncontrolled
        )}
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt.value.toString()} value={opt.value.toString()}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
