/**
 * User database operations
 * Handles CRUD operations for user profiles
 */

import { openDatabase } from './init';
import type { User, CreateUserInput, UpdateUserInput } from '../../types/user';

/**
 * Create a new user profile
 * Note: This app is single-user, so this should only be called once during onboarding
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const db = await openDatabase();

  // Check if a user already exists (single user per device)
  const existingUser = await getCurrentUser();
  if (existingUser) {
    throw new Error('A user already exists. Use updateUser() to modify the existing profile.');
  }

  const result = await db.runAsync(
    `INSERT INTO users (
      height_cm,
      birth_date,
      sex,
      activity_level,
      goal_type,
      tdee_formula,
      target_weight_kg,
      goal_rate_kg_per_week,
      custom_calorie_target
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.height_cm,
      input.birth_date,
      input.sex,
      input.activity_level,
      input.goal_type,
      input.tdee_formula,
      input.target_weight_kg ?? null,
      input.goal_rate_kg_per_week ?? null,
      input.custom_calorie_target ?? null,
    ]
  );

  const userId = result.lastInsertRowId;

  const user = await getUserById(userId);
  if (!user) {
    throw new Error('Failed to retrieve newly created user');
  }

  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const db = await openDatabase();

  const user = await db.getFirstAsync<User>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );

  return user || null;
}

/**
 * Get the current user (first/only user in the database)
 * Since this is a single-user app, this returns the only user
 */
export async function getCurrentUser(): Promise<User | null> {
  const db = await openDatabase();

  const user = await db.getFirstAsync<User>(
    'SELECT * FROM users ORDER BY id ASC LIMIT 1'
  );

  return user || null;
}

/**
 * Update user profile
 */
export async function updateUser(id: number, updates: UpdateUserInput): Promise<User> {
  const db = await openDatabase();

  // Build dynamic UPDATE query based on provided fields
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.height_cm !== undefined) {
    fields.push('height_cm = ?');
    values.push(updates.height_cm);
  }
  if (updates.birth_date !== undefined) {
    fields.push('birth_date = ?');
    values.push(updates.birth_date);
  }
  if (updates.sex !== undefined) {
    fields.push('sex = ?');
    values.push(updates.sex);
  }
  if (updates.activity_level !== undefined) {
    fields.push('activity_level = ?');
    values.push(updates.activity_level);
  }
  if (updates.goal_type !== undefined) {
    fields.push('goal_type = ?');
    values.push(updates.goal_type);
  }
  if (updates.tdee_formula !== undefined) {
    fields.push('tdee_formula = ?');
    values.push(updates.tdee_formula);
  }
  if (updates.target_weight_kg !== undefined) {
    fields.push('target_weight_kg = ?');
    values.push(updates.target_weight_kg);
  }
  if (updates.goal_rate_kg_per_week !== undefined) {
    fields.push('goal_rate_kg_per_week = ?');
    values.push(updates.goal_rate_kg_per_week);
  }
  if (updates.custom_calorie_target !== undefined) {
    fields.push('custom_calorie_target = ?');
    values.push(updates.custom_calorie_target);
  }

  if (fields.length === 0) {
    throw new Error('No fields provided to update');
  }

  // Always update the updated_at timestamp
  fields.push("updated_at = datetime('now')");

  values.push(id);

  await db.runAsync(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values as number[]
  );

  const user = await getUserById(id);
  if (!user) {
    throw new Error('User not found after update');
  }

  return user;
}

/**
 * Delete user (and all associated data via CASCADE)
 * WARNING: This will delete ALL user data including logs, custom foods, etc.
 */
export async function deleteUser(id: number): Promise<void> {
  const db = await openDatabase();

  await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
}

/**
 * Check if a user exists in the database
 */
export async function userExists(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Calculate user's age from birth_date
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
