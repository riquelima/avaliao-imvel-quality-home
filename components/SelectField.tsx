import React from 'react';
import type { SelectOption } from '../types';

interface SelectFieldProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  options,
  required = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-2 font-medium text-blue-900/90">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="px-4 py-3 bg-white border border-slate-300 text-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out appearance-none bg-no-repeat bg-right pr-8"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231e3a8a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
      >
        <option value="" disabled>Selecione...</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};