import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      {...props}
      className="w-full bg-slate-700/50 text-slate-200 placeholder-slate-400 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
    />
  );
};

export default Input;
