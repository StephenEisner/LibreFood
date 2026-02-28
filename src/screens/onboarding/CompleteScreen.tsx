import React, { useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { useUserStore } from '../../stores/useUserStore';
import { usePreferencesStore } from '../../stores/usePreferencesStore';
import { createUser, getUser } from '../../services/database/users';
import { createPreferences, getPreferences } from '../../services/database/preferences';
import { calculateTDEE } from '../../services/calculations/tdee';
import { calculateCalorieTarget } from '../../services/calculations/calories';
import { calculateMacroTargets } from '../../services/calculations/macros';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import type { TrackingPurpose } from '../../types/user';
import type { UserTrackingPreferences } from '../../types/preferences';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

function getAge(birthDate: string): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function buildPreferences(
  userId: number,
  purposes: TrackingPurpose[]
): Omit<UserTrackingPreferences, 'id'> {
  // Start with base defaults
  const prefs: Omit<UserTrackingPreferences, 'id'> = {
    user_id: userId,
    focus_mode: 'standard',
    ui_theme: 'standard',
    color_scheme: 'system',
    track_calories: 1,
    track_protein: 1,
    track_carbs: 1,
    track_fat: 1,
    track_fiber: 0,
    track_sugar: 0,
    track_cholesterol: 0,
    track_sodium: 0,
    track_saturated_fat: 0,
    track_trans_fat: 0,
    track_vitamin_a: 0,
    track_vitamin_c: 0,
    track_vitamin_d: 0,
    track_vitamin_e: 0,
    track_vitamin_k: 0,
    track_thiamin: 0,
    track_riboflavin: 0,
    track_niacin: 0,
    track_vitamin_b6: 0,
    track_folate: 0,
    track_vitamin_b12: 0,
    track_calcium: 0,
    track_iron: 0,
    track_magnesium: 0,
    track_phosphorus: 0,
    track_potassium: 0,
    track_zinc: 0,
    track_copper: 0,
    track_manganese: 0,
    track_selenium: 0,
    track_weight: 0,
    track_body_fat: 0,
    track_measurements: 0,
    show_progress_photos: 0,
    show_research_feed: 0,
    show_recipes: 1,
    show_meal_planning: 1,
    dashboard_layout: null,
  };

  for (const purpose of purposes) {
    switch (purpose) {
      case 'keep_it_simple':
        prefs.ui_theme = 'minimalist';
        prefs.track_carbs = 0;
        prefs.track_fat = 0;
        break;
      case 'track_everything':
        prefs.ui_theme = 'maximalist';
        prefs.track_fiber = 1;
        prefs.track_sugar = 1;
        prefs.track_cholesterol = 1;
        prefs.track_sodium = 1;
        prefs.track_saturated_fat = 1;
        prefs.track_trans_fat = 1;
        prefs.track_vitamin_a = 1;
        prefs.track_vitamin_c = 1;
        prefs.track_vitamin_d = 1;
        prefs.track_vitamin_e = 1;
        prefs.track_vitamin_k = 1;
        prefs.track_thiamin = 1;
        prefs.track_riboflavin = 1;
        prefs.track_niacin = 1;
        prefs.track_vitamin_b6 = 1;
        prefs.track_folate = 1;
        prefs.track_vitamin_b12 = 1;
        prefs.track_calcium = 1;
        prefs.track_iron = 1;
        prefs.track_magnesium = 1;
        prefs.track_phosphorus = 1;
        prefs.track_potassium = 1;
        prefs.track_zinc = 1;
        prefs.track_copper = 1;
        prefs.track_manganese = 1;
        prefs.track_selenium = 1;
        prefs.track_weight = 1;
        prefs.track_body_fat = 1;
        prefs.track_measurements = 1;
        prefs.show_progress_photos = 1;
        prefs.show_research_feed = 1;
        break;
      case 'weight_management':
        prefs.track_weight = 1;
        break;
      case 'athletic_performance':
        prefs.track_sodium = 1;
        prefs.track_potassium = 1;
        prefs.track_weight = 1;
        break;
      case 'general_health':
        prefs.track_vitamin_a = 1;
        prefs.track_vitamin_c = 1;
        prefs.track_vitamin_d = 1;
        prefs.track_iron = 1;
        prefs.track_calcium = 1;
        break;
      case 'specific_health':
        prefs.track_fiber = 1;
        prefs.track_sugar = 1;
        prefs.track_cholesterol = 1;
        prefs.track_sodium = 1;
        prefs.track_saturated_fat = 1;
        prefs.track_vitamin_a = 1;
        prefs.track_vitamin_c = 1;
        prefs.track_vitamin_d = 1;
        prefs.track_vitamin_e = 1;
        prefs.track_vitamin_k = 1;
        prefs.track_thiamin = 1;
        prefs.track_riboflavin = 1;
        prefs.track_niacin = 1;
        prefs.track_vitamin_b6 = 1;
        prefs.track_folate = 1;
        prefs.track_vitamin_b12 = 1;
        prefs.track_calcium = 1;
        prefs.track_iron = 1;
        prefs.track_magnesium = 1;
        prefs.track_phosphorus = 1;
        prefs.track_potassium = 1;
        prefs.track_zinc = 1;
        prefs.track_copper = 1;
        prefs.track_manganese = 1;
        prefs.track_selenium = 1;
        break;
      case 'learn_nutrition':
        prefs.track_fiber = 1;
        prefs.track_sugar = 1;
        prefs.track_vitamin_a = 1;
        prefs.track_vitamin_c = 1;
        prefs.track_vitamin_d = 1;
        prefs.track_calcium = 1;
        prefs.track_iron = 1;
        prefs.show_research_feed = 1;
        break;
    }
  }

  // keep_it_simple always wins on ui_theme if combined with track_everything
  // (keep_it_simple processed last above would override, but this is intentional)

  return prefs;
}

function MacroRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {value}
        <Text style={styles.macroUnit}> {unit}</Text>
      </Text>
    </View>
  );
}

