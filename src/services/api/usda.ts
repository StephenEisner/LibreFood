import { API_BASE_URLS, USDA_API_KEY, USDA_PAGE_SIZE } from '../../constants/config';
import type { USDAFood, USDAFoodMeasure, USDANutrient, FoodSearchResult, FoodSearchResponse } from '../../types/api';
import type { Food, NutritionData } from '../../types/foods';

// Maps USDA nutrientNumber strings to NutritionData keys (all values are per 100g)
const NUTRIENT_MAP: Record<string, keyof NutritionData> = {
  '208': 'calories',
  '203': 'protein_g',
  '205': 'carbs_g',
  '204': 'fat_g',
  '291': 'fiber_g',
  '269': 'sugar_g',
  '539': 'added_sugar_g',
  '601': 'cholesterol_mg',
  '307': 'sodium_mg',
  '606': 'saturated_fat_g',
  '605': 'trans_fat_g',
  '645': 'monounsaturated_fat_g',
  '646': 'polyunsaturated_fat_g',
  '320': 'vitamin_a_mcg',
  '401': 'vitamin_c_mg',
  '328': 'vitamin_d_mcg',
  '323': 'vitamin_e_mg',
  '430': 'vitamin_k_mcg',
  '404': 'thiamin_mg',
  '405': 'riboflavin_mg',
  '406': 'niacin_mg',
  '415': 'vitamin_b6_mg',
  '435': 'folate_mcg',
  '418': 'vitamin_b12_mcg',
  '301': 'calcium_mg',
  '303': 'iron_mg',
  '304': 'magnesium_mg',
  '305': 'phosphorus_mg',
  '306': 'potassium_mg',
  '309': 'zinc_mg',
  '312': 'copper_mg',
  '315': 'manganese_mg',
  '317': 'selenium_mcg',
};

function extractNutrition(nutrients: USDANutrient[]): NutritionData {
  const byNumber = new Map<string, number>();
  for (const n of nutrients) {
    byNumber.set(n.nutrientNumber, n.value);
  }

  const result: NutritionData = { calories: 0 };
  for (const [num, key] of Object.entries(NUTRIENT_MAP)) {
    const val = byNumber.get(num);
    if (val !== undefined) {
      (result[key] as number) = val;
    }
  }
  return result;
}

export async function searchUSDA(query: string): Promise<FoodSearchResult[]> {
  const params = new URLSearchParams({
    query,
    dataType: 'Foundation,SR Legacy,Branded',
    pageSize: String(USDA_PAGE_SIZE),
    api_key: USDA_API_KEY,
  });
  const url = `${API_BASE_URLS.USDA}foods/search?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`USDA search failed: ${response.status}`);
  }
  const data = (await response.json()) as FoodSearchResponse;
  return data.foods ?? [];
}

export async function fetchUSDAFood(fdcId: number): Promise<USDAFood> {
  const params = new URLSearchParams({
    format: 'full',
    api_key: USDA_API_KEY,
  });
  const url = `${API_BASE_URLS.USDA}food/${fdcId}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`USDA food fetch failed: ${response.status}`);
  }
  return (await response.json()) as USDAFood;
}

function foodMeasuresSafe(food: USDAFood): USDAFoodMeasure[] {
  return Array.isArray(food.foodMeasures) ? food.foodMeasures : [];
}

export function usdaResultToFood(result: FoodSearchResult): Food {
  const nutrition = extractNutrition(result.foodNutrients);
  const now = new Date().toISOString();
  return {
    fdc_id: result.fdcId,
    description: result.description,
    data_type: result.dataType ?? null,
    brand_name: result.brandName ?? null,
    brand_owner: result.brandOwner ?? null,
    gtin_upc: result.gtinUpc ?? null,
    serving_size: result.servingSize ?? null,
    serving_size_unit: result.servingSizeUnit ?? null,
    household_serving_text: result.householdServingFullText ?? null,
    category: result.foodCategory ?? null,
    nutrition_json: JSON.stringify(nutrition),
    calories: nutrition.calories ?? null,
    protein_g: nutrition.protein_g ?? null,
    carbs_g: nutrition.carbs_g ?? null,
    fat_g: nutrition.fat_g ?? null,
    cached_at: now,
    updated_at: now,
  };
}

export function usdaDetailToFood(food: USDAFood): Food {
  const nutrition = extractNutrition(food.foodNutrients);
  const now = new Date().toISOString();
  return {
    fdc_id: food.fdcId,
    description: food.description,
    data_type: food.dataType ?? null,
    brand_name: food.brandName ?? null,
    brand_owner: food.brandOwner ?? null,
    gtin_upc: food.gtinUpc ?? null,
    serving_size: food.servingSize ?? null,
    serving_size_unit: food.servingSizeUnit ?? null,
    household_serving_text: food.householdServingFullText ?? null,
    category: food.foodCategory ?? null,
    nutrition_json: JSON.stringify(nutrition),
    calories: nutrition.calories ?? null,
    protein_g: nutrition.protein_g ?? null,
    carbs_g: nutrition.carbs_g ?? null,
    fat_g: nutrition.fat_g ?? null,
    cached_at: now,
    updated_at: now,
  };
}
