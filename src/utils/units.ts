export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function ftInToCm(feet: number, inches: number): number {
  return feet * 30.48 + inches * 2.54;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function ozToG(oz: number): number {
  return oz * 28.3495;
}

export function gToOz(g: number): number {
  return g / 28.3495;
}

export function cupsToMl(cups: number): number {
  return cups * 236.588;
}

export function tbspToMl(tbsp: number): number {
  return tbsp * 14.7868;
}

export function tspToMl(tsp: number): number {
  return tsp * 4.92892;
}
