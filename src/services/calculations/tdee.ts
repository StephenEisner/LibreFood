import type { ActivityLevel, TDEEFormula } from '../../types/user';
import type { BMRParams, TDEEResult } from '../../types/calculations';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function mifflinBMR(params: BMRParams): number {
  const { weight_kg, height_cm, age, sex } = params;
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

function harrisBMR(params: BMRParams): number {
  const { weight_kg, height_cm, age, sex } = params;
  if (sex === 'male') {
    return 88.362 + 13.397 * weight_kg + 4.799 * height_cm - 5.677 * age;
  }
  return 447.593 + 9.247 * weight_kg + 3.098 * height_cm - 4.33 * age;
}

function katchBMR(params: BMRParams): number {
  if (params.lean_body_mass_kg === undefined) {
    throw new Error('Katch-McArdle formula requires lean_body_mass_kg');
  }
  return 370 + 21.6 * params.lean_body_mass_kg;
}

export function calculateBMR(params: BMRParams, formula: TDEEFormula): number {
  switch (formula) {
    case 'mifflin':
      return mifflinBMR(params);
    case 'harris':
      return harrisBMR(params);
    case 'katch':
      return katchBMR(params);
  }
}

export function calculateTDEE(
  params: BMRParams,
  formula: TDEEFormula,
  activityLevel: ActivityLevel
): TDEEResult {
  const bmr = calculateBMR(params, formula);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const tdee = bmr * activityMultiplier;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    formula,
    activityLevel,
    activityMultiplier,
  };
}
