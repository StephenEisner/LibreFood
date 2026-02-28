export type PhotoType = 'front' | 'side' | 'back' | 'other';

export interface BodyMetrics {
  id: number;
  user_id: number;
  date: string; // ISO date
  weight_kg: number | null;
  body_fat_percentage: number | null;
  notes: string | null;
  created_at: string;
}

export interface ProgressPhoto {
  id: number;
  user_id: number;
  date: string; // ISO date
  photo_type: PhotoType;
  file_path: string;
  notes: string | null;
  created_at: string;
}
