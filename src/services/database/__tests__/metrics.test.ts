/**
 * Tests for body metrics operations
 */

import * as SQLite from 'expo-sqlite';
import {
  addOrUpdateMetric,
  addWeightEntry,
  addBodyFatEntry,
  getMetricById,
  getMetricsForDateRange,
  getLatestWeight,
  getLatestBodyFat,
  getWeightHistory,
  deleteMetric,
  getMetricSummary,
} from '../metrics';
import type { BodyMetric, CreateMetricInput } from '../../../types/metrics';

// Mock expo-sqlite
jest.mock('expo-sqlite');

describe('Body Metrics Operations', () => {
  let mockDb: jest.Mocked<SQLite.SQLiteDatabase>;

  beforeEach(() => {
    mockDb = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
      closeAsync: jest.fn(),
      isPreparedStatementAsync: jest.fn(),
      prepareAsync: jest.fn(),
      transactionAsync: jest.fn(),
      withTransactionAsync: jest.fn(),
      withExclusiveTransactionAsync: jest.fn(),
      serializeAsync: jest.fn(),
      loadAsync: jest.fn(),
    } as unknown as jest.Mocked<SQLite.SQLiteDatabase>;

    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addOrUpdateMetric', () => {
    const validInput: CreateMetricInput = {
      user_id: 1,
      date: '2025-10-22',
      weight_kg: 75.5,
      body_fat_percentage: 18.5,
      notes: 'Morning weigh-in',
    };

    it('should create new metric when none exists for date', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null); // No existing
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 1, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        ...validInput,
        created_at: '2025-10-22T08:00:00Z',
      } as BodyMetric);

      const metric = await addOrUpdateMetric(validInput);

      expect(metric.id).toBe(1);
      expect(metric.weight_kg).toBe(75.5);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO body_metrics'),
        expect.arrayContaining([1, '2025-10-22', 75.5, 18.5, 'Morning weigh-in'])
      );
    });

    it('should update existing metric for same date', async () => {
      const existing: BodyMetric = {
        id: 1,
        user_id: 1,
        date: '2025-10-22',
        weight_kg: 75.0,
        body_fat_percentage: 19.0,
        notes: 'Old note',
        created_at: '2025-10-22T07:00:00Z',
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(existing); // Existing found
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 0, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({
        ...existing,
        weight_kg: 75.5,
        body_fat_percentage: 18.5,
        notes: 'Morning weigh-in',
      });

      const metric = await addOrUpdateMetric(validInput);

      expect(metric.weight_kg).toBe(75.5);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE body_metrics'),
        expect.arrayContaining([75.5, 18.5, 'Morning weigh-in', 1])
      );
    });

    it('should handle partial updates (only weight)', async () => {
      const existing: BodyMetric = {
        id: 1,
        user_id: 1,
        date: '2025-10-22',
        weight_kg: 75.0,
        body_fat_percentage: 18.0,
        notes: null,
        created_at: '2025-10-22T07:00:00Z',
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(existing);
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 0, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({
        ...existing,
        weight_kg: 76.0,
      });

      await addOrUpdateMetric({
        user_id: 1,
        date: '2025-10-22',
        weight_kg: 76.0,
      });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([76.0, 18.0, null, 1])
      );
    });
  });

  describe('addWeightEntry', () => {
    it('should add a weight entry', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 1, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        date: '2025-10-22',
        weight_kg: 80.0,
        body_fat_percentage: null,
        notes: 'Test',
        created_at: '2025-10-22T08:00:00Z',
      } as BodyMetric);

      const entry = await addWeightEntry(1, '2025-10-22', 80.0, 'Test');

      expect(entry.weight_kg).toBe(80.0);
      expect(entry.date).toBe('2025-10-22');
    });
  });

  describe('addBodyFatEntry', () => {
    it('should add a body fat entry', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 1, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        date: '2025-10-22',
        weight_kg: null,
        body_fat_percentage: 15.5,
        notes: null,
        created_at: '2025-10-22T08:00:00Z',
      } as BodyMetric);

      const entry = await addBodyFatEntry(1, '2025-10-22', 15.5);

      expect(entry.body_fat_percentage).toBe(15.5);
      expect(entry.date).toBe('2025-10-22');
    });
  });

  describe('getMetricById', () => {
    it('should return metric when found', async () => {
      const mockMetric: BodyMetric = {
        id: 1,
        user_id: 1,
        date: '2025-10-22',
        weight_kg: 75.0,
        body_fat_percentage: 18.0,
        notes: null,
        created_at: '2025-10-22T08:00:00Z',
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(mockMetric);

      const metric = await getMetricById(1);

      expect(metric).toEqual(mockMetric);
    });

    it('should return null when not found', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const metric = await getMetricById(999);

      expect(metric).toBeNull();
    });
  });

  describe('getMetricsForDateRange', () => {
    it('should return metrics within date range', async () => {
      const mockMetrics: BodyMetric[] = [
        {
          id: 1,
          user_id: 1,
          date: '2025-10-22',
          weight_kg: 75.0,
          body_fat_percentage: null,
          notes: null,
          created_at: '2025-10-22T08:00:00Z',
        },
        {
          id: 2,
          user_id: 1,
          date: '2025-10-21',
          weight_kg: 75.5,
          body_fat_percentage: null,
          notes: null,
          created_at: '2025-10-21T08:00:00Z',
        },
      ];

      mockDb.getAllAsync.mockResolvedValueOnce(mockMetrics);

      const metrics = await getMetricsForDateRange(1, '2025-10-20', '2025-10-22');

      expect(metrics).toHaveLength(2);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = ? AND date >= ? AND date <= ?'),
        [1, '2025-10-20', '2025-10-22']
      );
    });
  });

  describe('getLatestWeight', () => {
    it('should return latest weight entry', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        date: '2025-10-22',
        weight_kg: 75.0,
        body_fat_percentage: null,
        notes: null,
        created_at: '2025-10-22T08:00:00Z',
      } as BodyMetric);

      const entry = await getLatestWeight(1);

      expect(entry?.weight_kg).toBe(75.0);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('weight_kg IS NOT NULL'),
        [1]
      );
    });

    it('should return null when no weight entries exist', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const entry = await getLatestWeight(1);

      expect(entry).toBeNull();
    });
  });

  describe('getLatestBodyFat', () => {
    it('should return latest body fat entry', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        date: '2025-10-22',
        weight_kg: null,
        body_fat_percentage: 18.5,
        notes: null,
        created_at: '2025-10-22T08:00:00Z',
      } as BodyMetric);

      const entry = await getLatestBodyFat(1);

      expect(entry?.body_fat_percentage).toBe(18.5);
    });

    it('should return null when no body fat entries exist', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const entry = await getLatestBodyFat(1);

      expect(entry).toBeNull();
    });
  });

  describe('getWeightHistory', () => {
    it('should return all weight entries for user', async () => {
      const mockMetrics: BodyMetric[] = [
        {
          id: 1,
          user_id: 1,
          date: '2025-10-22',
          weight_kg: 75.0,
          body_fat_percentage: null,
          notes: null,
          created_at: '2025-10-22T08:00:00Z',
        },
        {
          id: 2,
          user_id: 1,
          date: '2025-10-21',
          weight_kg: 75.5,
          body_fat_percentage: null,
          notes: null,
          created_at: '2025-10-21T08:00:00Z',
        },
      ];

      mockDb.getAllAsync.mockResolvedValueOnce(mockMetrics);

      const history = await getWeightHistory(1);

      expect(history).toHaveLength(2);
      expect(history[0].weight_kg).toBe(75.0);
    });
  });

  describe('deleteMetric', () => {
    it('should delete metric by id', async () => {
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 0, changes: 1 });

      await deleteMetric(1);

      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM body_metrics WHERE id = ?', [1]);
    });
  });

  describe('getMetricSummary', () => {
    it('should calculate metric summary correctly', async () => {
      // Mock latest weight
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 3,
        weight_kg: 74.0,
        date: '2025-10-22',
      } as BodyMetric);

      // Mock latest body fat
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 2,
        body_fat_percentage: 17.5,
      } as BodyMetric);

      // Mock first weight
      mockDb.getFirstAsync.mockResolvedValueOnce({
        weight_kg: 80.0,
      });

      // Mock recent weights for avg calculation
      mockDb.getAllAsync.mockResolvedValueOnce([
        { weight_kg: 76.0, date: '2025-09-22' },
        { weight_kg: 74.0, date: '2025-10-22' },
      ]);

      const summary = await getMetricSummary(1);

      expect(summary.latestWeight).toBe(74.0);
      expect(summary.latestBodyFat).toBe(17.5);
      expect(summary.weightChange).toBe(-6.0); // 74 - 80
      expect(summary.avgWeeklyChange).toBeCloseTo(-0.467, 2); // (74-76)/30*7
    });

    it('should handle missing data gracefully', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);
      mockDb.getAllAsync.mockResolvedValue([]);

      const summary = await getMetricSummary(1);

      expect(summary.latestWeight).toBeUndefined();
      expect(summary.latestBodyFat).toBeUndefined();
      expect(summary.weightChange).toBeUndefined();
      expect(summary.avgWeeklyChange).toBeUndefined();
    });
  });
});
