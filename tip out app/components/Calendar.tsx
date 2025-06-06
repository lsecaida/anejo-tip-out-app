
import React from 'react';
import { CURRENCY_SYMBOL } from '../constants';

interface CalendarProps {
  currentDate: Date;
  dailyTips: { [dateKey: string]: number };
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onMonthChange: (newDate: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  dailyTips,
  selectedDate,
  onDateSelect,
  onMonthChange,
}) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const calendarDays: (Date | null)[] = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }
  
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    calendarDays.push(null);
  }


  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-slate-700/50 p-4 sm:p-6 rounded-lg shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-md hover:bg-slate-600 transition-colors text-sky-300"
          aria-label="Previous month"
        >
          &lt;
        </button>
        <h3 className="text-lg font-semibold text-white">
          {currentDate.toLocaleString('default', { month: 'long' })} {year}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-md hover:bg-slate-600 transition-colors text-sky-300"
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
        {daysOfWeek.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-2"></div>;
          }
          const dateKey = formatDateKey(date);
          const tipAmount = dailyTips[dateKey];
          const hasTip = tipAmount !== undefined && tipAmount > 0;
          const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
          const isToday = date.getTime() === today.getTime();

          let cellClasses = "p-2 rounded-md cursor-pointer transition-colors flex flex-col items-center justify-center aspect-square ";
          if (isSelected) {
            cellClasses += "bg-sky-500 text-white font-semibold ";
          } else if (isToday) {
            cellClasses += "bg-slate-600/70 text-sky-300 font-semibold ring-1 ring-sky-400 ";
          } else {
            cellClasses += "hover:bg-slate-500/50 text-slate-200 ";
          }
          
          const buttonTitle = hasTip ? `${CURRENCY_SYMBOL}${tipAmount.toFixed(2)}` : undefined;

          return (
            <button
              key={dateKey}
              onClick={() => onDateSelect(date)}
              className={cellClasses}
              disabled={date.getMonth() !== month} 
              aria-label={`Select day ${date.getDate()}${hasTip ? `, Tip: ${CURRENCY_SYMBOL}${tipAmount.toFixed(2)}` : ''}`}
              title={buttonTitle}
            >
              <span>{date.getDate()}</span>
              {hasTip && <span className="mt-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
