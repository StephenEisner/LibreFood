import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import type { LogStackParamList } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { DEFAULT_MEAL_TYPES } from '../../constants/config';
import { useUserStore } from '../../stores/useUserStore';
import { useFoodLogStore } from '../../stores/useFoodLogStore';
import { getFirstUser } from '../../services/database/users';
import {
  getLogForDateWithNames,
  getDailyTotals,
  deleteLogEntry,
  type FoodLogDisplayEntry,
  type DailyTotals,
} from '../../services/database/foodLog';
import { getLatestMetric } from '../../services/database/metrics';
import { calculateTDEE } from '../../services/calculations/tdee';
import { calculateCalorieTarget } from '../../services/calculations/calories';
import { formatCalories, formatMacroG, formatDate, formatAge } from '../../utils/formatting';

type Nav = NativeStackNavigationProp<LogStackParamList, 'DailyLog'>;

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function barColor(consumed: number, target: number): string {
  const pct = target > 0 ? consumed / target : 0;
  if (pct >= 1) return colors.danger;
  if (pct >= 0.8) return colors.warning;
  return colors.secondary;
}

async function computeCalorieTarget(userId: number, user: NonNullable<ReturnType<typeof useUserStore.getState>['user']>): Promise<number> {
  try {
    const metric = await getLatestMetric(userId);
    const weight_kg = metric?.weight_kg;
    if (!weight_kg || !user.birth_date || !user.sex || !user.activity_level) return 2000;
    const age = formatAge(user.birth_date);
    const tdeeResult = calculateTDEE(
      {
        weight_kg,
        height_cm: user.height_cm,
        age,
        sex: user.sex,
        lean_body_mass_kg: user.tdee_formula === 'katch' ? weight_kg * 0.85 : undefined,
      },
      user.tdee_formula,
      user.activity_level
    );
    if (!user.goal_type) return tdeeResult.tdee;
    const calResult = calculateCalorieTarget(
      tdeeResult.tdee,
      user.goal_type,
      user.sex,
      user.goal_rate_kg_per_week ?? undefined,
      user.goal_type === 'custom' ? user.custom_calorie_target ?? undefined : undefined
    );
    return calResult.target;
  } catch {
    return 2000;
  }
}

export function DailyLogScreen() {
  const navigation = useNavigation<Nav>();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const { selectedDate, setSelectedDate } = useFoodLogStore();

  const [entries, setEntries] = useState<FoodLogDisplayEntry[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [loading, setLoading] = useState(true);

  async function loadData(uid: number, date: string) {
    const [logEntries, dailyTotals] = await Promise.all([
      getLogForDateWithNames(uid, date),
      getDailyTotals(uid, date),
    ]);
    setEntries(logEntries);
    setTotals(dailyTotals);
  }

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function init() {
        let currentUser = useUserStore.getState().user;
        if (!currentUser) {
          const u = await getFirstUser();
          if (!mounted) return;
          if (u) {
            setUser(u);
            currentUser = u;
          }
        }
        if (!mounted || !currentUser) return;

        const [target] = await Promise.all([
          computeCalorieTarget(currentUser.id, currentUser),
          loadData(currentUser.id, selectedDate),
        ]);
        if (!mounted) return;
        setCalorieTarget(target);
        setLoading(false);
      }

      setLoading(true);
      init();
      return () => { mounted = false; };
    }, [selectedDate]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  async function handleDelete(entry: FoodLogDisplayEntry) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Entry',
      `Remove "${entry.food_name}" from your log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLogEntry(entry.id);
            const currentUser = useUserStore.getState().user;
            if (currentUser) {
              await loadData(currentUser.id, selectedDate);
            }
          },
        },
      ]
    );
  }

  const consumed = totals.calories;
  const barPct = calorieTarget > 0 ? Math.min(1, consumed / calorieTarget) * 100 : 0;
  const remaining = calorieTarget - consumed;

  if (loading && entries.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Date header */}
      <View style={styles.dateHeader}>
        <Pressable onPress={() => setSelectedDate(shiftDate(selectedDate, -1))} style={styles.arrowBtn}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <Pressable onPress={() => setSelectedDate(shiftDate(selectedDate, 1))} style={styles.arrowBtn}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Totals bar */}
        <View style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsConsumed}>
              {formatCalories(consumed)} / {formatCalories(calorieTarget)} kcal
            </Text>
            <Text style={styles.totalsRemaining}>
              {remaining >= 0 ? formatCalories(remaining) : `+${formatCalories(-remaining)}`} {remaining >= 0 ? 'remaining' : 'over'}
            </Text>
          </View>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${barPct}%` as `${number}%`,
                  backgroundColor: barColor(consumed, calorieTarget),
                },
              ]}
            />
          </View>
          <View style={styles.macroRow}>
            <Text style={styles.macroText}>P: {formatMacroG(totals.protein_g)}</Text>
            <Text style={styles.macroText}>C: {formatMacroG(totals.carbs_g)}</Text>
            <Text style={styles.macroText}>F: {formatMacroG(totals.fat_g)}</Text>
          </View>
        </View>

        {/* Meal sections */}
        {DEFAULT_MEAL_TYPES.map(({ key, label }) => {
          const mealEntries = entries.filter((e) => e.meal_type === key);
          const mealCalories = mealEntries.reduce((sum, e) => sum + (e.logged_calories ?? 0), 0);

          return (
            <View key={key} style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <View>
                  <Text style={styles.mealTitle}>{label}</Text>
                  {mealCalories > 0 && (
                    <Text style={styles.mealCalories}>{formatCalories(mealCalories)} kcal</Text>
                  )}
                </View>
                <Pressable
                  style={styles.addBtn}
                  onPress={() =>
                    navigation.navigate('FoodSearch', { date: selectedDate, mealType: key })
                  }
                >
                  <Text style={styles.addBtnText}>+</Text>
                </Pressable>
              </View>

              {mealEntries.map((entry) => (
                <Pressable
                  key={entry.id}
                  style={styles.entryRow}
                  onLongPress={() => handleDelete(entry)}
                  delayLongPress={400}
                >
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName} numberOfLines={1}>{entry.food_name}</Text>
                    {entry.food_brand && (
                      <Text style={styles.entryBrand} numberOfLines={1}>{entry.food_brand}</Text>
                    )}
                  </View>
                  <Text style={styles.entryCalories}>
                    {entry.logged_calories != null ? formatCalories(entry.logged_calories) : '—'} kcal
                  </Text>
                </Pressable>
              ))}

              {mealEntries.length === 0 && (
                <Text style={styles.emptyMeal}>No foods logged</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  arrowBtn: {
    padding: spacing.sm,
  },
  arrow: {
    fontSize: 28,
    color: colors.primary,
    lineHeight: 32,
  },
  dateText: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  totalsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  totalsConsumed: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  totalsRemaining: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  barContainer: {
    height: 10,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    minWidth: 4,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroText: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  mealSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mealTitle: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    color: colors.text,
  },
  mealCalories: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: typography.fontWeightBold,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  entryInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  entryName: {
    fontSize: typography.fontSizeSm,
    color: colors.text,
    fontWeight: typography.fontWeightMedium,
  },
  entryBrand: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  entryCalories: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  emptyMeal: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizeSm,
    color: colors.gray400,
    fontStyle: 'italic',
  },
});
