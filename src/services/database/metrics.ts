import type { BodyMetrics, ProgressPhoto, PhotoType } from '../../types/metrics';
import { openDatabase } from './init';

export async function addMetric(
  data: Omit<BodyMetrics, 'id' | 'created_at'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO body_metrics (user_id, date, weight_kg, body_fat_percentage, notes)
     VALUES (?, ?, ?, ?, ?)`,
    data.user_id,
    data.date,
    data.weight_kg,
    data.body_fat_percentage,
    data.notes
  );
  return result.lastInsertRowId;
}

export async function getMetrics(userId: number): Promise<BodyMetrics[]> {
  const db = await openDatabase();
  return db.getAllAsync<BodyMetrics>(
    'SELECT * FROM body_metrics WHERE user_id = ? ORDER BY date DESC',
    userId
  );
}

export async function getLatestMetric(userId: number): Promise<BodyMetrics | null> {
  const db = await openDatabase();
  return db.getFirstAsync<BodyMetrics>(
    'SELECT * FROM body_metrics WHERE user_id = ? ORDER BY date DESC LIMIT 1',
    userId
  );
}

export async function deleteMetric(id: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM body_metrics WHERE id = ?', id);
}

export async function addProgressPhoto(
  data: Omit<ProgressPhoto, 'id' | 'created_at'>
): Promise<number> {
  const db = await openDatabase();
  const result = await db.runAsync(
    `INSERT INTO progress_photos (user_id, date, photo_type, file_path, notes)
     VALUES (?, ?, ?, ?, ?)`,
    data.user_id,
    data.date,
    data.photo_type,
    data.file_path,
    data.notes
  );
  return result.lastInsertRowId;
}

export async function getProgressPhotos(
  userId: number,
  photoType?: PhotoType
): Promise<ProgressPhoto[]> {
  const db = await openDatabase();
  if (photoType) {
    return db.getAllAsync<ProgressPhoto>(
      'SELECT * FROM progress_photos WHERE user_id = ? AND photo_type = ? ORDER BY date DESC',
      userId,
      photoType
    );
  }
  return db.getAllAsync<ProgressPhoto>(
    'SELECT * FROM progress_photos WHERE user_id = ? ORDER BY date DESC',
    userId
  );
}

export async function deleteProgressPhoto(id: number): Promise<void> {
  const db = await openDatabase();
  await db.runAsync('DELETE FROM progress_photos WHERE id = ?', id);
}
