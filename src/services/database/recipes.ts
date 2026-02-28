import type { CustomRecipe, RecipeIngredient } from '../../types/recipes';
import { openDatabase } from './init';

export async function createRecipe(
  data: Omit<CustomRecipe, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO custom_recipes (user_id, name, description, instructions, prep_time_minutes,
      cook_time_minutes, total_time_minutes, servings, yield_amount, yield_unit, difficulty,
      tags, notes, photo_path, is_favorite, nutrition_per_serving_json, calories_per_serving,
      protein_per_serving_g, carbs_per_serving_g, fat_per_serving_g)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.user_id,
    data.name,
    data.description,
    data.instructions,
    data.prep_time_minutes,
    data.cook_time_minutes,
    data.total_time_minutes,
    data.servings,
    data.yield_amount,
    data.yield_unit,
    data.difficulty,
    data.tags,
    data.notes,
    data.photo_path,
    data.is_favorite,
    data.nutrition_per_serving_json,
    data.calories_per_serving,
    data.protein_per_serving_g,
    data.carbs_per_serving_g,
    data.fat_per_serving_g
  );
  return result.lastInsertRowId;
}

export async function getRecipes(userId: number): Promise<CustomRecipe[]> {
  const db = await openDatabase();
  return db.getAllAsync<CustomRecipe>(
    'SELECT * FROM custom_recipes WHERE user_id = ? ORDER BY name ASC',
    userId
  );
}

export async function getRecipeById(id: number): Promise<CustomRecipe | null> {
  const db = await openDatabase();
  return db.getFirstAsync<CustomRecipe>('SELECT * FROM custom_recipes WHERE id = ?', id);
}

export async function updateRecipe(
  id: number,
  data: Partial<Omit<CustomRecipe, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const db = await openDatabase();
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.values(data);
  await db.runAsync(
    `UPDATE custom_recipes SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
    ...values,
    id
  );
}

export async function deleteRecipe(id: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM custom_recipes WHERE id = ?', id);
}

export async function getIngredients(recipeId: number): Promise<RecipeIngredient[]> {
  const db = await openDatabase();
  return db.getAllAsync<RecipeIngredient>(
    'SELECT * FROM custom_recipe_ingredients WHERE recipe_id = ? ORDER BY sort_order ASC',
    recipeId
  );
}

export async function addIngredient(
  data: Omit<RecipeIngredient, 'id'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO custom_recipe_ingredients (recipe_id, food_id, custom_food_id, amount, unit,
      name_override, sort_order, is_optional, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.recipe_id,
    data.food_id,
    data.custom_food_id,
    data.amount,
    data.unit,
    data.name_override,
    data.sort_order,
    data.is_optional,
    data.notes
  );
  return result.lastInsertRowId;
}

export async function deleteIngredient(id: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM custom_recipe_ingredients WHERE id = ?', id);
}
