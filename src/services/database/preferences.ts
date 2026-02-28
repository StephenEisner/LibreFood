import type { UserTrackingPreferences } from '../../types/preferences';
import { openDatabase } from './init';

export async function createPreferences(
  data: Omit<UserTrackingPreferences, 'id'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO user_tracking_preferences (
      user_id, focus_mode, ui_theme, color_scheme,
      track_calories, track_protein, track_carbs, track_fat,
      track_fiber, track_sugar, track_cholesterol, track_sodium,
      track_saturated_fat, track_trans_fat,
      track_vitamin_a, track_vitamin_c, track_vitamin_d, track_vitamin_e, track_vitamin_k,
      track_thiamin, track_riboflavin, track_niacin, track_vitamin_b6, track_folate, track_vitamin_b12,
      track_calcium, track_iron, track_magnesium, track_phosphorus, track_potassium,
      track_zinc, track_copper, track_manganese, track_selenium,
      track_weight, track_body_fat, track_measurements,
      show_progress_photos, show_research_feed, show_recipes, show_meal_planning,
      dashboard_layout
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.user_id, data.focus_mode, data.ui_theme, data.color_scheme,
    data.track_calories, data.track_protein, data.track_carbs, data.track_fat,
    data.track_fiber, data.track_sugar, data.track_cholesterol, data.track_sodium,
    data.track_saturated_fat, data.track_trans_fat,
    data.track_vitamin_a, data.track_vitamin_c, data.track_vitamin_d, data.track_vitamin_e, data.track_vitamin_k,
    data.track_thiamin, data.track_riboflavin, data.track_niacin, data.track_vitamin_b6, data.track_folate, data.track_vitamin_b12,
    data.track_calcium, data.track_iron, data.track_magnesium, data.track_phosphorus, data.track_potassium,
    data.track_zinc, data.track_copper, data.track_manganese, data.track_selenium,
    data.track_weight, data.track_body_fat, data.track_measurements,
    data.show_progress_photos, data.show_research_feed, data.show_recipes, data.show_meal_planning,
    data.dashboard_layout
  );
  return result.lastInsertRowId;
}

export async function getPreferences(userId: number): Promise<UserTrackingPreferences | null> {
  const db = await openDatabase();
  return db.getFirstAsync<UserTrackingPreferences>(
    'SELECT * FROM user_tracking_preferences WHERE user_id = ?',
    userId
  );
}

export async function updatePreferences(
  userId: number,
  data: Partial<Omit<UserTrackingPreferences, 'id' | 'user_id'>>
): Promise<void> {
  const db = await openDatabase();
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.values(data);
  await db.runAsync(
    `UPDATE user_tracking_preferences SET ${fields} WHERE user_id = ?`,
    ...values,
    userId
  );
}
