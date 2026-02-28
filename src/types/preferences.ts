export type FocusMode = 'standard' | 'cutting' | 'bulking' | 'health' | 'custom';

export type UITheme = 'minimalist' | 'standard' | 'maximalist';

export type ColorScheme = 'light' | 'dark' | 'system';

export interface UserTrackingPreferences {
  id: number;
  user_id: number;
  // UI customization
  focus_mode: FocusMode;
  ui_theme: UITheme;
  color_scheme: ColorScheme;
  // Macro tracking toggles (stored as 0 | 1 in DB)
  track_calories: number;
  track_protein: number;
  track_carbs: number;
  track_fat: number;
  track_fiber: number;
  track_sugar: number;
  track_cholesterol: number;
  track_sodium: number;
  track_saturated_fat: number;
  track_trans_fat: number;
  // Vitamin tracking toggles
  track_vitamin_a: number;
  track_vitamin_c: number;
  track_vitamin_d: number;
  track_vitamin_e: number;
  track_vitamin_k: number;
  track_thiamin: number;
  track_riboflavin: number;
  track_niacin: number;
  track_vitamin_b6: number;
  track_folate: number;
  track_vitamin_b12: number;
  // Mineral tracking toggles
  track_calcium: number;
  track_iron: number;
  track_magnesium: number;
  track_phosphorus: number;
  track_potassium: number;
  track_zinc: number;
  track_copper: number;
  track_manganese: number;
  track_selenium: number;
  // Body metrics toggles
  track_weight: number;
  track_body_fat: number;
  track_measurements: number;
  // Feature visibility
  show_progress_photos: number;
  show_research_feed: number;
  show_recipes: number;
  show_meal_planning: number;
  // Dashboard layout (JSON: which widgets, what order)
  dashboard_layout: string | null;
}
