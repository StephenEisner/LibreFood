import { API_BASE_URLS } from '../../constants/config';
import type { Food, NutritionData } from '../../types/foods';

// Open Food Facts nutriments are per 100g, in grams (or kcal for energy).
// Exceptions: sodium, cholesterol, and mineral fields are in grams — multiply × 1000 for mg.

interface OFSearchProduct {
  code: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;    // human-readable text, e.g. "1 cup (240ml)"
  serving_quantity?: number; // grams equivalent of one serving
  nutriments?: Record<string, number>;
}

interface OFSearchResponse {
  count: number;
  page: number;
  page_size: number;
  products: OFSearchProduct[];
}

const PAGE_SIZE = 20;

// Synthetic numeric fdc_id for OFF products.
// Numeric barcodes (EAN-8/13, UPC-A): 8-13 digits, safely above USDA ID range (~6-7 digits).
// Alphanumeric codes: hashed into 10^13+ range to avoid all collisions.
export function offSyntheticFdcId(code: string): number {
  const asNum = parseInt(code, 10);
  if (!isNaN(asNum) && String(asNum) === code && asNum > 9_999_999) {
    return asNum; // barcode is already a safe, non-conflicting number
  }
  // Unsigned 32-bit hash, then offset into 10^13 range
  let h = 0x4f464600; // 'OFF\0' seed
  for (let i = 0; i < code.length; i++) {
    h = (Math.imul(h ^ code.charCodeAt(i), 0x9e3779b9) >>> 0);
  }
  return 10_000_000_000_000 + (h % 1_000_000_000);
}

function extractNutrition(nutriments: Record<string, number> | undefined): NutritionData {
  if (!nutriments) return { calories: 0 };
  const n = nutriments;

  const result: NutritionData = {
    calories: n['energy-kcal_100g'] ?? 0,
  };

  // Macros (g/100g → direct)
  if (n['proteins_100g'] != null)      result.protein_g       = n['proteins_100g'];
  if (n['carbohydrates_100g'] != null) result.carbs_g         = n['carbohydrates_100g'];
  if (n['fat_100g'] != null)           result.fat_g           = n['fat_100g'];
  if (n['fiber_100g'] != null)         result.fiber_g         = n['fiber_100g'];
  if (n['sugars_100g'] != null)        result.sugar_g         = n['sugars_100g'];
  if (n['saturated-fat_100g'] != null) result.saturated_fat_g = n['saturated-fat_100g'];
  if (n['trans-fat_100g'] != null)     result.trans_fat_g     = n['trans-fat_100g'];
  if (n['monounsaturated-fat_100g'] != null) result.monounsaturated_fat_g = n['monounsaturated-fat_100g'];
  if (n['polyunsaturated-fat_100g'] != null) result.polyunsaturated_fat_g = n['polyunsaturated-fat_100g'];

  // Minerals stored in g/100g → convert to mg
  if (n['sodium_100g'] != null)        result.sodium_mg      = n['sodium_100g'] * 1000;
  if (n['cholesterol_100g'] != null)   result.cholesterol_mg = n['cholesterol_100g'] * 1000;
  if (n['calcium_100g'] != null)       result.calcium_mg     = n['calcium_100g'] * 1000;
  if (n['iron_100g'] != null)          result.iron_mg        = n['iron_100g'] * 1000;
  if (n['potassium_100g'] != null)     result.potassium_mg   = n['potassium_100g'] * 1000;
  if (n['magnesium_100g'] != null)     result.magnesium_mg   = n['magnesium_100g'] * 1000;
  if (n['zinc_100g'] != null)          result.zinc_mg        = n['zinc_100g'] * 1000;

  return result;
}

export function offProductToFood(product: OFSearchProduct): Food {
  const nutrition = extractNutrition(product.nutriments);
  const now = new Date().toISOString();
  const fdc_id = offSyntheticFdcId(product.code);

  return {
    fdc_id,
    description: product.product_name?.trim() || 'Unknown Product',
    data_type: 'OpenFoodFacts',
    brand_name: product.brands ?? null,
    brand_owner: null,
    gtin_upc: product.code,
    serving_size: product.serving_quantity ?? null,
    serving_size_unit: product.serving_quantity ? 'g' : null,
    household_serving_text: product.serving_size ?? null,
    category: null,
    nutrition_json: JSON.stringify(nutrition),
    calories: nutrition.calories ?? null,
    protein_g: nutrition.protein_g ?? null,
    carbs_g: nutrition.carbs_g ?? null,
    fat_g: nutrition.fat_g ?? null,
    cached_at: now,
    updated_at: now,
  };
}

export async function searchOFF(query: string): Promise<OFSearchProduct[]> {
  const params = new URLSearchParams({
    search_terms: query,
    fields: 'code,product_name,brands,nutriments,serving_size,serving_quantity',
    json: '1',
    page_size: String(PAGE_SIZE),
  });
  const url = `${API_BASE_URLS.OPEN_FOOD_FACTS}search?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OFF search failed: ${response.status}`);
  }
  const data = (await response.json()) as OFSearchResponse;
  return (data.products ?? []).filter(
    (p) => p.product_name && p.product_name.trim().length > 0
  );
}
