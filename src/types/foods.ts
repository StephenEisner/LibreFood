export type FoodSource = 'usda' | 'custom' | 'open_food_facts';

export interface NutritionData {
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  added_sugar_g?: number;
  cholesterol_mg?: number;
  sodium_mg?: number;
  saturated_fat_g?: number;
  trans_fat_g?: number;
  monounsaturated_fat_g?: number;
  polyunsaturated_fat_g?: number;
  // Vitamins
  vitamin_a_mcg?: number;
  vitamin_c_mg?: number;
  vitamin_d_mcg?: number;
  vitamin_e_mg?: number;
  vitamin_k_mcg?: number;
  thiamin_mg?: number;
  riboflavin_mg?: number;
  niacin_mg?: number;
  vitamin_b6_mg?: number;
  folate_mcg?: number;
  vitamin_b12_mcg?: number;
  // Minerals
  calcium_mg?: number;
  iron_mg?: number;
  magnesium_mg?: number;
  phosphorus_mg?: number;
  potassium_mg?: number;
  zinc_mg?: number;
  copper_mg?: number;
  manganese_mg?: number;
  selenium_mcg?: number;
}

export interface Food {
  fdc_id: number;
  description: string;
  data_type: string | null;
  brand_name: string | null;
  brand_owner: string | null;
  gtin_upc: string | null;
  serving_size: number | null;
  serving_size_unit: string | null;
  household_serving_text: string | null;
  category: string | null;
  nutrition_json: string; // JSON-serialized NutritionData
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  cached_at: string;
  updated_at: string;
}

export interface CustomFood {
  id: number;
  user_id: number;
  name: string;
  brand: string | null;
  serving_size: number;
  serving_size_unit: string;
  household_serving_text: string | null;
  nutrition_json: string; // JSON-serialized NutritionData
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  is_favorite: number; // 0 or 1
  created_at: string;
  updated_at: string;
}
