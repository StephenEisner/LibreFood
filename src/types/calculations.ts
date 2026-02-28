import type { ActivityLevel, GoalType, Sex, TDEEFormula } from './user';

export interface BMRParams {
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: Sex;
  lean_body_mass_kg?: number; // required for Katch-McArdle
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  formula: TDEEFormula;
  activityLevel: ActivityLevel;
  activityMultiplier: number;
}

export interface MacroTargets {
  proteinG: number;
  fatG: number;
  carbsG: number;
  calories: number;
}

export interface CalorieTarget {
  target: number;
  tdee: number;
  goalType: GoalType;
  deficit?: number; // positive = deficit (loss)
  surplus?: number; // positive = surplus (gain)
}
