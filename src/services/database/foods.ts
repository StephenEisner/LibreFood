import type { Food, CustomFood } from '../../types/foods';
import { openDatabase } from './init';

export async function cacheFood(food: Omit<Food, 'cached_at' | 'updated_at'>): Promise<void> {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO foods (fdc_id, description, data_type, brand_name, brand_owner,
      gtin_upc, serving_size, serving_size_unit, household_serving_text, category,
      nutrition_json, calories, protein_g, carbs_g, fat_g)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    food.fdc_id,
    food.description,
    food.data_type,
    food.brand_name,
    food.brand_owner,
    food.gtin_upc,
    food.serving_size,
    food.serving_size_unit,
    food.household_serving_text,
    food.category,
    food.nutrition_json,
    food.calories,
    food.protein_g,
    food.carbs_g,
    food.fat_g
  );
}

export async function getFoodByFdcId(fdcId: number): Promise<Food | null> {
  const db = await openDatabase();
  return db.getFirstAsync<Food>('SELECT * FROM foods WHERE fdc_id = ?', fdcId);
}

export async function searchFoodsLocal(query: string, limit = 20): Promise<Food[]> {
  const db = await openDatabase();
  return db.getAllAsync<Food>(
    'SELECT * FROM foods WHERE description LIKE ? ORDER BY description ASC LIMIT ?',
    `%${query}%`,
    limit
  );
}

export async function getFoodsByIds(fdcIds: number[]): Promise<Food[]> {
  if (fdcIds.length === 0) return [];
  const db = await openDatabase();
  const placeholders = fdcIds.map(() => '?').join(', ');
  return db.getAllAsync<Food>(`SELECT * FROM foods WHERE fdc_id IN (${placeholders})`, ...fdcIds);
}

export async function createCustomFood(
  data: Omit<CustomFood, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO custom_foods (user_id, name, brand, serving_size, serving_size_unit,
      household_serving_text, nutrition_json, calories, protein_g, carbs_g, fat_g, is_favorite)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.user_id,
    data.name,
    data.brand,
    data.serving_size,
    data.serving_size_unit,
    data.household_serving_text,
    data.nutrition_json,
    data.calories,
    data.protein_g,
    data.carbs_g,
    data.fat_g,
    data.is_favorite
  );
  return result.lastInsertRowId;
}

export async function getCustomFoodById(id: number): Promise<CustomFood | null> {
  const db = await openDatabase();
  return db.getFirstAsync<CustomFood>('SELECT * FROM custom_foods WHERE id = ?', id);
}

export async function getCustomFoodsByUser(userId: number): Promise<CustomFood[]> {
  const db = await openDatabase();
  return db.getAllAsync<CustomFood>(
    'SELECT * FROM custom_foods WHERE user_id = ? ORDER BY name ASC',
    userId
  );
}

export async function updateCustomFood(
  id: number,
  data: Partial<Omit<CustomFood, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const db = await openDatabase();
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.values(data);
  await db.runAsync(
    `UPDATE custom_foods SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
    ...values,
    id
  );
}

export async function deleteCustomFood(id: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM custom_foods WHERE id = ?', id);
}
