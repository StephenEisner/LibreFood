/**
 * Body metrics TypeScript types
 */

export interface BodyMetric {
  id: number;
  user_id: number;
  date: string; // ISO date string (YYYY-MM-DD)
  weight_kg?: number | null;
  body_fat_percentage?: number | null;
  notes?: string | null;
  created_at: string; // ISO datetime string
}

export interface WeightEntry {
  id: number;
  user_id: number;
  date: string;
  weight_kg: number;
  created_at: string;
}

export interface BodyFatEntry {
  id: number;
  user_id: number;
  date: string;
  body_fat_percentage: number;
  created_at: string;
}

export interface CreateMetricInput {
  user_id: number;
  date: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  notes?: string;
}

export interface MetricSummary {
  latestWeight?: number;
  latestBodyFat?: number;
  weightChange?: number; // Change from first to last weight
  avgWeeklyChange?: number; // Average weekly change over period
}
