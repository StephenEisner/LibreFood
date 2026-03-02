import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, StackActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { LogStackParamList } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { NUTRIENTS } from '../../constants/nutrients';
import { useUserStore } from '../../stores/useUserStore';
import { getFirstUser } from '../../services/database/users';
import { getFoodByFdcId, getCustomFoodById, cacheFood } from '../../services/database/foods';
import { logFood } from '../../services/database/foodLog';
import type { MealType } from '../../services/database/foodLog';
import { fetchUSDAFood, usdaDetailToFood } from '../../services/api/usda';
import type { USDAFoodMeasure } from '../../types/api';
import type { NutritionData } from '../../types/foods';
import { scaleNutrition } from '../../services/calculations/nutrition';
import { formatCalories, formatMacroG } from '../../utils/formatting';

type Nav = NativeStackNavigationProp<LogStackParamList, 'FoodDetail'>;
type RouteT = RouteProp<LogStackParamList, 'FoodDetail'>;

interface ServingOption {
  label: string;
  gramWeight: number;
}

const DEFAULT_100G: ServingOption = { label: '100 g', gramWeight: 100 };

function buildServingOptions(
  measures: USDAFoodMeasure[] | null,
  servingSize: number | null | undefined,
  servingSizeUnit: string | null | undefined,
  householdText: string | null | undefined
): ServingOption[] {
  const options: ServingOption[] = [DEFAULT_100G];

  if (servingSize && servingSize > 0 && servingSizeUnit) {
    const label = householdText ?? `${servingSize} ${servingSizeUnit}`;
    options.push({ label, gramWeight: servingSize });
  }

  if (measures) {
    const sorted = [...measures].sort((a, b) => a.rank - b.rank);
    for (const m of sorted) {
      if (m.gramWeight > 0) {
        options.push({ label: m.disseminationText, gramWeight: m.gramWeight });
      }
    }
  }

  // Deduplicate by gramWeight (±1g)
  const seen: number[] = [];
  return options.filter((opt) => {
    const isDup = seen.some((g) => Math.abs(g - opt.gramWeight) <= 1);
    if (!isDup) seen.push(opt.gramWeight);
    return !isDup;
  });
}

const MACRO_KEYS: (keyof NutritionData)[] = ['calories', 'protein_g', 'carbs_g', 'fat_g'];

