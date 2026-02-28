export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type GoalType = 'loss' | 'gain' | 'maintenance' | 'recomp' | 'custom';

export type TDEEFormula = 'mifflin' | 'harris' | 'katch';

export type Sex = 'male' | 'female' | 'other';

export type UnitSystem = 'metric' | 'imperial';

export type TrackingPurpose =
  | 'weight_management'
  | 'athletic_performance'
  | 'general_health'
  | 'specific_health'
  | 'learn_nutrition'
  | 'track_everything'
  | 'keep_it_simple';

export interface User {
  id: number;
  name: string | null;
  height_cm: number;
  birth_date: string; // ISO date
  sex: Sex;
  activity_level: ActivityLevel;
  tdee_formula: TDEEFormula;
  goal_type: GoalType | null;
  goal_weight_kg: number | null;
  goal_rate_kg_per_week: number | null;
  custom_calorie_target: number | null;
  tracking_purpose: string | null; // JSON array of TrackingPurpose[]
  unit_system: UnitSystem;
  created_at: string;
  updated_at: string;
}
