import { openDatabase } from './init';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLogEntry {
  id: number;
  user_id: number;
  date: string; // ISO date
  meal_type: MealType;
  food_id: number | null;
  custom_food_id: number | null;
  custom_meal_id: number | null;
  custom_recipe_id: number | null;
  servings: number;
  logged_nutrition_json: string;
  logged_calories: number | null;
  logged_protein_g: number | null;
  logged_carbs_g: number | null;
  logged_fat_g: number | null;
  notes: string | null;
  time: string | null;
  sort_order: number;
  created_at: string;
}

export interface DailyTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface FoodLogDisplayEntry extends FoodLogEntry {
  food_name: string;
  food_brand: string | null;
}

export async function getLogForDateWithNames(
  userId: number,
  date: string
): Promise<FoodLogDisplayEntry[]> {
  const db = await openDatabase();
  return db.getAllAsync<FoodLogDisplayEntry>(
    `SELECT fl.*,
       COALESCE(f.description, cf.name, 'Unknown Food') as food_name,
       COALESCE(f.brand_name, cf.brand) as food_brand
     FROM food_log fl
     LEFT JOIN foods f ON fl.food_id = f.fdc_id
     LEFT JOIN custom_foods cf ON fl.custom_food_id = cf.id
     WHERE fl.user_id = ? AND fl.date = ?
     ORDER BY fl.meal_type ASC, fl.sort_order ASC, fl.created_at ASC`,
    userId,
    date
  );
}

export async function logFood(
  data: Omit<FoodLogEntry, 'id' | 'created_at'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO food_log (user_id, date, meal_type, food_id, custom_food_id,
      custom_meal_id, custom_recipe_id, servings, logged_nutrition_json,
      logged_calories, logged_protein_g, logged_carbs_g, logged_fat_g,
      notes, time, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.user_id,
    data.date,
    data.meal_type,
    data.food_id,
    data.custom_food_id,
    data.custom_meal_id,
    data.custom_recipe_id,
    data.servings,
    data.logged_nutrition_json,
    data.logged_calories,
    data.logged_protein_g,
    data.logged_carbs_g,
    data.logged_fat_g,
    data.notes,
    data.time,
    data.sort_order
  );
  return result.lastInsertRowId;
}

export async function getLogForDate(userId: number, date: string): Promise<FoodLogEntry[]> {
  const db = await openDatabase();
  return db.getAllAsync<FoodLogEntry>(
    `SELECT * FROM food_log WHERE user_id = ? AND date = ?
     ORDER BY meal_type ASC, sort_order ASC, created_at ASC`,
    userId,
    date
  );
}

export async function updateLogEntry(
  id: number,
  data: Partial<Pick<FoodLogEntry, 'servings' | 'notes' | 'time' | 'logged_nutrition_json' | 'logged_calories' | 'logged_protein_g' | 'logged_carbs_g' | 'logged_fat_g'>>
): Promise<void> {
  const db = await openDatabase();
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.values(data);
  await db.runAsync(`UPDATE food_log SET ${fields} WHERE id = ?`, ...values, id);
}

export async function deleteLogEntry(id: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM food_log WHERE id = ?', id);
}

export async function getDailyTotals(userId: number, date: string): Promise<DailyTotals> {
  const db = await openDatabase();
  const result = await db.getFirstAsync<DailyTotals>(
    `SELECT
       COALESCE(SUM(logged_calories), 0) AS calories,
       COALESCE(SUM(logged_protein_g), 0) AS protein_g,
       COALESCE(SUM(logged_carbs_g), 0) AS carbs_g,
       COALESCE(SUM(logged_fat_g), 0) AS fat_g
     FROM food_log WHERE user_id = ? AND date = ?`,
    userId,
    date
  );
  return result ?? { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
}
