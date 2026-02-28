import type { GoalType } from '../../types/user';
import type { MacroTargets } from '../../types/calculations';

const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARB = 4;
const KCAL_PER_G_FAT = 9;

export function calculateMacroTargets(
  calories: number,
  weightKg: number,
  goalType: GoalType
): MacroTargets {
  // Protein: 2.2 g/kg for loss, 1.6 g/kg for maintenance/gain/recomp
  const proteinMultiplier = goalType === 'loss' ? 2.2 : 1.6;
  const proteinG = Math.round(proteinMultiplier * weightKg);

  // Fat: 0.9 g/kg (midpoint of 0.8–1.0 range)
  const fatG = Math.round(0.9 * weightKg);

  // Carbs: remainder
  const proteinCals = proteinG * KCAL_PER_G_PROTEIN;
  const fatCals = fatG * KCAL_PER_G_FAT;
  const carbCals = Math.max(0, calories - proteinCals - fatCals);
  const carbsG = Math.round(carbCals / KCAL_PER_G_CARB);

  return { proteinG, fatG, carbsG, calories };
}
