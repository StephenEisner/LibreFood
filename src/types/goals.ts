/**
 * Goal-related TypeScript types
 */

import { ActivityLevel, GoalType } from './user';

export { ActivityLevel, GoalType };

/**
 * Activity level multipliers for TDEE calculation
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Activity level descriptions for UI
 */
export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: 'Little to no exercise, desk job',
  light: 'Light exercise 1-3 days per week',
  moderate: 'Moderate exercise 3-5 days per week',
  active: 'Heavy exercise 6-7 days per week',
  very_active: 'Very heavy exercise, physical job, training twice per day',
};

/**
 * Goal configuration for tracking progress
 */
export interface GoalConfiguration {
  type: GoalType;
  targetWeightKg?: number;
  rateKgPerWeek?: number;
  customCalories?: number;
  startWeight: number;
  currentWeight: number;
  progressPercentage: number;
}
