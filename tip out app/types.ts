
export interface DailyTipData {
  [dateKey: string]: number; // e.g., "2024-07-28": 50.75
}

export interface CalculationRecord {
  id: string; // Unique ID for the record, can be a timestamp or UUID
  sales: number;
  tipOut1: number;
  tipOut2: number;
  takeHomeTip: number;
  timestamp: string; // ISO string date
}
