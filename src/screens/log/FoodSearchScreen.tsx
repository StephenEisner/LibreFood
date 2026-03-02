import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { LogStackParamList } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useUserStore } from '../../stores/useUserStore';
import { getFirstUser } from '../../services/database/users';
import { searchFoodsLocal, getCustomFoodsByUser, cacheFood } from '../../services/database/foods';
import { searchUSDA, usdaResultToFood } from '../../services/api/usda';
import { searchOFF, offProductToFood } from '../../services/api/openFoodFacts';
import type { Food, CustomFood } from '../../types/foods';
import { formatCalories, formatMacroG } from '../../utils/formatting';

type Nav = NativeStackNavigationProp<LogStackParamList, 'FoodSearch'>;
type RouteT = RouteProp<LogStackParamList, 'FoodSearch'>;

type SearchResult =
  | { kind: 'usda'; food: Food }    // in local cache
  | { kind: 'usda_api'; food: Food } // from USDA API, not yet cached
  | { kind: 'off'; food: Food }     // from Open Food Facts, not yet cached
  | { kind: 'custom'; food: CustomFood };

export function FoodSearchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { date, mealType } = route.params;

  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Load user from DB if not in store (app restart)
  useEffect(() => {
    if (!user) {
      getFirstUser().then((u) => { if (u) setUser(u); });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Set header button for creating custom food
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('CustomFoodCreate')}>
          <Text style={styles.headerBtn}>Create</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => { runSearch(query); }, 300);
    return () => clearTimeout(timer);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const currentUser = useUserStore.getState().user;
      const userId = currentUser?.id;

      const [localFoods, allCustomFoods, usdaResults, offResults] = await Promise.all([
        searchFoodsLocal(q),
        userId ? getCustomFoodsByUser(userId) : Promise.resolve([] as CustomFood[]),
        searchUSDA(q).catch(() => [] as Awaited<ReturnType<typeof searchUSDA>>),
        searchOFF(q).catch(() => [] as Awaited<ReturnType<typeof searchOFF>>),
      ]);

      // Filter custom foods by name
      const lowerQ = q.toLowerCase();
      const matchedCustom = allCustomFoods.filter((f) =>
        f.name.toLowerCase().includes(lowerQ)
      );

      // Collect cached fdc_ids and gtin_upcs for deduplication
      const cachedFdcIds = new Set(localFoods.map((f) => f.fdc_id));
      const allUsdaGtins = new Set<string>(
        localFoods.map((f) => f.gtin_upc).filter((g): g is string => g !== null)
      );

      // USDA API results not already in local cache
      const usdaOnly = usdaResults
        .filter((r) => !cachedFdcIds.has(r.fdcId))
        .map(usdaResultToFood);

      // Add USDA API gtins to the dedup set so OFF doesn't repeat them
      usdaOnly.forEach((f) => { if (f.gtin_upc) allUsdaGtins.add(f.gtin_upc); });

      // OFF results: deduplicate against USDA by synthetic fdc_id and gtin_upc
      const offFoods = offResults
        .map(offProductToFood)
        .filter(
          (f) =>
            !cachedFdcIds.has(f.fdc_id) &&
            !allUsdaGtins.has(f.gtin_upc ?? '')
        );

      // Merge order: custom → local cache → USDA API → OFF
      const merged: SearchResult[] = [
        ...matchedCustom.map((food): SearchResult => ({ kind: 'custom', food })),
        ...localFoods.map((food): SearchResult => ({ kind: 'usda', food })),
        ...usdaOnly.map((food): SearchResult => ({ kind: 'usda_api', food })),
        ...offFoods.map((food): SearchResult => ({ kind: 'off', food })),
      ];

      setResults(merged);
    } finally {
      setSearching(false);
    }
  }, []);

  async function handleSelect(item: SearchResult) {
    if (item.kind === 'off') {
      // Cache immediately so FoodDetailScreen can load it from local DB
      await cacheFood(item.food);
      navigation.navigate('FoodDetail', { fdcId: item.food.fdc_id, date, mealType });
    } else if (item.kind === 'usda' || item.kind === 'usda_api') {
      navigation.navigate('FoodDetail', { fdcId: item.food.fdc_id, date, mealType });
    } else {
      navigation.navigate('FoodDetail', { customFoodId: item.food.id, date, mealType });
    }
  }

  function getFoodName(item: SearchResult): string {
    return item.kind === 'custom' ? item.food.name : item.food.description;
  }

  function getFoodBrand(item: SearchResult): string | null {
    if (item.kind === 'custom') return item.food.brand;
    return item.food.brand_name;
  }

  function getNutritionSnippet(item: SearchResult): string {
    let cal: number | null;
    let protein: number | null;
    let carbs: number | null;
    let fat: number | null;

    if (item.kind === 'custom') {
      cal = item.food.calories;
      protein = item.food.protein_g;
      carbs = item.food.carbs_g;
      fat = item.food.fat_g;
    } else {
      // 'usda', 'usda_api', 'off' all use Food type
      cal = item.food.calories;
      protein = item.food.protein_g;
      carbs = item.food.carbs_g;
      fat = item.food.fat_g;
    }

    const parts: string[] = [];
    if (cal != null) parts.push(`Cal: ${formatCalories(cal)}`);
    if (protein != null) parts.push(`P: ${formatMacroG(protein)}`);
    if (carbs != null) parts.push(`C: ${formatMacroG(carbs)}`);
    if (fat != null) parts.push(`F: ${formatMacroG(fat)}`);
    return parts.length > 0 ? parts.join(' | ') + ' per 100g' : '';
  }

  function getBadge(item: SearchResult): { label: string; style: 'custom' | 'off' } | null {
    if (item.kind === 'custom') return { label: 'Custom', style: 'custom' };
    if (item.kind === 'off') return { label: 'OFF', style: 'off' };
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search foods..."
          placeholderTextColor={colors.gray400}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {searching && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {!searching && query.length < 2 && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Type at least 2 characters to search</Text>
        </View>
      )}

      {!searching && query.length >= 2 && results.length === 0 && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No results found</Text>
          <Pressable onPress={() => navigation.navigate('CustomFoodCreate')} style={styles.createBtn}>
            <Text style={styles.createBtnText}>Create Custom Food</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item, index) => {
          if (item.kind === 'custom') return `custom-${item.food.id}-${index}`;
          if (item.kind === 'off') return `off-${item.food.fdc_id}`;
          return `usda-${item.food.fdc_id}`;
        }}
        renderItem={({ item }) => {
          const brand = getFoodBrand(item);
          const snippet = getNutritionSnippet(item);
          const badge = getBadge(item);
          return (
            <Pressable style={styles.resultRow} onPress={() => handleSelect(item)}>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={1}>{getFoodName(item)}</Text>
                {brand && <Text style={styles.resultBrand} numberOfLines={1}>{brand}</Text>}
                {snippet.length > 0 && (
                  <Text style={styles.resultSnippet} numberOfLines={1}>{snippet}</Text>
                )}
              </View>
              {badge && (
                <View style={badge.style === 'off' ? styles.offBadge : styles.customBadge}>
                  <Text style={badge.style === 'off' ? styles.offBadgeText : styles.customBadgeText}>
                    {badge.label}
                  </Text>
                </View>
              )}
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizeMd,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  placeholderText: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  createBtnText: {
    color: colors.white,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
  },
  headerBtn: {
    color: colors.primary,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    paddingHorizontal: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.white,
  },
  resultInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  resultName: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.text,
  },
  resultBrand: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  resultSnippet: {
    fontSize: typography.fontSizeXs,
    color: colors.gray400,
    marginTop: 2,
  },
  customBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  customBadgeText: {
    fontSize: typography.fontSizeXs,
    color: colors.primary,
    fontWeight: typography.fontWeightSemibold,
  },
  offBadge: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  offBadgeText: {
    fontSize: typography.fontSizeXs,
    color: colors.secondary,
    fontWeight: typography.fontWeightSemibold,
  },
  chevron: {
    fontSize: 20,
    color: colors.gray400,
    lineHeight: 24,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray100,
    marginLeft: spacing.md,
  },
});
