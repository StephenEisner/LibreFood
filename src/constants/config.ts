export const API_BASE_URLS = {
  USDA: 'https://api.nal.usda.gov/fdc/v1/',
  OPEN_FOOD_FACTS: 'https://world.openfoodfacts.org/api/v2/',
  PUBMED: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
} as const;

export const DB_NAME = 'librefood.db';

export const CACHE_TTL_MS = {
  RESEARCH_ARTICLES: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const GOAL_RATE_OPTIONS = [0.25, 0.5, 0.75, 1.0] as const;

// USDA FoodData Central API
// TODO (Phase 6): auto-provision per-user API keys to avoid DEMO_KEY rate limits
export const USDA_API_KEY = 'DEMO_KEY';
export const USDA_PAGE_SIZE = 25;

export interface MealTypeConfig {
  key: string;
  label: string;
}

// Phase 6: replace DEFAULT_MEAL_TYPES with a user-preferences array; all screens update automatically.
export const DEFAULT_MEAL_TYPES: MealTypeConfig[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snacks' },
];

export const SAFE_CALORIE_MINIMUMS = {
  male: 1500,
  female: 1200,
  other: 1200,
} as const;
