
import React, { useState, useEffect } from 'react';
import Input from './Input';
import { CURRENCY_SYMBOL } from '../constants';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  selectedDate: Date | null;
  currentTipAmount: number | undefined;
}

const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, onSave, selectedDate, currentTipAmount }) => {
  const [tipInput, setTipInput] = useState<string>('');

  useEffect(() => {
    if (currentTipAmount !== undefined) {
      setTipInput(currentTipAmount.toString());
    } else {
      setTipInput('');
    }
  }, [currentTipAmount, isOpen]);

  if (!isOpen || !selectedDate) return null;

  const handleSave = () => {
    const amount = parseFloat(tipInput);
    if (!isNaN(amount) && amount >= 0) {
      onSave(amount);
    } else if (tipInput.trim() === '') { // Allow saving empty to clear a tip
      onSave(0); 
    }
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipInput(e.target.value);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-modal-title"
    >
      <div 
        className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-white/10 w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <h2 id="tip-modal-title" className="text-xl font-semibold text-sky-400 mb-1">
          {currentTipAmount !== undefined && currentTipAmount > 0 ? 'Edit Tip' : 'Add Tip'}
        </h2>
        <p className="text-slate-400 mb-4 text-sm">
          For {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <Input
          id="tipAmount"
          label="Take Home Tip"
          value={tipInput}
          onChange={handleInputChange}
          placeholder="0.00"
          currencySymbol={CURRENCY_SYMBOL}
        />

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-md transition-colors"
          >
            Save Tip
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipModal;
