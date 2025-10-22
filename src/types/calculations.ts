/**
 * Calculation-related TypeScript types
 */

import { ActivityLevel, TDEEFormula } from './user';

export { TDEEFormula };

/**
 * Result from TDEE calculation
 */
export interface TDEEResult {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  formula: TDEEFormula; // Formula used for calculation
}

/**
 * Macro recommendations in grams
 */
export interface MacroRecommendation {
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
  proteinPercentage: number; // percentage of total calories
  fatPercentage: number; // percentage of total calories
  carbsPercentage: number; // percentage of total calories
}

/**
 * Input for TDEE calculation
 */
export interface TDEEInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female' | 'other';
  activityLevel: ActivityLevel;
  bodyFatPercentage?: number; // Required for Katch-McArdle
}

/**
 * Calorie target result
 */
export interface CalorieTarget {
  maintenance: number; // TDEE
  target: number; // Adjusted for goal (deficit/surplus)
  deficit?: number; // Daily calorie deficit (if losing weight)
  surplus?: number; // Daily calorie surplus (if gaining weight)
}

/**
 * Complete nutrition targets
 */
export interface NutritionTargets {
  calories: CalorieTarget;
  macros: MacroRecommendation;
}