export function FoodDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { fdcId, customFoodId, date, mealType } = route.params;

  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [baseNutrition, setBaseNutrition] = useState<NutritionData>({ calories: 0 });
  const [servingOptions, setServingOptions] = useState<ServingOption[]>([DEFAULT_100G]);
  const [selectedOption, setSelectedOption] = useState<ServingOption>(DEFAULT_100G);
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user from DB if not in store
  useEffect(() => {
    if (!user) {
      getFirstUser().then((u) => { if (u) setUser(u); });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load food
  useEffect(() => {
    let mounted = true;

    async function load() {
      if (fdcId !== undefined) {
        // Try local cache first for immediate display
        const cached = await getFoodByFdcId(fdcId);
        if (!mounted) return;

        if (cached) {
          const nutrition = JSON.parse(cached.nutrition_json) as NutritionData;
          setBaseNutrition(nutrition);
          navigation.setOptions({ title: cached.description });
          const opts = buildServingOptions(
            null,
            cached.serving_size,
            cached.serving_size_unit,
            cached.household_serving_text
          );
          setServingOptions(opts);
          setSelectedOption(opts[0]);
          setLoading(false);

          // OpenFoodFacts foods: skip USDA fetch (different data source, no food measures)
          if (cached.data_type === 'OpenFoodFacts') return;
        }

        // Fetch full detail from USDA for food measures (USDA foods only)
        try {
          const usdaFood = await fetchUSDAFood(fdcId);
          if (!mounted) return;
          const food = usdaDetailToFood(usdaFood);
          await cacheFood(food);
          if (!mounted) return;

          const nutrition = JSON.parse(food.nutrition_json) as NutritionData;
          setBaseNutrition(nutrition);
          navigation.setOptions({ title: food.description });

          const opts = buildServingOptions(
            usdaFood.foodMeasures,
            food.serving_size,
            food.serving_size_unit,
            food.household_serving_text
          );
          setServingOptions(opts);
          setSelectedOption(opts[0]);
        } catch (err) {
          console.warn('Failed to fetch USDA detail:', err);
          // Keep cached data; 100g fallback already set
        }

        if (mounted) setLoading(false);
      } else if (customFoodId !== undefined) {
        const customFood = await getCustomFoodById(customFoodId);
        if (!mounted) return;

        if (customFood) {
          const nutrition = JSON.parse(customFood.nutrition_json) as NutritionData;
          setBaseNutrition(nutrition);
          navigation.setOptions({ title: customFood.name });

          const rawOpts: ServingOption[] = [
            DEFAULT_100G,
            {
              label: `${customFood.serving_size} ${customFood.serving_size_unit}`,
              gramWeight: customFood.serving_size,
            },
          ];
          const unique = rawOpts.filter((opt, i, arr) =>
            arr.findIndex((o) => Math.abs(o.gramWeight - opt.gramWeight) <= 1) === i
          );
          setServingOptions(unique);
          setSelectedOption(unique[0]);
        }
        setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [fdcId, customFoodId]); // eslint-disable-line react-hooks/exhaustive-deps

  const multiplier = useCallback(() => {
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) return 0;
    return (selectedOption.gramWeight * amtNum) / 100;
  }, [selectedOption, amount]);

  const displayedNutrition = scaleNutrition(baseNutrition, multiplier());

  async function handleAddToLog() {
    const currentUser = useUserStore.getState().user;
    if (!currentUser) {
      Alert.alert('Error', 'User not found. Please restart the app.');
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid serving amount.');
      return;
    }

    setSaving(true);
    try {
      await logFood({
        user_id: currentUser.id,
        date,
        meal_type: mealType as MealType,
        food_id: fdcId ?? null,
        custom_food_id: customFoodId ?? null,
        custom_meal_id: null,
        custom_recipe_id: null,
        servings: amtNum,
        logged_nutrition_json: JSON.stringify(displayedNutrition),
        logged_calories: displayedNutrition.calories ?? null,
        logged_protein_g: displayedNutrition.protein_g ?? null,
        logged_carbs_g: displayedNutrition.carbs_g ?? null,
        logged_fat_g: displayedNutrition.fat_g ?? null,
        notes: null,
        time: null,
        sort_order: 0,
      });
      navigation.dispatch(StackActions.popToTop());
    } catch (err) {
      console.error('Failed to log food:', err);
      Alert.alert('Error', 'Failed to log food. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const macros = [
    { key: 'calories', label: 'Calories', value: displayedNutrition.calories, unit: 'kcal', big: true },
    { key: 'protein_g', label: 'Protein', value: displayedNutrition.protein_g, unit: 'g', big: false },
    { key: 'carbs_g', label: 'Carbs', value: displayedNutrition.carbs_g, unit: 'g', big: false },
    { key: 'fat_g', label: 'Fat', value: displayedNutrition.fat_g, unit: 'g', big: false },
  ] as const;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Serving size chips */}
        <Text style={styles.sectionLabel}>Serving Size</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
          keyboardShouldPersistTaps="handled"
        >
          {servingOptions.map((opt, i) => (
            <Pressable
              key={i}
              onPress={() => setSelectedOption(opt)}
              style={[styles.chip, selectedOption === opt && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selectedOption === opt && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Amount input */}
        <View style={styles.amountRow}>
          <Text style={styles.sectionLabel}>Amount</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            selectTextOnFocus
          />
        </View>

        {/* Macro summary */}
        <View style={styles.macroCard}>
          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabel}>Calories</Text>
            <Text style={styles.calorieValue}>
              {formatCalories(displayedNutrition.calories ?? 0)}
            </Text>
          </View>
          <View style={styles.macroPillRow}>
            {(['protein_g', 'carbs_g', 'fat_g'] as const).map((key) => {
              const val = displayedNutrition[key];
              const labels: Record<string, string> = { protein_g: 'Protein', carbs_g: 'Carbs', fat_g: 'Fat' };
              return (
                <View key={key} style={styles.macroPill}>
                  <Text style={styles.macroPillValue}>
                    {val != null ? formatMacroG(val) : '—'}
                  </Text>
                  <Text style={styles.macroPillLabel}>{labels[key]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Full nutrition list */}
        <Text style={styles.sectionLabel}>Nutrition Facts</Text>
        <View style={styles.nutritionCard}>
          {Object.entries(NUTRIENTS).map(([key, info]) => {
            if (MACRO_KEYS.includes(key as keyof NutritionData)) return null; // already shown above
            const value = displayedNutrition[key as keyof NutritionData];
            if (value === undefined || value === null) return null;
            return (
              <View key={key} style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>{info.label}</Text>
                <Text style={styles.nutrientValue}>
                  {value < 10 ? value.toFixed(2) : value.toFixed(1)} {info.unit}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add to Log button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.logBtn, saving && styles.logBtnDisabled]}
          onPress={handleAddToLog}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.logBtnText}>Add to Log</Text>
          )}
        </Pressable>
      </View>
    </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  chipsScroll: {
    marginBottom: spacing.xs,
  },
  chipsContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeightSemibold,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    width: 100,
    textAlign: 'center',
  },
  macroCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  calorieLabel: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    color: colors.text,
  },
  calorieValue: {
    fontSize: typography.fontSize2xl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  macroPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroPill: {
    alignItems: 'center',
    flex: 1,
  },
  macroPillValue: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
  },
  macroPillLabel: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  nutritionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  nutrientLabel: {
    fontSize: typography.fontSizeSm,
    color: colors.text,
  },
  nutrientValue: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  logBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logBtnDisabled: {
    opacity: 0.6,
  },
  logBtnText: {
    color: colors.white,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
  },
});
