/**
 * Food-related TypeScript types
 */

/**
 * Food from USDA FoodData Central database (read-only)
 */
export interface Food {
  id: number;
  fdc_id: number; // USDA FoodData Central ID
  description: string;
  data_type: string; // SR Legacy, Foundation, Branded, etc.

  // Macronutrients (per 100g)
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;

  // Micronutrients (optional, per 100g)
  sodium_mg?: number | null;
  cholesterol_mg?: number | null;
  vitamin_a_mcg?: number | null;
  vitamin_c_mg?: number | null;
  vitamin_d_mcg?: number | null;
  calcium_mg?: number | null;
  iron_mg?: number | null;
  potassium_mg?: number | null;

  // Metadata
  brand_owner?: string | null;
  brand_name?: string | null;
  serving_size?: number | null; // in grams
  serving_unit?: string | null;
}

/**
 * User-created custom food
 */
export interface CustomFood {
  id: number;
  user_id: number;
  name: string;
  brand?: string | null;

  // Macronutrients (per 100g)
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;

  // Micronutrients (optional, per 100g)
  sodium_mg?: number | null;
  cholesterol_mg?: number | null;
  vitamin_a_mcg?: number | null;
  vitamin_c_mg?: number | null;
  vitamin_d_mcg?: number | null;
  calcium_mg?: number | null;
  iron_mg?: number | null;
  potassium_mg?: number | null;

  // Serving information
  serving_size_g?: number | null;
  serving_unit?: string | null;

  // Metadata
  notes?: string | null;
  barcode?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a custom food
 */
export interface CreateCustomFoodInput {
  user_id: number;
  name: string;
  brand?: string;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg?: number;
  cholesterol_mg?: number;
  vitamin_a_mcg?: number;
  vitamin_c_mg?: number;
  vitamin_d_mcg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  potassium_mg?: number;
  serving_size_g?: number;
  serving_unit?: string;
  notes?: string;
  barcode?: string;
}

/**
 * Food search result (can be either Food or CustomFood)
 */
export type FoodSearchResult = (Food | CustomFood) & {
  isCustom: boolean;
};

/**
 * Nutrition facts (for display)
 */
export interface NutritionFacts {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg?: number;
  cholesterol_mg?: number;
  vitamin_a_mcg?: number;
  vitamin_c_mg?: number;
  vitamin_d_mcg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  potassium_mg?: number;
}
