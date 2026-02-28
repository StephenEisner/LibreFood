import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { calculateTDEE } from '../../services/calculations/tdee';
import { calculateCalorieTarget } from '../../services/calculations/calories';
import { kgToLbs, cmToFtIn } from '../../utils/units';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PreferencesReview'>;

function getAge(birthDate: string): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary',
  light: 'Lightly Active',
  moderate: 'Moderately Active',
  active: 'Active',
  very_active: 'Very Active',
};

const GOAL_LABELS: Record<string, string> = {
  loss: 'Lose Weight',
  gain: 'Gain Weight',
  maintenance: 'Maintain Weight',
  recomp: 'Body Recomposition',
  custom: 'Custom Target',
};

const PURPOSE_LABELS: Record<string, string> = {
  weight_management: 'Weight Management',
  athletic_performance: 'Athletic Performance',
  general_health: 'General Health',
  specific_health: 'Specific Health',
  learn_nutrition: 'Learn About Nutrition',
  track_everything: 'Track Everything',
  keep_it_simple: 'Keep It Simple',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function PreferencesReviewScreen() {
  const navigation = useNavigation<Nav>();
  const { data } = useOnboardingStore();

  const isImperial = data.unit_system === 'imperial';

  const heightDisplay = useMemo(() => {
    if (!data.height_cm) return '—';
    if (isImperial) {
      const { feet, inches } = cmToFtIn(data.height_cm);
      return `${feet}'${inches}"`;
    }
    return `${Math.round(data.height_cm)} cm`;
  }, [data.height_cm, isImperial]);

  const weightDisplay = useMemo(() => {
    if (!data.weight_kg) return '—';
    if (isImperial) return `${Math.round(kgToLbs(data.weight_kg))} lbs`;
    return `${Math.round(data.weight_kg)} kg`;
  }, [data.weight_kg, isImperial]);

  const age = data.birth_date ? getAge(data.birth_date) : null;

  const calorieTarget = useMemo(() => {
    if (
      !data.weight_kg || !data.height_cm || !data.birth_date ||
      !data.sex || !data.activity_level || !data.goal_type
    ) return null;
    const a = getAge(data.birth_date);
    const lbm = data.tdee_formula === 'katch' ? data.weight_kg * 0.85 : undefined;
    const tdee = calculateTDEE(
      { weight_kg: data.weight_kg, height_cm: data.height_cm, age: a, sex: data.sex, lean_body_mass_kg: lbm },
      data.tdee_formula,
      data.activity_level
    );
    return calculateCalorieTarget(
      tdee.tdee,
      data.goal_type,
      data.sex,
      data.goal_rate_kg_per_week ?? undefined,
      data.goal_type === 'custom' ? data.custom_calorie_target ?? undefined : undefined
    );
  }, [data]);

  const purposeList = data.tracking_purposes
    .map((p) => PURPOSE_LABELS[p] ?? p)
    .join(', ');

  return (
    <OnboardingLayout
      title="Your LibreFood setup"
      subtitle="Review your information before we create your profile."
      progress={10 / 11}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.card}>
        <Row label="Height" value={heightDisplay} />
        <Row label="Age" value={age !== null ? `${age} years` : '—'} />
        <Row label="Sex" value={data.sex ? data.sex.charAt(0).toUpperCase() + data.sex.slice(1) : '—'} />
        <Row label="Weight" value={weightDisplay} />
        <Row label="Activity Level" value={data.activity_level ? ACTIVITY_LABELS[data.activity_level] : '—'} />
        <Row label="Goal" value={data.goal_type ? GOAL_LABELS[data.goal_type] : '—'} />
        <Row
          label="Daily Calories"
          value={calorieTarget ? `${calorieTarget.target.toLocaleString()} kcal` : '—'}
        />
      </View>

      {purposeList.length > 0 && (
        <View style={styles.purposeCard}>
          <Text style={styles.purposeTitle}>You'll track:</Text>
          <Text style={styles.purposeList}>{purposeList}</Text>
        </View>
      )}

      <View style={styles.buttons}>
        <PrimaryButton
          label="Looks good!"
          onPress={() => navigation.navigate('Complete')}
        />
        <PrimaryButton
          label="Go Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  rowLabel: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    color: colors.text,
  },
  purposeCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  purposeTitle: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  purposeList: {
    fontSize: typography.fontSizeSm,
    color: colors.primary,
    lineHeight: typography.fontSizeSm * typography.lineHeightRelaxed,
  },
  buttons: {
    gap: spacing.sm,
  },
});
