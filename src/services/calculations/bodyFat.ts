import type { Sex } from '../../types/user';

export function navyBodyFatPercentage(
  sex: Sex,
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipsCm?: number
): number {
  if (sex === 'male') {
    return (
      495 /
        (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) -
      450
    );
  }
  // Female requires hips measurement
  if (hipsCm === undefined) {
    throw new Error('Female Navy body fat calculation requires hips measurement');
  }
  return (
    495 /
      (1.29579 -
        0.35004 * Math.log10(waistCm + hipsCm - neckCm) +
        0.221 * Math.log10(heightCm)) -
    450
  );
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function calculateLeanMass(weightKg: number, bodyFatPct: number): number {
  return weightKg * (1 - bodyFatPct / 100);
}
