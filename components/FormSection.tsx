import React from 'react';

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, icon, children }) => {
  return (
    <section className="mb-10">
      <div className="flex items-center mb-3">
        <div className="text-orange-500 mr-3">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-blue-900 tracking-wide">{title}</h2>
      </div>
      <hr className="border-t-2 border-orange-400/80 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
        {children}
      </div>
    </section>
  );
};