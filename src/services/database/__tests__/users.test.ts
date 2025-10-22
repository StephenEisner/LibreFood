/**
 * Tests for user CRUD operations
 */

import * as SQLite from 'expo-sqlite';
import {
  createUser,
  getUserById,
  getCurrentUser,
  updateUser,
  deleteUser,
  userExists,
  calculateAge,
} from '../users';
import type { User, CreateUserInput } from '../../../types/user';

// Mock expo-sqlite
jest.mock('expo-sqlite');

describe('User CRUD Operations', () => {
  let mockDb: jest.Mocked<SQLite.SQLiteDatabase>;

  beforeEach(() => {
    // Create mock database
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

  describe('createUser', () => {
    const validUserInput: CreateUserInput = {
      height_cm: 175,
      birth_date: '1990-01-01',
      sex: 'male',
      activity_level: 'moderate',
      goal_type: 'lose_weight',
      tdee_formula: 'mifflin_st_jeor',
      target_weight_kg: 75,
      goal_rate_kg_per_week: 0.5,
    };

    it('should create a new user with valid input', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null); // No existing user
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 1, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        ...validUserInput,
        custom_calorie_target: null,
        created_at: '2025-10-22T00:00:00Z',
        updated_at: '2025-10-22T00:00:00Z',
      } as User);

      const user = await createUser(validUserInput);

      expect(user.id).toBe(1);
      expect(user.height_cm).toBe(175);
      expect(user.sex).toBe('male');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([175, '1990-01-01', 'male', 'moderate'])
      );
    });

    it('should throw error if user already exists', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        ...validUserInput,
      } as User);

      await expect(createUser(validUserInput)).rejects.toThrow(
        'A user already exists'
      );
    });

    it('should handle optional fields correctly', async () => {
      const minimalInput: CreateUserInput = {
        height_cm: 170,
        birth_date: '1995-05-15',
        sex: 'female',
        activity_level: 'light',
        goal_type: 'maintain_weight',
        tdee_formula: 'harris_benedict',
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(null);
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 1, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        ...minimalInput,
        target_weight_kg: null,
        goal_rate_kg_per_week: null,
        custom_calorie_target: null,
        created_at: '2025-10-22T00:00:00Z',
        updated_at: '2025-10-22T00:00:00Z',
      } as User);

      const user = await createUser(minimalInput);

      expect(user.target_weight_kg).toBeNull();
      expect(user.goal_rate_kg_per_week).toBeNull();
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null, null, null])
      );
    });

    it('should throw error if failed to retrieve created user', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null); // No existing user
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 1, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce(null); // Failed to retrieve

      await expect(createUser(validUserInput)).rejects.toThrow(
        'Failed to retrieve newly created user'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser: User = {
        id: 1,
        height_cm: 180,
        birth_date: '1992-03-15',
        sex: 'male',
        activity_level: 'active',
        goal_type: 'gain_weight',
        tdee_formula: 'mifflin_st_jeor',
        target_weight_kg: 85,
        goal_rate_kg_per_week: 0.25,
        custom_calorie_target: null,
        created_at: '2025-10-22T00:00:00Z',
        updated_at: '2025-10-22T00:00:00Z',
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(mockUser);

      const user = await getUserById(1);

      expect(user).toEqual(mockUser);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [1]
      );
    });

    it('should return null when user not found', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const user = await getUserById(999);

      expect(user).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the first user in database', async () => {
      const mockUser: User = {
        id: 1,
        height_cm: 165,
        birth_date: '1988-07-20',
        sex: 'female',
        activity_level: 'moderate',
        goal_type: 'lose_weight',
        tdee_formula: 'mifflin_st_jeor',
        target_weight_kg: 60,
        goal_rate_kg_per_week: 0.5,
        custom_calorie_target: null,
        created_at: '2025-10-22T00:00:00Z',
        updated_at: '2025-10-22T00:00:00Z',
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(mockUser);

      const user = await getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY id ASC LIMIT 1')
      );
    });

    it('should return null when no users exist', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const mockUser: User = {
        id: 1,
        height_cm: 180,
        birth_date: '1990-01-01',
        sex: 'male',
        activity_level: 'active',
        goal_type: 'lose_weight',
        tdee_formula: 'mifflin_st_jeor',
        target_weight_kg: 70,
        goal_rate_kg_per_week: 0.5,
        custom_calorie_target: null,
        created_at: '2025-10-22T00:00:00Z',
        updated_at: '2025-10-22T00:00:00Z',
      };

      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 0, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({ ...mockUser, activity_level: 'very_active' });

      const user = await updateUser(1, { activity_level: 'very_active' });

      expect(user.activity_level).toBe('very_active');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET'),
        expect.arrayContaining(['very_active', 1])
      );
    });

    it('should update multiple fields at once', async () => {
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 0, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        height_cm: 175,
        target_weight_kg: 68,
      } as User);

      await updateUser(1, {
        height_cm: 175,
        target_weight_kg: 68,
      });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('height_cm = ?'),
        expect.arrayContaining([175, 68, 1])
      );
    });

    it('should handle null values for optional fields', async () => {
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 0, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce({
        id: 1,
        target_weight_kg: null,
      } as User);

      await updateUser(1, { target_weight_kg: null });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('target_weight_kg = ?'),
        expect.arrayContaining([null, 1])
      );
    });

    it('should throw error if no fields provided', async () => {
      await expect(updateUser(1, {})).rejects.toThrow('No fields provided to update');
    });

    it('should throw error if user not found after update', async () => {
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 0, changes: 1 });
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      await expect(updateUser(1, { height_cm: 180 })).rejects.toThrow(
        'User not found after update'
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 0, changes: 1 });

      await deleteUser(1);

      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', [1]);
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({ id: 1 } as User);

      const exists = await userExists();

      expect(exists).toBe(true);
    });

    it('should return false when no user exists', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const exists = await userExists();

      expect(exists).toBe(false);
    });
  });

  describe('calculateAge', () => {
    beforeAll(() => {
      // Mock current date to 2025-10-22
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-22'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should calculate age correctly', () => {
      expect(calculateAge('1990-01-01')).toBe(35);
      expect(calculateAge('2000-06-15')).toBe(25);
      expect(calculateAge('1985-12-25')).toBe(39);
    });

    it('should handle birthday not yet occurred this year', () => {
      expect(calculateAge('1990-11-15')).toBe(34); // Birthday hasn't happened yet in 2025
      expect(calculateAge('1990-10-22')).toBe(35); // Birthday is today
      expect(calculateAge('1990-10-23')).toBe(34); // Birthday is tomorrow
    });

    it('should handle leap year births', () => {
      expect(calculateAge('1992-02-29')).toBe(33);
    });
  });
});