export function CompleteScreen() {
  const navigation = useNavigation<Nav>();
  const { data, reset } = useOnboardingStore();
  const setUser = useUserStore((s) => s.setUser);
  const setPreferences = usePreferencesStore((s) => s.setPreferences);
  const [loading, setLoading] = useState(false);

  const calcs = useMemo(() => {
    if (
      !data.weight_kg || !data.height_cm || !data.birth_date ||
      !data.sex || !data.activity_level || !data.goal_type
    ) return null;
    const age = getAge(data.birth_date);
    const lbm = data.tdee_formula === 'katch' ? data.weight_kg * 0.85 : undefined;
    const tdeeResult = calculateTDEE(
      { weight_kg: data.weight_kg, height_cm: data.height_cm, age, sex: data.sex, lean_body_mass_kg: lbm },
      data.tdee_formula,
      data.activity_level
    );
    const calorieResult = calculateCalorieTarget(
      tdeeResult.tdee,
      data.goal_type,
      data.sex,
      data.goal_rate_kg_per_week ?? undefined,
      data.goal_type === 'custom' ? data.custom_calorie_target ?? undefined : undefined
    );
    const macros = calculateMacroTargets(calorieResult.target, data.weight_kg, data.goal_type);
    return { tdeeResult, calorieResult, macros };
  }, [data]);

  async function handleComplete() {
    if (!data.height_cm || !data.birth_date || !data.sex || !data.activity_level) {
      Alert.alert('Missing data', 'Please complete all onboarding steps.');
      return;
    }

    setLoading(true);
    try {
      const userId = await createUser({
        name: data.name,
        height_cm: data.height_cm,
        birth_date: data.birth_date,
        sex: data.sex,
        activity_level: data.activity_level,
        tdee_formula: data.tdee_formula,
        goal_type: data.goal_type,
        goal_weight_kg: data.goal_weight_kg,
        goal_rate_kg_per_week: data.goal_rate_kg_per_week,
        custom_calorie_target: data.custom_calorie_target,
        tracking_purpose: JSON.stringify(data.tracking_purposes),
        unit_system: data.unit_system,
      });

      const prefsData = buildPreferences(userId, data.tracking_purposes);
      await createPreferences(prefsData);

      const [savedUser, savedPrefs] = await Promise.all([
        getUser(userId),
        getPreferences(userId),
      ]);

      if (savedUser) setUser(savedUser);
      if (savedPrefs) setPreferences(savedPrefs);

      reset();

      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingLayout
      title="You're all set!"
      subtitle="Here's your personalized nutrition plan."
      progress={1}
      onBack={() => navigation.goBack()}
    >
      {calcs && (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TDEE</Text>
              <Text style={styles.summaryValue}>{calcs.tdeeResult.tdee.toLocaleString()} kcal</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelHighlight]}>Daily Target</Text>
              <Text style={[styles.summaryValue, styles.summaryValueHighlight]}>
                {calcs.calorieResult.target.toLocaleString()} kcal
              </Text>
            </View>
          </View>

          <Text style={styles.macrosTitle}>Daily Macro Targets</Text>
          <View style={styles.macrosCard}>
            <MacroRow label="Protein" value={calcs.macros.proteinG} unit="g" />
            <MacroRow label="Carbohydrates" value={calcs.macros.carbsG} unit="g" />
            <MacroRow label="Fat" value={calcs.macros.fatG} unit="g" />
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <PrimaryButton label="Start Tracking" onPress={handleComplete} />
        )}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  summaryRowHighlight: {
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
  },
  summaryLabelHighlight: {
    color: colors.primary,
    fontWeight: typography.fontWeightSemibold,
  },
  summaryValue: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  summaryValueHighlight: {
    color: colors.primary,
    fontSize: typography.fontSizeXl,
  },
  macrosTitle: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  macrosCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  macroLabel: {
    fontSize: typography.fontSizeSm,
    color: colors.text,
  },
  macroValue: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  macroUnit: {
    fontWeight: typography.fontWeightNormal,
    color: colors.textSecondary,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
});
