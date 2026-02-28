import type { NutritionData } from '../../types/foods';

type NutritionKey = keyof NutritionData;

const NUTRITION_KEYS: NutritionKey[] = [
  'calories',
  'protein_g',
  'carbs_g',
  'fat_g',
  'fiber_g',
  'sugar_g',
  'added_sugar_g',
  'cholesterol_mg',
  'sodium_mg',
  'saturated_fat_g',
  'trans_fat_g',
  'monounsaturated_fat_g',
  'polyunsaturated_fat_g',
  'vitamin_a_mcg',
  'vitamin_c_mg',
  'vitamin_d_mcg',
  'vitamin_e_mg',
  'vitamin_k_mcg',
  'thiamin_mg',
  'riboflavin_mg',
  'niacin_mg',
  'vitamin_b6_mg',
  'folate_mcg',
  'vitamin_b12_mcg',
  'calcium_mg',
  'iron_mg',
  'magnesium_mg',
  'phosphorus_mg',
  'potassium_mg',
  'zinc_mg',
  'copper_mg',
  'manganese_mg',
  'selenium_mcg',
];

export function sumNutrition(entries: NutritionData[]): NutritionData {
  const result: NutritionData = { calories: 0 };

  for (const entry of entries) {
    for (const key of NUTRITION_KEYS) {
      const value = entry[key];
      if (value !== undefined) {
        (result[key] as number) = ((result[key] as number | undefined) ?? 0) + value;
      }
    }
  }

  return result;
}

export function scaleNutrition(nutrition: NutritionData, multiplier: number): NutritionData {
  const result: NutritionData = { calories: 0 };

  for (const key of NUTRITION_KEYS) {
    const value = nutrition[key];
    if (value !== undefined) {
      (result[key] as number) = value * multiplier;
    }
  }

  return result;
}
