/**
 * Mock database for Expo Go (doesn't support expo-sqlite)
 * This provides in-memory storage for testing in Expo Go
 */

import type { User, CreateUserInput, UpdateUserInput } from '../../types/user';
import type { BodyMetric, CreateMetricInput } from '../../types/metrics';

// In-memory storage
let mockUser: User | null = null;
let mockMetrics: BodyMetric[] = [];
let nextMetricId = 1;

export const mockDatabase = {
  // User operations
  async createUser(input: CreateUserInput): Promise<User> {
    if (mockUser) {
      throw new Error('A user already exists');
    }

    mockUser = {
      id: 1,
      ...input,
      target_weight_kg: input.target_weight_kg ?? null,
      goal_rate_kg_per_week: input.goal_rate_kg_per_week ?? null,
      custom_calorie_target: input.custom_calorie_target ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return mockUser;
  },

  async getCurrentUser(): Promise<User | null> {
    return mockUser;
  },

  async updateUser(id: number, updates: UpdateUserInput): Promise<User> {
    if (!mockUser || mockUser.id !== id) {
      throw new Error('User not found');
    }

    mockUser = {
      ...mockUser,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return mockUser;
  },

  async userExists(): Promise<boolean> {
    return mockUser !== null;
  },

  // Metrics operations
  async addMetric(input: CreateMetricInput): Promise<BodyMetric> {
    const metric: BodyMetric = {
      id: nextMetricId++,
      user_id: input.user_id,
      date: input.date,
      weight_kg: input.weight_kg ?? null,
      body_fat_percentage: input.body_fat_percentage ?? null,
      notes: input.notes ?? null,
      created_at: new Date().toISOString(),
    };

    mockMetrics.push(metric);
    return metric;
  },

  async getLatestWeight(userId: number): Promise<{ weight_kg: number } | null> {
    const withWeight = mockMetrics
      .filter((m) => m.user_id === userId && m.weight_kg !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return withWeight[0] ? { weight_kg: withWeight[0].weight_kg! } : null;
  },

  async getMetrics(userId: number): Promise<BodyMetric[]> {
    return mockMetrics.filter((m) => m.user_id === userId);
  },

  // Reset for demo purposes
  async reset(): Promise<void> {
    mockUser = null;
    mockMetrics = [];
    nextMetricId = 1;
  },

  // Initialize with demo data
  async seedDemoData(): Promise<void> {
    await this.reset();

    // Create demo user
    await this.createUser({
      height_cm: 175,
      birth_date: '1990-01-01',
      sex: 'male',
      activity_level: 'moderate',
      goal_type: 'lose_weight',
      tdee_formula: 'mifflin_st_jeor',
      target_weight_kg: 75,
      goal_rate_kg_per_week: 0.5,
    });

    // Add some demo weight entries
    const today = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      await this.addMetric({
        user_id: 1,
        date: date.toISOString().split('T')[0],
        weight_kg: 80 - i * 0.3, // Simulating weight loss
      });
    }
  },
};
