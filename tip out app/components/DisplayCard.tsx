
import React from 'react';
import { CURRENCY_SYMBOL } from '../constants';

interface DisplayCardProps {
  title: string;
  amount: number;
}

const DisplayCard: React.FC<DisplayCardProps> = ({ title, amount }) => {
  return (
    <div className="bg-slate-700/50 p-4 rounded-lg shadow-lg backdrop-blur-sm">
      <h3 className="text-sm font-medium text-sky-300">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-white">
        {CURRENCY_SYMBOL}{amount.toFixed(2)}
      </p>
    </div>
  );
};

export default DisplayCard;
