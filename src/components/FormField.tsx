import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
};

export default FormField;
