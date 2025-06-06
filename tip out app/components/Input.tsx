
import React from 'react';

interface InputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  currencySymbol: string;
}

const Input: React.FC<InputProps> = ({ id, label, value, onChange, placeholder, currencySymbol }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-slate-400 sm:text-sm">{currencySymbol}</span>
        </div>
        <input
          type="number"
          name={id}
          id={id}
          className="block w-full rounded-md border-0 py-2.5 pl-8 pr-3 bg-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm leading-6 transition-colors duration-150"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );
};

export default Input;
