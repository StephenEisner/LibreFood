/**
 * Custom recipes TypeScript types
 */

/**
 * A custom recipe with cooking instructions
 */
export interface CustomRecipe {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
  servings: number;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  instructions: string; // Text instructions or JSON for structured steps
  tags?: string | null; // Comma-separated tags
  photo_uri?: string | null;
  times_cooked: number;
  created_at: string;
  updated_at: string;
}

/**
 * An ingredient in a custom recipe
 */
export interface CustomRecipeIngredient {
  id: number;
  recipe_id: number;
  item_type: 'food' | 'custom_food';
  item_id: number;
  quantity_g: number;
  sort_order: number;
}

/**
 * A structured step in a recipe (optional, for structured instructions)
 */
export interface CustomRecipeStep {
  id: number;
  recipe_id: number;
  step_number: number;
  instruction: string;
  duration_minutes?: number | null;
}

/**
 * Cached nutrition for a recipe
 */
export interface RecipeNutrition {
  id: number;
  recipe_id: number;
  serving_size: number; // grams per serving
  calories_per_serving: number;
  protein_per_serving: number;
  fat_per_serving: number;
  carbs_per_serving: number;
  fiber_per_serving: number;
  updated_at: string;
}

/**
 * Input for creating a custom recipe
 */
export interface CreateCustomRecipeInput {
  user_id: number;
  name: string;
  description?: string;
  servings: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  instructions: string;
  tags?: string;
  photo_uri?: string;
  ingredients: CreateRecipeIngredientInput[];
  steps?: CreateRecipeStepInput[];
}

/**
 * Input for creating a recipe ingredient
 */
export interface CreateRecipeIngredientInput {
  item_type: 'food' | 'custom_food';
  item_id: number;
  quantity_g: number;
  sort_order: number;
}

/**
 * Input for creating a recipe step
 */
export interface CreateRecipeStepInput {
  step_number: number;
  instruction: string;
  duration_minutes?: number;
}

/**
 * Recipe with populated ingredients and nutrition
 */
export interface PopulatedCustomRecipe extends CustomRecipe {
  ingredients: CustomRecipeIngredient[];
  steps?: CustomRecipeStep[];
  nutrition?: RecipeNutrition;
}
