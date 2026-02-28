import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { calculateTDEE } from '../../services/calculations/tdee';
import { calculateCalorieTarget } from '../../services/calculations/calories';
import { isValidCalorieTarget, isValidWeightKg } from '../../utils/validation';
import { lbsToKg, kgToLbs } from '../../utils/units';
import { GOAL_RATE_OPTIONS } from '../../constants/config';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'GoalConfig'>;

function getAge(birthDate: string): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function GoalConfigScreen() {
  const navigation = useNavigation<Nav>();
  const { data, update } = useOnboardingStore();

  const isImperial = data.unit_system === 'imperial';
  const goalType = data.goal_type ?? 'maintenance';

  // Goal weight state
  const [goalWeightRaw, setGoalWeightRaw] = useState(() => {
    if (!data.goal_weight_kg) return '';
    return isImperial
      ? String(Math.round(kgToLbs(data.goal_weight_kg)))
      : String(Math.round(data.goal_weight_kg));
  });

  // Rate state (loss/gain)
  const [rate, setRate] = useState<number>(data.goal_rate_kg_per_week ?? 0.5);

  // Custom calorie target
  const [customCalories, setCustomCalories] = useState(
    data.custom_calorie_target ? String(data.custom_calorie_target) : ''
  );

  // Compute TDEE
  const tdeeResult = useMemo(() => {
    if (
      !data.weight_kg ||
      !data.height_cm ||
      !data.birth_date ||
      !data.sex ||
      !data.activity_level
    ) {
      return null;
    }

    const age = getAge(data.birth_date);
    // For Katch formula without known BF%, estimate LBM as 85% of weight
    const leanBodyMassKg =
      data.tdee_formula === 'katch' ? data.weight_kg * 0.85 : undefined;

    return calculateTDEE(
      {
        weight_kg: data.weight_kg,
        height_cm: data.height_cm,
        age,
        sex: data.sex,
        lean_body_mass_kg: leanBodyMassKg,
      },
      data.tdee_formula,
      data.activity_level
    );
  }, [data]);

  const calorieResult = useMemo(() => {
    if (!tdeeResult || !data.sex) return null;
    return calculateCalorieTarget(
      tdeeResult.tdee,
      goalType,
      data.sex,
      rate,
      goalType === 'custom' ? parseFloat(customCalories) || undefined : undefined
    );
  }, [tdeeResult, goalType, rate, customCalories, data.sex]);

  // Goal weight in kg
  function getGoalWeightKg(): number | null {
    const v = parseFloat(goalWeightRaw);
    if (isNaN(v)) return null;
    return isImperial ? lbsToKg(v) : v;
  }

  const goalWeightKg = getGoalWeightKg();
  const showGoalWeight = goalType === 'loss' || goalType === 'gain';
  const showRateSelector = goalType === 'loss' || goalType === 'gain';
  const showCustomInput = goalType === 'custom';

  // Estimate weeks to goal
  const weeksToGoal = useMemo(() => {
    if (!showGoalWeight || !data.weight_kg || !goalWeightKg || !rate) return null;
    const diff = Math.abs(goalWeightKg - data.weight_kg);
    return Math.round(diff / rate);
  }, [showGoalWeight, data.weight_kg, goalWeightKg, rate]);

  function isValid(): boolean {
    if (!tdeeResult) return false;
    if (showGoalWeight) {
      if (!goalWeightKg || !isValidWeightKg(goalWeightKg)) return false;
    }
    if (showCustomInput) {
      const v = parseFloat(customCalories);
      if (isNaN(v) || !isValidCalorieTarget(v)) return false;
    }
    return true;
  }

  function handleNext() {
    if (!isValid()) return;
    const updates: Parameters<typeof update>[0] = {
      goal_rate_kg_per_week: rate,
    };
    if (showGoalWeight && goalWeightKg !== null) {
      updates.goal_weight_kg = goalWeightKg;
    }
    if (showCustomInput) {
      const v = parseFloat(customCalories);
      if (!isNaN(v)) updates.custom_calorie_target = v;
    }
    update(updates);
    navigation.navigate('PreferencesReview');
  }

  return (
    <OnboardingLayout
      title="Configure your goal"
      subtitle="We'll calculate your daily calorie target."
      progress={9 / 11}
      onBack={() => navigation.goBack()}
    >
      {tdeeResult && (
        <View style={styles.tdeeCard}>
          <Text style={styles.tdeeLabel}>Your TDEE (maintenance calories)</Text>
          <Text style={styles.tdeeValue}>{tdeeResult.tdee.toLocaleString()} kcal/day</Text>
        </View>
      )}

      {showGoalWeight && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {goalType === 'loss' ? 'Goal weight' : 'Target weight'}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={goalWeightRaw}
              onChangeText={setGoalWeightRaw}
              keyboardType="decimal-pad"
              placeholder={isImperial ? '160' : '72'}
              placeholderTextColor={colors.gray400}
              maxLength={6}
            />
            <Text style={styles.unit}>{isImperial ? 'lbs' : 'kg'}</Text>
          </View>
          {goalWeightKg !== null && !isValidWeightKg(goalWeightKg) && (
            <Text style={styles.error}>Weight must be between 30–300 kg.</Text>
          )}
        </View>
      )}

      {showRateSelector && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Rate of {goalType === 'loss' ? 'loss' : 'gain'} per week
          </Text>
          <View style={styles.rateRow}>
            {GOAL_RATE_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.rateButton, rate === r && styles.rateButtonActive]}
                onPress={() => setRate(r)}
              >
                <Text style={[styles.rateText, rate === r && styles.rateTextActive]}>
                  {isImperial
                    ? `${(kgToLbs(r)).toFixed(2).replace(/\.?0+$/, '')} lbs`
                    : `${r} kg`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {weeksToGoal !== null && weeksToGoal > 0 && (
            <Text style={styles.timeline}>
              Estimated timeline: ~{weeksToGoal} weeks
            </Text>
          )}
        </View>
      )}

      {showCustomInput && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Daily calorie target</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={customCalories}
              onChangeText={setCustomCalories}
              keyboardType="number-pad"
              placeholder="2000"
              placeholderTextColor={colors.gray400}
              maxLength={5}
            />
            <Text style={styles.unit}>kcal</Text>
          </View>
          {customCalories.length > 0 && !isValidCalorieTarget(parseFloat(customCalories)) && (
            <Text style={styles.error}>Must be between 500–10,000 kcal.</Text>
          )}
        </View>
      )}

      {calorieResult && !showCustomInput && (
        <View style={styles.calorieCard}>
          <Text style={styles.calorieLabel}>Your daily calorie target</Text>
          <Text style={styles.calorieValue}>{calorieResult.target.toLocaleString()} kcal</Text>
          {calorieResult.deficit !== undefined && (
            <Text style={styles.calorieSub}>{calorieResult.deficit} kcal deficit/day</Text>
          )}
          {calorieResult.surplus !== undefined && (
            <Text style={styles.calorieSub}>+{calorieResult.surplus} kcal surplus/day</Text>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={!isValid()} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  tdeeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tdeeLabel: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tdeeValue: {
    fontSize: typography.fontSize2xl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize2xl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    textAlign: 'center',
    backgroundColor: colors.white,
  },
  unit: {
    fontSize: typography.fontSizeLg,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  error: {
    fontSize: typography.fontSizeSm,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  rateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rateButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  rateButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  rateText: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  rateTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeightBold,
  },
  timeline: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  calorieCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  calorieLabel: {
    fontSize: typography.fontSizeSm,
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeightMedium,
  },
  calorieValue: {
    fontSize: typography.fontSize2xl,
    fontWeight: typography.fontWeightBold,
    color: colors.primary,
  },
  calorieSub: {
    fontSize: typography.fontSizeSm,
    color: colors.primary,
    opacity: 0.75,
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
});
