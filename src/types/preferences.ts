/**
 * User tracking preferences TypeScript types
 */

/**
 * UI theme options
 */
export type UITheme = 'minimalist' | 'standard' | 'maximalist';

/**
 * Focus mode from onboarding quiz
 */
export type FocusMode =
  | 'weight_management'
  | 'athletic_performance'
  | 'general_health'
  | 'specific_condition'
  | 'learning'
  | 'track_everything'
  | 'keep_simple';

/**
 * Dashboard widget types
 */
export type DashboardWidget =
  | 'calories'
  | 'macros'
  | 'weight'
  | 'water'
  | 'micronutrients'
  | 'meal_log'
  | 'progress_chart'
  | 'research_feed'
  | 'quick_log';

/**
 * User tracking preferences
 */
export interface TrackingPreferences {
  id: number;
  user_id: number;

  // Tracking toggles
  track_calories: boolean; // Always true (can't be disabled)
  track_protein: boolean;
  track_fat: boolean;
  track_carbs: boolean;
  track_fiber: boolean;
  track_sugar: boolean;
  track_sodium: boolean;
  track_cholesterol: boolean;
  track_vitamins: boolean;
  track_minerals: boolean;
  track_water: boolean;
  track_body_metrics: boolean;

  // UI preferences
  ui_theme: UITheme;
  focus_mode: FocusMode;

  // Dashboard configuration (JSON array of widget names)
  dashboard_widgets: string; // JSON: DashboardWidget[]

  // Feature toggles
  show_recipes: boolean;
  show_meals: boolean;
  show_research_feed: boolean;
  show_progress_photos: boolean;

  // Units
  use_metric: boolean;

  created_at: string;
  updated_at: string;
}

/**
 * Input for creating tracking preferences
 */
export interface CreateTrackingPreferencesInput {
  user_id: number;
  track_calories?: boolean;
  track_protein?: boolean;
  track_fat?: boolean;
  track_carbs?: boolean;
  track_fiber?: boolean;
  track_sugar?: boolean;
  track_sodium?: boolean;
  track_cholesterol?: boolean;
  track_vitamins?: boolean;
  track_minerals?: boolean;
  track_water?: boolean;
  track_body_metrics?: boolean;
  ui_theme?: UITheme;
  focus_mode?: FocusMode;
  dashboard_widgets?: DashboardWidget[];
  show_recipes?: boolean;
  show_meals?: boolean;
  show_research_feed?: boolean;
  show_progress_photos?: boolean;
  use_metric?: boolean;
}

/**
 * Parsed tracking preferences with dashboard widgets as array
 */
export interface ParsedTrackingPreferences extends Omit<TrackingPreferences, 'dashboard_widgets'> {
  dashboard_widgets: DashboardWidget[];
}
