/**
 * Custom meals TypeScript types
 */

/**
 * A custom meal (saved combination of foods)
 */
export interface CustomMeal {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
  tags?: string | null; // Comma-separated tags
  times_logged: number;
  created_at: string;
  updated_at: string;
}

/**
 * An item within a custom meal
 */
export interface CustomMealItem {
  id: number;
  meal_id: number;
  item_type: 'food' | 'custom_food' | 'recipe';
  item_id: number; // Foreign key to foods, custom_foods, or custom_recipes
  quantity_g: number;
  sort_order: number;
}

/**
 * Input for creating a custom meal
 */
export interface CreateCustomMealInput {
  user_id: number;
  name: string;
  description?: string;
  tags?: string;
  items: CreateMealItemInput[];
}

/**
 * Input for creating a meal item
 */
export interface CreateMealItemInput {
  item_type: 'food' | 'custom_food' | 'recipe';
  item_id: number;
  quantity_g: number;
  sort_order: number;
}

/**
 * Custom meal with its items populated
 */
export interface PopulatedCustomMeal extends CustomMeal {
  items: CustomMealItem[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}
