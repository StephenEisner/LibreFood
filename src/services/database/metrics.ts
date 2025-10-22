/**
 * Body metrics database operations
 * Handles weight, body fat %, and other body measurements
 */

import { openDatabase } from './init';
import type {
  BodyMetric,
  WeightEntry,
  BodyFatEntry,
  CreateMetricInput,
  MetricSummary,
} from '../../types/metrics';

/**
 * Add or update a body metric entry for a specific date
 * If an entry exists for the date, it will be updated
 */
export async function addOrUpdateMetric(input: CreateMetricInput): Promise<BodyMetric> {
  const db = await openDatabase();

  // Check if entry exists for this date
  const existing = await db.getFirstAsync<BodyMetric>(
    'SELECT * FROM body_metrics WHERE user_id = ? AND date = ?',
    [input.user_id, input.date]
  );

  if (existing) {
    // Update existing entry
    await db.runAsync(
      `UPDATE body_metrics
       SET weight_kg = ?, body_fat_percentage = ?, notes = ?
       WHERE id = ?`,
      [
        input.weight_kg !== undefined ? input.weight_kg : (existing.weight_kg ?? null),
        input.body_fat_percentage !== undefined
          ? input.body_fat_percentage
          : (existing.body_fat_percentage ?? null),
        input.notes !== undefined ? input.notes : (existing.notes ?? null),
        existing.id,
      ]
    );

    const updated = await getMetricById(existing.id);
    if (!updated) {
      throw new Error('Failed to retrieve updated metric');
    }
    return updated;
  } else {
    // Insert new entry
    const result = await db.runAsync(
      `INSERT INTO body_metrics (user_id, date, weight_kg, body_fat_percentage, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.user_id,
        input.date,
        input.weight_kg !== undefined ? input.weight_kg : null,
        input.body_fat_percentage !== undefined ? input.body_fat_percentage : null,
        input.notes !== undefined ? input.notes : null,
      ]
    );

    const metric = await getMetricById(result.lastInsertRowId);
    if (!metric) {
      throw new Error('Failed to retrieve newly created metric');
    }
    return metric;
  }
}

/**
 * Add a weight entry
 */
export async function addWeightEntry(
  userId: number,
  date: string,
  weightKg: number,
  notes?: string
): Promise<WeightEntry> {
  const metric = await addOrUpdateMetric({
    user_id: userId,
    date,
    weight_kg: weightKg,
    notes,
  });

  return {
    id: metric.id,
    user_id: metric.user_id,
    date: metric.date,
    weight_kg: metric.weight_kg!,
    created_at: metric.created_at,
  };
}

/**
 * Add a body fat percentage entry
 */
export async function addBodyFatEntry(
  userId: number,
  date: string,
  bodyFatPercentage: number,
  notes?: string
): Promise<BodyFatEntry> {
  const metric = await addOrUpdateMetric({
    user_id: userId,
    date,
    body_fat_percentage: bodyFatPercentage,
    notes,
  });

  return {
    id: metric.id,
    user_id: metric.user_id,
    date: metric.date,
    body_fat_percentage: metric.body_fat_percentage!,
    created_at: metric.created_at,
  };
}

/**
 * Get metric by ID
 */
export async function getMetricById(id: number): Promise<BodyMetric | null> {
  const db = await openDatabase();

  const metric = await db.getFirstAsync<BodyMetric>(
    'SELECT * FROM body_metrics WHERE id = ?',
    [id]
  );

  return metric || null;
}

/**
 * Get all metrics for a user within a date range
 */
export async function getMetricsForDateRange(
  userId: number,
  startDate: string,
  endDate: string
): Promise<BodyMetric[]> {
  const db = await openDatabase();

  const metrics = await db.getAllAsync<BodyMetric>(
    `SELECT * FROM body_metrics
     WHERE user_id = ? AND date >= ? AND date <= ?
     ORDER BY date DESC`,
    [userId, startDate, endDate]
  );

  return metrics;
}

/**
 * Get the latest weight entry for a user
 */
export async function getLatestWeight(userId: number): Promise<WeightEntry | null> {
  const db = await openDatabase();

  const metric = await db.getFirstAsync<BodyMetric>(
    `SELECT * FROM body_metrics
     WHERE user_id = ? AND weight_kg IS NOT NULL
     ORDER BY date DESC, created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (!metric || metric.weight_kg === null) {
    return null;
  }

  return {
    id: metric.id,
    user_id: metric.user_id,
    date: metric.date,
    weight_kg: metric.weight_kg!,
    created_at: metric.created_at,
  };
}

/**
 * Get the latest body fat percentage entry for a user
 */
export async function getLatestBodyFat(userId: number): Promise<BodyFatEntry | null> {
  const db = await openDatabase();

  const metric = await db.getFirstAsync<BodyMetric>(
    `SELECT * FROM body_metrics
     WHERE user_id = ? AND body_fat_percentage IS NOT NULL
     ORDER BY date DESC, created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (!metric || metric.body_fat_percentage === null) {
    return null;
  }

  return {
    id: metric.id,
    user_id: metric.user_id,
    date: metric.date,
    body_fat_percentage: metric.body_fat_percentage!,
    created_at: metric.created_at,
  };
}

/**
 * Get all weight entries for a user
 */
export async function getWeightHistory(userId: number): Promise<WeightEntry[]> {
  const db = await openDatabase();

  const metrics = await db.getAllAsync<BodyMetric>(
    `SELECT * FROM body_metrics
     WHERE user_id = ? AND weight_kg IS NOT NULL
     ORDER BY date DESC`,
    [userId]
  );

  return metrics.map((m) => ({
    id: m.id,
    user_id: m.user_id,
    date: m.date,
    weight_kg: m.weight_kg!,
    created_at: m.created_at,
  }));
}

/**
 * Delete a metric entry
 */
export async function deleteMetric(id: number): Promise<void> {
  const db = await openDatabase();

  await db.runAsync('DELETE FROM body_metrics WHERE id = ?', [id]);
}

/**
 * Get metric summary for a user
 */
export async function getMetricSummary(userId: number): Promise<MetricSummary> {
  const db = await openDatabase();

  // Get latest weight
  const latestWeightEntry = await getLatestWeight(userId);
  const latestWeight = latestWeightEntry?.weight_kg;

  // Get latest body fat
  const latestBodyFatEntry = await getLatestBodyFat(userId);
  const latestBodyFat = latestBodyFatEntry?.body_fat_percentage;

  // Get first weight for comparison
  const firstWeight = await db.getFirstAsync<{ weight_kg: number }>(
    `SELECT weight_kg FROM body_metrics
     WHERE user_id = ? AND weight_kg IS NOT NULL
     ORDER BY date ASC, created_at ASC
     LIMIT 1`,
    [userId]
  );

  // Calculate weight change
  let weightChange: number | undefined;
  if (latestWeight && firstWeight?.weight_kg) {
    weightChange = latestWeight - firstWeight.weight_kg;
  }

  // Calculate average weekly change (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];

  const recentWeights = await db.getAllAsync<{ weight_kg: number; date: string }>(
    `SELECT weight_kg, date FROM body_metrics
     WHERE user_id = ? AND weight_kg IS NOT NULL AND date >= ?
     ORDER BY date ASC`,
    [userId, startDate]
  );

  let avgWeeklyChange: number | undefined = undefined;
  if (recentWeights.length >= 2) {
    const oldestRecent = recentWeights[0];
    const newestRecent = recentWeights[recentWeights.length - 1];
    const daysDiff =
      (new Date(newestRecent.date).getTime() - new Date(oldestRecent.date).getTime()) /
      (1000 * 60 * 60 * 24);
    const totalChange = newestRecent.weight_kg - oldestRecent.weight_kg;
    avgWeeklyChange = (totalChange / daysDiff) * 7;
  }

  return {
    latestWeight: latestWeight ?? undefined,
    latestBodyFat: latestBodyFat ?? undefined,
    weightChange: weightChange ?? undefined,
    avgWeeklyChange: avgWeeklyChange ?? undefined,
  };
}
