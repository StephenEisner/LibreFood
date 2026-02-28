import type { User } from '../../types/user';
import { openDatabase } from './init';

export async function createUser(
  data: Omit<User, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO users (name, height_cm, birth_date, sex, activity_level, tdee_formula,
      goal_type, goal_weight_kg, goal_rate_kg_per_week, custom_calorie_target,
      tracking_purpose, unit_system)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.name,
    data.height_cm,
    data.birth_date,
    data.sex,
    data.activity_level,
    data.tdee_formula,
    data.goal_type,
    data.goal_weight_kg,
    data.goal_rate_kg_per_week,
    data.custom_calorie_target,
    data.tracking_purpose,
    data.unit_system
  );
  return result.lastInsertRowId;
}

export async function getUser(id: number): Promise<User | null> {
  const db = await openDatabase();
  return db.getFirstAsync<User>('SELECT * FROM users WHERE id = ?', id);
}

export async function getFirstUser(): Promise<User | null> {
  const db = await openDatabase();
  return db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
}

export async function updateUser(id: number, data: Partial<Omit<User, 'id' | 'created_at'>>): Promise<void> {
  const db = await openDatabase();
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.values(data);
  await db.runAsync(
    `UPDATE users SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
    ...values,
    id
  );
}
