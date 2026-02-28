import { create } from 'zustand';
import type { ActivityLevel, GoalType, Sex, TDEEFormula, TrackingPurpose, UnitSystem } from '../types/user';

interface OnboardingData {
  name: string | null;
  height_cm: number | null;
  birth_date: string | null;
  sex: Sex | null;
  tracking_purposes: TrackingPurpose[];
  activity_level: ActivityLevel | null;
  goal_type: GoalType | null;
  tdee_formula: TDEEFormula;
  weight_kg: number | null;
  goal_weight_kg: number | null;
  goal_rate_kg_per_week: number | null;
  custom_calorie_target: number | null;
  unit_system: UnitSystem;
}

interface OnboardingStore {
  data: OnboardingData;
  update: (data: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  name: null,
  height_cm: null,
  birth_date: null,
  sex: null,
  tracking_purposes: [],
  activity_level: null,
  goal_type: null,
  tdee_formula: 'mifflin',
  weight_kg: null,
  goal_weight_kg: null,
  goal_rate_kg_per_week: 0.5,
  custom_calorie_target: null,
  unit_system: 'imperial',
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  data: initialData,
  update: (data) => set((state) => ({ data: { ...state.data, ...data } })),
  reset: () => set({ data: initialData }),
}));
