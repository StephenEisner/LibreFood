import { calculateBMR, calculateTDEE } from '../../src/services/calculations/tdee';

describe('calculateBMR', () => {
  it('Mifflin male: 30yo, 80kg, 180cm → 1780', () => {
    // (10×80)+(6.25×180)−(5×30)+5 = 800+1125−150+5 = 1780
    const bmr = calculateBMR({ weight_kg: 80, height_cm: 180, age: 30, sex: 'male' }, 'mifflin');
    expect(bmr).toBeCloseTo(1780, 0);
  });

  it('Mifflin female: 25yo, 60kg, 165cm', () => {
    const bmr = calculateBMR({ weight_kg: 60, height_cm: 165, age: 25, sex: 'female' }, 'mifflin');
    // (10*60)+(6.25*165)-(5*25)-161 = 600+1031.25-125-161 = 1345.25
    expect(bmr).toBeCloseTo(1345.25, 0);
  });

  it('Harris male: 30yo, 80kg, 180cm', () => {
    const bmr = calculateBMR({ weight_kg: 80, height_cm: 180, age: 30, sex: 'male' }, 'harris');
    // 88.362+(13.397*80)+(4.799*180)-(5.677*30) = 88.362+1071.76+863.82-170.31 = 1853.632
    expect(bmr).toBeCloseTo(1853.63, 0);
  });

  it('Harris female: 25yo, 60kg, 165cm → ~1393', () => {
    const bmr = calculateBMR({ weight_kg: 60, height_cm: 165, age: 25, sex: 'female' }, 'harris');
    // 447.593+(9.247*60)+(3.098*165)-(4.330*25) = 447.593+554.82+511.17-108.25 = 1405.333
    expect(bmr).toBeCloseTo(1405.33, 0);
  });

  it('Katch-McArdle: 70kg lean mass → 370+21.6*70 = 1882', () => {
    const bmr = calculateBMR(
      { weight_kg: 90, height_cm: 180, age: 30, sex: 'male', lean_body_mass_kg: 70 },
      'katch'
    );
    expect(bmr).toBeCloseTo(1882, 0);
  });

  it('Katch throws without lean mass', () => {
    expect(() =>
      calculateBMR({ weight_kg: 80, height_cm: 180, age: 30, sex: 'male' }, 'katch')
    ).toThrow();
  });
});

describe('calculateTDEE', () => {
  it('30yo male, 80kg, 180cm, sedentary → BMR=1780, TDEE=2136', () => {
    // BMR = 800+1125-150+5 = 1780; TDEE = 1780×1.2 = 2136
    const result = calculateTDEE(
      { weight_kg: 80, height_cm: 180, age: 30, sex: 'male' },
      'mifflin',
      'sedentary'
    );
    expect(result.bmr).toBeCloseTo(1780, 0);
    expect(result.tdee).toBeCloseTo(2136, 0);
    expect(result.activityMultiplier).toBe(1.2);
  });

  it('25yo female, 60kg, 165cm, moderate → TDEE≈2160 (Harris)', () => {
    const result = calculateTDEE(
      { weight_kg: 60, height_cm: 165, age: 25, sex: 'female' },
      'harris',
      'moderate'
    );
    // BMR≈1405, TDEE = 1405*1.55 ≈ 2177
    expect(result.tdee).toBeCloseTo(result.bmr * 1.55, 0);
    expect(result.activityMultiplier).toBe(1.55);
  });
});
