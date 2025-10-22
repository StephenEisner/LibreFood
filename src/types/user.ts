/**
 * User-related TypeScript types
 */

export type BiologicalSex = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type GoalType =
  | 'lose_weight'
  | 'gain_weight'
  | 'maintain_weight'
  | 'body_recomposition'
  | 'custom';

export type TDEEFormula = 'mifflin_st_jeor' | 'harris_benedict' | 'katch_mcardle';

export interface User {
  id: number;
  height_cm: number;
  birth_date: string; // ISO date string
  sex: BiologicalSex;
  activity_level: ActivityLevel;
  goal_type: GoalType;
  tdee_formula: TDEEFormula;
  target_weight_kg?: number | null;
  goal_rate_kg_per_week?: number | null;
  custom_calorie_target?: number | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface UserProfile {
  height_cm: number;
  birth_date: string;
  sex: BiologicalSex;
  activity_level: ActivityLevel;
  goal_type: GoalType;
  tdee_formula: TDEEFormula;
  target_weight_kg?: number;
  goal_rate_kg_per_week?: number;
  custom_calorie_target?: number;
}

export interface CreateUserInput {
  height_cm: number;
  birth_date: string;
  sex: BiologicalSex;
  activity_level: ActivityLevel;
  goal_type: GoalType;
  tdee_formula: TDEEFormula;
  target_weight_kg?: number;
  goal_rate_kg_per_week?: number;
  custom_calorie_target?: number;
}

export interface UpdateUserInput {
  height_cm?: number;
  birth_date?: string;
  sex?: BiologicalSex;
  activity_level?: ActivityLevel;
  goal_type?: GoalType;
  tdee_formula?: TDEEFormula;
  target_weight_kg?: number | null;
  goal_rate_kg_per_week?: number | null;
  custom_calorie_target?: number | null;
}
