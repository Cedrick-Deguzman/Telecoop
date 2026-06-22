// app/components/ui/FormInput.tsx
"use client";

import React from "react";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
  disabled = false,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
};
