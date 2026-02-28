export function isValidHeightCm(cm: number): boolean {
  return cm >= 100 && cm <= 250;
}

export function isValidAge(birthDate: string): boolean {
  const [year, month, day] = birthDate.split('-').map(Number);
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 13 && age <= 120;
}

export function isValidWeightKg(kg: number): boolean {
  return kg >= 30 && kg <= 300;
}

export function isValidGoalRate(rateKgPerWeek: number): boolean {
  return rateKgPerWeek >= 0.25 && rateKgPerWeek <= 1.0;
}

export function isValidCalorieTarget(calories: number): boolean {
  return calories >= 500 && calories <= 10000;
}

export function isValidServings(servings: number): boolean {
  return servings > 0 && servings <= 100;
}
