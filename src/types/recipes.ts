export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export interface CustomRecipe {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  instructions: string | null; // JSON array of step strings
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  total_time_minutes: number | null;
  servings: number;
  yield_amount: number | null;
  yield_unit: string | null;
  difficulty: RecipeDifficulty | null;
  tags: string | null; // JSON array of strings
  notes: string | null;
  photo_path: string | null;
  is_favorite: number; // 0 or 1
  nutrition_per_serving_json: string | null; // JSON-serialized NutritionData
  calories_per_serving: number | null;
  protein_per_serving_g: number | null;
  carbs_per_serving_g: number | null;
  fat_per_serving_g: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  food_id: number | null; // references foods.fdc_id
  custom_food_id: number | null; // references custom_foods.id
  amount: number;
  unit: string;
  name_override: string | null;
  sort_order: number;
  is_optional: number; // 0 or 1
  notes: string | null;
}
