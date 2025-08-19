import React from 'react';

interface CheckboxGroupProps {
  label: string;
  name: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  name,
  options,
  selectedOptions,
  onChange,
  className = '',
}) => {
  const handleCheckboxChange = (option: string) => {
    let newSelected: string[];

    if (option === 'Nenhum') {
      // If "Nenhum" is clicked, it becomes the only selection, or clears the selection if it was already selected.
      newSelected = selectedOptions.includes('Nenhum') ? [] : ['Nenhum'];
    } else {
      // If another option is clicked
      const isCurrentlySelected = selectedOptions.includes(option);
      if (isCurrentlySelected) {
        // Deselect it
        newSelected = selectedOptions.filter(item => item !== option);
      } else {
        // Select it and remove "Nenhum" if it's present
        newSelected = [...selectedOptions.filter(item => item !== 'Nenhum'), option];
      }
    }
    onChange(newSelected);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-2 font-medium text-blue-900/90">{label}</label>
      <div className="bg-white p-4 rounded-lg border border-slate-300">
        <div className="flex flex-col space-y-3">
            {options.map(option => (
            <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                <input
                type="checkbox"
                name={name}
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="h-5 w-5 rounded-sm border-slate-400 bg-slate-50 text-orange-600 focus:ring-orange-500 focus:ring-offset-white"
                />
                <span className="text-slate-700 group-hover:text-blue-900 transition-colors">{option}</span>
            </label>
            ))}
        </div>
      </div>
    </div>
  );
};