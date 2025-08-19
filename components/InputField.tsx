import React from 'react';

interface InputFieldProps {
  label: string;
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-2 font-medium text-blue-900/90">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="px-4 py-3 bg-white border border-slate-300 text-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out disabled:bg-slate-100 disabled:cursor-not-allowed placeholder-slate-400"
      />
    </div>
  );
};