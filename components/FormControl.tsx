import React from 'react';

interface FormControlProps {
  label: string;
  htmlFor: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const FormControl: React.FC<FormControlProps> = ({ label, htmlFor, icon, children }) => {
  return (
    <div className="relative">
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
};

export default FormControl;