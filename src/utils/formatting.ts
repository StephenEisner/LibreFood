export function formatCalories(calories: number): string {
  return Math.round(calories).toLocaleString();
}

export function formatMacroG(grams: number, decimalPlaces = 1): string {
  return `${grams.toFixed(decimalPlaces)}g`;
}

export function formatWeight(kg: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'metric') {
    return `${kg.toFixed(1)} kg`;
  }
  const lbs = kg * 2.20462;
  return `${lbs.toFixed(1)} lbs`;
}

export function formatHeight(cm: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'metric') {
    return `${cm} cm`;
  }
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatAge(birthDate: string): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}
