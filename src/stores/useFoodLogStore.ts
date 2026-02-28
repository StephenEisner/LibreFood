import { create } from 'zustand';
import type { FoodLogEntry, DailyTotals } from '../services/database/foodLog';

interface FoodLogStore {
  entries: FoodLogEntry[];
  dailyTotals: DailyTotals;
  selectedDate: string;
  setEntries: (entries: FoodLogEntry[]) => void;
  setDailyTotals: (totals: DailyTotals) => void;
  setSelectedDate: (date: string) => void;
}

const EMPTY_TOTALS: DailyTotals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

export const useFoodLogStore = create<FoodLogStore>((set) => ({
  entries: [],
  dailyTotals: EMPTY_TOTALS,
  selectedDate: new Date().toISOString().split('T')[0],
  setEntries: (entries) => set({ entries }),
  setDailyTotals: (dailyTotals) => set({ dailyTotals }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
