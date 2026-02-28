import type { CustomMeal, CustomMealItem } from '../../types/meals';
import { openDatabase } from './init';

export async function createMeal(
  data: Omit<CustomMeal, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO custom_meals (user_id, name, description, notes, is_favorite, tags)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.user_id,
    data.name,
    data.description,
    data.notes,
    data.is_favorite,
    data.tags
  );
  return result.lastInsertRowId;
}

export async function getMeals(userId: number): Promise<CustomMeal[]> {
  const db = await openDatabase();
  return db.getAllAsync<CustomMeal>(
    'SELECT * FROM custom_meals WHERE user_id = ? ORDER BY name ASC',
    userId
  );
}

export async function getMealById(id: number): Promise<CustomMeal | null> {
  const db = await openDatabase();
  return db.getFirstAsync<CustomMeal>('SELECT * FROM custom_meals WHERE id = ?', id);
}

export async function updateMeal(
  id: number,
  data: Partial<Omit<CustomMeal, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const db = await openDatabase();
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.values(data);
  await db.runAsync(
    `UPDATE custom_meals SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
    ...values,
    id
  );
}

export async function deleteMeal(id: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM custom_meals WHERE id = ?', id);
}

export async function getMealItems(mealId: number): Promise<CustomMealItem[]> {
  const db = await openDatabase();
  return db.getAllAsync<CustomMealItem>(
    'SELECT * FROM custom_meal_items WHERE meal_id = ? ORDER BY sort_order ASC',
    mealId
  );
}

export async function addMealItem(
  data: Omit<CustomMealItem, 'id'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO custom_meal_items (meal_id, food_id, custom_food_id, recipe_id, servings, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.meal_id,
    data.food_id,
    data.custom_food_id,
    data.recipe_id,
    data.servings,
    data.sort_order
  );
  return result.lastInsertRowId;
}

export async function deleteMealItem(id: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM custom_meal_items WHERE id = ?', id);
}
