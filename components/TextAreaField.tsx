import React from 'react';

interface TextAreaFieldProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  subLabel?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  className = '',
  subLabel = ''
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-1 font-medium text-blue-900/90">{label}</label>
      {subLabel && <p className="mb-2 text-sm text-slate-500">{subLabel}</p>}
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="px-4 py-3 bg-white border border-slate-300 text-slate-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out placeholder-slate-400"
      />
    </div>
  );
};