
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Input from './components/Input';
import DisplayCard from './components/DisplayCard';
import Calendar from './components/Calendar';
import TipModal from './components/TipModal';
import { TIP_PERCENTAGE_1, TIP_PERCENTAGE_2, CURRENCY_SYMBOL, LOCAL_STORAGE_KEY_DAILY_TIPS, LOCAL_STORAGE_KEY_CALCULATION_RECORDS } from './constants';
import type { DailyTipData, CalculationRecord } from './types';

interface TipOuts {
  tip1: number;
  tip2: number;
}

interface MonthlySummary {
  totalSales: number;
  totalTipOut1: number;
  totalTipOut2: number;
  hasRecords: boolean;
}

const App: React.FC = () => {
  const [salesInput, setSalesInput] = useState<string>('');
  const [tipOuts, setTipOuts] = useState<TipOuts>({ tip1: 0, tip2: 0 });
  const [takeHomeTipInput, setTakeHomeTipInput] = useState<string>('');
  const [calculationRecords, setCalculationRecords] = useState<CalculationRecord[]>([]);
  const [areCalculationsLoaded, setAreCalculationsLoaded] = useState<boolean>(false);

  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dailyTipsData, setDailyTipsData] = useState<DailyTipData>({});
  const [isTipModalOpen, setIsTipModalOpen] = useState<boolean>(false);

  // State for Monthly Calculation Summary
  const [summaryDate, setSummaryDate] = useState<Date>(new Date());


  useEffect(() => {
    try {
      const storedTips = localStorage.getItem(LOCAL_STORAGE_KEY_DAILY_TIPS);
      if (storedTips) {
        setDailyTipsData(JSON.parse(storedTips));
      }
    } catch (error) {
      console.error("Failed to load daily tips from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DAILY_TIPS, JSON.stringify(dailyTipsData));
    } catch (error) {
      console.error("Failed to save daily tips to localStorage:", error);
    }
  }, [dailyTipsData]);

  useEffect(() => {
    try {
      const storedRecords = localStorage.getItem(LOCAL_STORAGE_KEY_CALCULATION_RECORDS);
      if (storedRecords) {
        setCalculationRecords(JSON.parse(storedRecords));
      }
    } catch (error) {
      console.error("Failed to load calculation records from localStorage:", error);
    } finally {
      setAreCalculationsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (areCalculationsLoaded) { // Only save if initial load is complete
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_CALCULATION_RECORDS, JSON.stringify(calculationRecords));
        } catch (error) {
            console.error("Failed to save calculation records to localStorage:", error);
        }
    }
  }, [calculationRecords, areCalculationsLoaded]);


  useEffect(() => {
    const sales = parseFloat(salesInput);
    if (!isNaN(sales) && sales >= 0) {
      setTipOuts({
        tip1: sales * TIP_PERCENTAGE_1,
        tip2: sales * TIP_PERCENTAGE_2,
      });
    } else {
      setTipOuts({ tip1: 0, tip2: 0 });
    }
  }, [salesInput]);

  const handleSalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalesInput(e.target.value);
  };

  const handleTakeHomeTipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTakeHomeTipInput(e.target.value);
  };
  
  const canLogCalculation = (): boolean => {
    const sales = parseFloat(salesInput);
    const takeHome = parseFloat(takeHomeTipInput);
    return !isNaN(sales) && sales > 0 && !isNaN(takeHome) && takeHome >= 0;
  };

  const handleLogCalculation = () => {
    if (!canLogCalculation()) return;

    const salesValue = parseFloat(salesInput);
    const takeHomeValue = parseFloat(takeHomeTipInput);

    const recordTipOut1 = salesValue * TIP_PERCENTAGE_1;
    const recordTipOut2 = salesValue * TIP_PERCENTAGE_2;

    const newRecord: CalculationRecord = {
      id: new Date().toISOString() + Math.random().toString(36).substring(2,9),
      sales: salesValue,
      tipOut1: recordTipOut1,
      tipOut2: recordTipOut2,
      takeHomeTip: takeHomeValue,
      timestamp: new Date().toISOString(),
    };
    setCalculationRecords(prevRecords => [...prevRecords, newRecord]);
    setSalesInput('');
    setTakeHomeTipInput('');
  };


  const formatDateKey = useCallback((date: Date): string => {
    return date.toISOString().split('T')[0];
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (newDate: Date) => {
    setCurrentCalendarDate(newDate);
  };

  const handleOpenTipModal = () => {
    if (selectedDate) {
      setIsTipModalOpen(true);
    }
  };

  const handleCloseTipModal = () => {
    setIsTipModalOpen(false);
  };

  const handleSaveTip = (amount: number) => {
    if (selectedDate) {
      const dateKey = formatDateKey(selectedDate);
      setDailyTipsData(prev => {
        const updatedTips = { ...prev };
        if (amount > 0) {
          updatedTips[dateKey] = amount;
        } else {
          delete updatedTips[dateKey]; 
        }
        return updatedTips;
      });
    }
  };
  
  const getMonthlyTotalTips = () => {
    let total = 0;
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    for (const dateKey in dailyTipsData) {
      const recordDate = new Date(dateKey + "T00:00:00"); // Ensure correct date parsing
      if (recordDate.getFullYear() === year && recordDate.getMonth() === month) {
        total += dailyTipsData[dateKey];
      }
    }
    return total;
  };

  const selectedDateTipAmount = selectedDate ? dailyTipsData[formatDateKey(selectedDate)] : undefined;
  const placeholderImageUrl = "https://images.ctfassets.net/ih31w4gbf9hm/63JgCjzZG6eJYLUwlhpdx2/1f33b250c87f9d60924ad5095cb3637b/anejo_logo.jpg";

  // Monthly Calculation Summary Logic
  const monthlyCalculationSummary = useMemo((): MonthlySummary => {
    if (!areCalculationsLoaded) {
        return { totalSales: 0, totalTipOut1: 0, totalTipOut2: 0, hasRecords: false };
    }
    const targetYear = summaryDate.getFullYear();
    const targetMonth = summaryDate.getMonth();
    let totalSales = 0;
    let totalTipOut1 = 0;
    let totalTipOut2 = 0;
    let hasRecordsThisMonth = false;

    calculationRecords.forEach(record => {
      const recordDate = new Date(record.timestamp);
      if (recordDate.getFullYear() === targetYear && recordDate.getMonth() === targetMonth) {
        totalSales += record.sales;
        totalTipOut1 += record.tipOut1;
        totalTipOut2 += record.tipOut2;
        hasRecordsThisMonth = true;
      }
    });
    return { totalSales, totalTipOut1, totalTipOut2, hasRecords: hasRecordsThisMonth };
  }, [calculationRecords, summaryDate, areCalculationsLoaded]);

  const handleSummaryPrevMonth = () => {
    setSummaryDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleSummaryNextMonth = () => {
    setSummaryDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center">
          <img 
            src={placeholderImageUrl} 
            alt="App Logo" 
            className="mx-auto mb-4 h-12 sm:h-14" 
            width="180" 
            height="50"
          />
          <h1 className="text-4xl font-bold text-sky-400 sm:text-5xl">
            Tip Out & Earnings Tracker
          </h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Calculate tip outs, log earnings & track daily income.
          </p>
        </header>

        <main className="bg-slate-800/70 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-white/10">
          <div className="mb-6">
            <Input
              id="salesAmount"
              label="Total Sales Amount"
              value={salesInput}
              onChange={handleSalesChange}
              placeholder="0.00"
              currencySymbol={CURRENCY_SYMBOL}
            />
          </div>

          {salesInput && parseFloat(salesInput) > 0 && (
            <>
              <div className="mt-8 border-t border-slate-700 pt-6">
                <h2 className="text-lg font-semibold text-slate-200 mb-4">Calculated Tip Outs:</h2>
                <div className="space-y-4">
                  <DisplayCard
                    title={`Primary Tip Out (${(TIP_PERCENTAGE_1 * 100).toFixed(1)}%)`}
                    amount={tipOuts.tip1}
                  />
                  <DisplayCard
                    title={`Secondary Tip Out (${(TIP_PERCENTAGE_2 * 100).toFixed(1)}%)`}
                    amount={tipOuts.tip2}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Input
                  id="takeHomeTipCalculation"
                  label="Actual Take Home (This Calculation)"
                  value={takeHomeTipInput}
                  onChange={handleTakeHomeTipInputChange}
                  placeholder="0.00"
                  currencySymbol={CURRENCY_SYMBOL}
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={handleLogCalculation}
                  disabled={!canLogCalculation()}
                  className="w-full px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-live="polite"
                >
                  Log This Calculation
                </button>
              </div>
              {calculationRecords.length > 0 && (
                <p className="mt-3 text-xs text-slate-400 text-center">
                    {calculationRecords.length} calculation(s) logged.
                </p>
              )}
            </>
          )}
          {(!salesInput || parseFloat(salesInput) <= 0) && (
             <div className="mt-8 text-center text-slate-500">
                <p>Enter a sales amount to calculate tip outs and log earnings.</p>
             </div>
          )}
        </main>

        <section className="bg-slate-800/70 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-white/10">
          <h2 className="text-2xl font-semibold text-sky-400 mb-4 text-center">Daily Tip Log</h2>
          <Calendar
            currentDate={currentCalendarDate}
            dailyTips={dailyTipsData}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
          {selectedDate && (
            <div className="mt-6 border-t border-slate-700 pt-6 text-center">
              <p className="text-slate-300 mb-1">
                Logged tip for <span className="font-semibold text-sky-300">{selectedDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>:
              </p>
              <p className="text-2xl font-bold text-white mb-3">
                {selectedDateTipAmount !== undefined ? `${CURRENCY_SYMBOL}${selectedDateTipAmount.toFixed(2)}` : 'Not recorded'}
              </p>
              <button
                onClick={handleOpenTipModal}
                className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                {selectedDateTipAmount !== undefined ? 'Edit Daily Tip' : 'Add Daily Tip'}
              </button>
            </div>
          )}
          <div className="mt-6 border-t border-slate-700 pt-6 text-center">
             <h3 className="text-md font-medium text-sky-300">Total Daily Tips for {currentCalendarDate.toLocaleString('default', { month: 'long' })} {currentCalendarDate.getFullYear()}:</h3>
             <p className="mt-1 text-xl font-semibold text-white">
                {CURRENCY_SYMBOL}{getMonthlyTotalTips().toFixed(2)}
            </p>
          </div>
        </section>

        {/* Monthly Calculation Summary Section */}
        <section className="bg-slate-800/70 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl ring-1 ring-white/10">
          <h2 className="text-2xl font-semibold text-sky-400 mb-4 text-center">Monthly Calculation Summary</h2>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleSummaryPrevMonth}
              className="p-2 rounded-md hover:bg-slate-600 transition-colors text-sky-300"
              aria-label="Previous month for summary"
            >
              &lt; Prev Month
            </button>
            <h3 className="text-lg font-semibold text-white text-center">
              {summaryDate.toLocaleString('default', { month: 'long' })} {summaryDate.getFullYear()}
            </h3>
            <button
              onClick={handleSummaryNextMonth}
              className="p-2 rounded-md hover:bg-slate-600 transition-colors text-sky-300"
              aria-label="Next month for summary"
            >
              Next Month &gt;
            </button>
          </div>
          {areCalculationsLoaded && monthlyCalculationSummary.hasRecords ? (
            <div className="space-y-3">
              <div>
                <span className="text-slate-300">Total Sales: </span>
                <span className="text-white font-semibold">{CURRENCY_SYMBOL}{monthlyCalculationSummary.totalSales.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-300">Total Primary Tip Out ({(TIP_PERCENTAGE_1 * 100).toFixed(1)}%): </span>
                <span className="text-white font-semibold">{CURRENCY_SYMBOL}{monthlyCalculationSummary.totalTipOut1.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-300">Total Secondary Tip Out ({(TIP_PERCENTAGE_2 * 100).toFixed(1)}%): </span>
                <span className="text-white font-semibold">{CURRENCY_SYMBOL}{monthlyCalculationSummary.totalTipOut2.toFixed(2)}</span>
              </div>
            </div>
          ) : areCalculationsLoaded ? (
            <p className="text-slate-400 text-center">No calculation records found for this month.</p>
          ) : (
            <p className="text-slate-400 text-center">Loading summary data...</p>
          )}
        </section>
        
        <TipModal
          isOpen={isTipModalOpen}
          onClose={handleCloseTipModal}
          onSave={handleSaveTip}
          selectedDate={selectedDate}
          currentTipAmount={selectedDateTipAmount}
        />

        <footer className="mt-2 text-center text-xs text-slate-500 pb-4">
          <p>&copy; {new Date().getFullYear()} Tip Solutions. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
