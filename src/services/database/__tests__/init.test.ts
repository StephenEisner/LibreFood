/**
 * Tests for database initialization
 */

import * as SQLite from 'expo-sqlite';
import { initDatabase, dropAllTables, resetDatabase, openDatabase } from '../init';

// Mock expo-sqlite
jest.mock('expo-sqlite');

describe('Database Initialization', () => {
  let mockDb: jest.Mocked<SQLite.SQLiteDatabase>;

  beforeEach(() => {
    // Create mock database with required methods
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

  describe('openDatabase', () => {
    it('should open the database with correct name', async () => {
      await openDatabase();

      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('librefood.db');
    });

    it('should return the database instance', async () => {
      const db = await openDatabase();

      expect(db).toBe(mockDb);
    });
  });

  describe('initDatabase', () => {
    it('should enable foreign keys', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      await initDatabase();

      expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON;');
    });

    it('should create schema_version table', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      await initDatabase();

      const execCalls = (mockDb.execAsync as jest.Mock).mock.calls;
      const schemaVersionCall = execCalls.find((call) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS schema_version')
      );

      expect(schemaVersionCall).toBeDefined();
    });

    it('should apply migration 1 when database is new', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      await initDatabase();

      const execCalls = (mockDb.execAsync as jest.Mock).mock.calls;
      const userTableCall = execCalls.find((call) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS users')
      );

      expect(userTableCall).toBeDefined();
    });

    it('should not apply migrations if already at current version', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ version: 1 });

      await initDatabase();

      // Should only have PRAGMA and schema_version table creation
      expect(mockDb.execAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during initialization', async () => {
      mockDb.execAsync.mockRejectedValue(new Error('Database error'));

      await expect(initDatabase()).rejects.toThrow('Database error');
    });
  });

  describe('dropAllTables', () => {
    it('should drop all tables in correct order', async () => {
      await dropAllTables();

      const execCall = (mockDb.execAsync as jest.Mock).mock.calls[0][0];

      expect(execCall).toContain('DROP TABLE IF EXISTS food_log');
      expect(execCall).toContain('DROP TABLE IF EXISTS users');
      expect(execCall).toContain('PRAGMA foreign_keys = OFF');
      expect(execCall).toContain('PRAGMA foreign_keys = ON');
    });
  });

  describe('resetDatabase', () => {
    it('should drop tables and reinitialize', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      await resetDatabase();

      // Check that execAsync was called for both drop and init
      const execCalls = (mockDb.execAsync as jest.Mock).mock.calls;

      // Should have: DROP tables, PRAGMA, schema_version table, migration 1
      expect(execCalls.length).toBeGreaterThan(2);
    });
  });

  describe('Migration 1', () => {
    beforeEach(() => {
      mockDb.getFirstAsync.mockResolvedValue(null);
    });

    it('should create users table with all columns', async () => {
      await initDatabase();

      const execCalls = (mockDb.execAsync as jest.Mock).mock.calls;
      const migration1Call = execCalls.find((call) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS users')
      );

      expect(migration1Call).toBeDefined();
      expect(migration1Call![0]).toContain('height_cm');
      expect(migration1Call![0]).toContain('birth_date');
      expect(migration1Call![0]).toContain('sex');
      expect(migration1Call![0]).toContain('activity_level');
      expect(migration1Call![0]).toContain('goal_type');
      expect(migration1Call![0]).toContain('tdee_formula');
    });

    it('should create body_metrics table with foreign key', async () => {
      await initDatabase();

      const execCalls = (mockDb.execAsync as jest.Mock).mock.calls;
      const migration1Call = execCalls.find((call) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS body_metrics')
      );

      expect(migration1Call).toBeDefined();
      expect(migration1Call![0]).toContain('FOREIGN KEY (user_id) REFERENCES users(id)');
      expect(migration1Call![0]).toContain('ON DELETE CASCADE');
    });

    it('should create all food-related tables', async () => {
      await initDatabase();

      const execCalls = (mockDb.execAsync as jest.Mock).mock.calls;
      const migration1Call = execCalls.find((call) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS foods')
      );

      expect(migration1Call).toBeDefined();
      expect(migration1Call![0]).toContain('CREATE TABLE IF NOT EXISTS foods');
      expect(migration1Call![0]).toContain('CREATE TABLE IF NOT EXISTS custom_foods');
      expect(migration1Call![0]).toContain('CREATE TABLE IF NOT EXISTS custom_meals');
      expect(migration1Call![0]).toContain('CREATE TABLE IF NOT EXISTS custom_recipes');
    });

    it('should create indexes for performance', async () => {
      await initDatabase();

      const execCalls = (mockDb.execAsync as jest.Mock).mock.calls;
      const migration1Call = execCalls.find((call) => call[0].includes('CREATE INDEX'));

      expect(migration1Call).toBeDefined();
      expect(migration1Call![0]).toContain('idx_body_metrics_user_date');
      expect(migration1Call![0]).toContain('idx_foods_fdc_id');
      expect(migration1Call![0]).toContain('idx_custom_foods_user');
    });

    it('should record schema version 1', async () => {
      await initDatabase();

      const execCalls = (mockDb.execAsync as jest.Mock).mock.calls;
      const migration1Call = execCalls.find((call) =>
        call[0].includes('INSERT INTO schema_version')
      );

      expect(migration1Call).toBeDefined();
      expect(migration1Call![0]).toContain('VALUES (1)');
    });
  });
});
