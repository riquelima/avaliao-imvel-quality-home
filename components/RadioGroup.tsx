
import React from 'react';

interface RadioGroupProps {
  label: string;
  name: string;
  options: string[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
  required = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-2 font-semibold text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <div className="flex flex-wrap gap-4">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
            <input
              type="radio"
              name={name}
              value={option}
              checked={selectedValue === option}
              onChange={onChange}
              required={required}
              className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
