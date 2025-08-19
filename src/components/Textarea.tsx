import React from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea: React.FC<TextareaProps> = (props) => {
  return (
    <textarea
      {...props}
      className="w-full bg-slate-700/50 text-slate-200 placeholder-slate-400 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-y min-h-[100px]"
    />
  );
};

export default Textarea;
