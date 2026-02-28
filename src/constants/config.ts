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

export const SAFE_CALORIE_MINIMUMS = {
  male: 1500,
  female: 1200,
  other: 1200,
} as const;
