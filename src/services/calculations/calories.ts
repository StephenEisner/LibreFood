import type { GoalType, Sex } from '../../types/user';
import type { CalorieTarget } from '../../types/calculations';
import { SAFE_CALORIE_MINIMUMS } from '../../constants/config';

// 1 kg of fat ≈ 7,700 calories
const KCAL_PER_KG = 7700;

export function calculateCalorieTarget(
  tdee: number,
  goalType: GoalType,
  sex: Sex,
  rateKgPerWeek?: number,
  customTarget?: number
): CalorieTarget {
  const minimum = SAFE_CALORIE_MINIMUMS[sex];

  switch (goalType) {
    case 'loss': {
      const rate = rateKgPerWeek ?? 0.5;
      const deficit = Math.round((rate * KCAL_PER_KG) / 7);
      const raw = tdee - deficit;
      const target = Math.max(raw, minimum);
      return { target, tdee, goalType, deficit };
    }
    case 'gain': {
      const rate = rateKgPerWeek ?? 0.25;
      const surplus = Math.round((rate * KCAL_PER_KG) / 7);
      const target = tdee + surplus;
      return { target, tdee, goalType, surplus };
    }
    case 'maintenance':
    case 'recomp':
      return { target: tdee, tdee, goalType };
    case 'custom': {
      const target = customTarget ?? tdee;
      return { target, tdee, goalType };
    }
  }
}
