export interface CustomMeal {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  notes: string | null;
  is_favorite: number; // 0 or 1
  tags: string | null; // JSON array of strings
  created_at: string;
  updated_at: string;
}

export interface CustomMealItem {
  id: number;
  meal_id: number;
  food_id: number | null; // references foods.fdc_id
  custom_food_id: number | null; // references custom_foods.id
  recipe_id: number | null; // references custom_recipes.id
  servings: number;
  sort_order: number;
}
