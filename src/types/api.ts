// USDA FoodData Central API types

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface USDAFoodMeasure {
  disseminationText: string; // e.g. "1 cup", "1 tbsp"
  gramWeight: number;
  id: number;
  modifier: string;
  rank: number; // display order, ascending
}

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandName?: string;
  brandOwner?: string;
  gtinUpc?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodCategory?: string;
  foodNutrients: USDANutrient[];
  foodMeasures: USDAFoodMeasure[];
}

export interface FoodSearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  brandName?: string;
  brandOwner?: string;
  gtinUpc?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodCategory?: string;
  foodNutrients: USDANutrient[];
  score?: number;
}

export interface FoodSearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: FoodSearchResult[];
}

// Open Food Facts API types

export interface OFFProduct {
  code: string;
  product_name: string;
  brands?: string;
  serving_size?: string;
  nutriments?: Record<string, number | string>;
  image_url?: string;
}

export interface OFFResponse {
  status: number;
  product?: OFFProduct;
}

// PubMed API types

export interface PubMedArticle {
  pubmedId: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  url: string;
}

export interface PubMedSearchResponse {
  count: number;
  articles: PubMedArticle[];
}
