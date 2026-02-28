# Phase 1 Foundation — Session Handoff

**Date:** 2026-02-27
**Session status:** COMPLETE ✅

---

## What Was Completed

### ✅ Task 1: Expo Project + Dependencies
(done in previous session — see git history)

### ✅ Task 2: Config + Linting
(done in previous session — see git history)

### ✅ Task 3: TypeScript Types — `src/types/`
All 9 files written:
- `user.ts` — ActivityLevel, GoalType, TDEEFormula, Sex, UnitSystem, TrackingPurpose, User
- `foods.ts` — FoodSource, NutritionData (all nutrients), Food, CustomFood
- `meals.ts` — CustomMeal, CustomMealItem
- `recipes.ts` — RecipeDifficulty, CustomRecipe, RecipeIngredient
- `metrics.ts` — PhotoType, BodyMetrics, ProgressPhoto
- `preferences.ts` — FocusMode, UITheme, ColorScheme, UserTrackingPreferences
- `calculations.ts` — BMRParams, TDEEResult, MacroTargets, CalorieTarget
- `navigation.ts` — All param lists (Root, Onboarding, MainTab, Log, Meals, Metrics, More)
- `api.ts` — USDA (FoodSearchResult, FoodSearchResponse, USDAFood, USDANutrient), OFFProduct/Response, PubMed

### ✅ Task 3b: Constants — `src/constants/`
- `nutrients.ts` — 34-entry NUTRIENTS Record (all macros, vitamins, minerals with label/unit/dailyValue)
- `theme.ts` — colors, spacing, typography, borderRadius design tokens
- `config.ts` — API_BASE_URLS, DB_NAME, CACHE_TTL_MS, GOAL_RATE_OPTIONS, SAFE_CALORIE_MINIMUMS

### ✅ Task 4: Database Layer — `src/services/database/`
- `init.ts` — singleton openDatabase(), WAL + FK pragmas, runMigrations(), initializeDatabase()
  - Migration 1: all 12 tables + all indexes
- `users.ts` — createUser, getUser, getFirstUser, updateUser
- `foods.ts` — cacheFood, getFoodByFdcId, searchFoodsLocal, getFoodsByIds, createCustomFood, getCustomFoodById, getCustomFoodsByUser, updateCustomFood, deleteCustomFood
- `meals.ts` — createMeal, getMeals, getMealById, updateMeal, deleteMeal, getMealItems, addMealItem, deleteMealItem
- `recipes.ts` — createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe, getIngredients, addIngredient, deleteIngredient
- `foodLog.ts` — logFood, getLogForDate, updateLogEntry, deleteLogEntry, getDailyTotals
- `metrics.ts` — addMetric, getMetrics, getLatestMetric, deleteMetric, addProgressPhoto, getProgressPhotos, deleteProgressPhoto
- `preferences.ts` — createPreferences, getPreferences, updatePreferences

### ✅ Task 5: Calculations + Utils — `src/services/calculations/` + `src/utils/`
- `tdee.ts` — calculateBMR (Mifflin, Harris, Katch), calculateTDEE
- `calories.ts` — calculateCalorieTarget (all goal types, safe minimums)
- `macros.ts` — calculateMacroTargets (protein 1.6–2.2 g/kg, fat 0.9 g/kg, carbs from remainder)
- `bodyFat.ts` — navyBodyFatPercentage (male/female), calculateBMI, calculateLeanMass
- `nutrition.ts` — sumNutrition, scaleNutrition
- `utils/units.ts` — lbsToKg, kgToLbs, ftInToCm, cmToFtIn, ozToG, gToOz, cupsToMl, tbspToMl, tspToMl
- `utils/formatting.ts` — formatCalories, formatMacroG, formatWeight, formatHeight, formatDate, formatAge, formatPercentage
- `utils/validation.ts` — isValidHeightCm, isValidAge, isValidWeightKg, isValidGoalRate, isValidCalorieTarget, isValidServings

### ✅ Task 6: Navigation + Stores + App.tsx
- `src/navigation/types.ts` — re-exports from src/types/navigation.ts
- `src/navigation/OnboardingNavigator.tsx` — all 12 screens (headerShown: false)
- `src/navigation/MainTabNavigator.tsx` — 5 bottom tabs
- `src/navigation/RootNavigator.tsx` — checks DB for user, routes to Onboarding or Main
- Placeholder screens (all have `<Text>ScreenName</Text>`):
  - Onboarding: Welcome, Height, BirthDate, Sex, TrackingQuiz, ActivityLevel, GoalSelection, TDEEFormula, CurrentWeight, GoalConfig, PreferencesReview, Complete
  - Tabs: HomeScreen, DailyLogScreen, MealsScreen, MetricsScreen, MoreScreen
- `src/stores/useUserStore.ts` — Zustand (user, setUser, updateUser)
- `src/stores/useFoodLogStore.ts` — Zustand (entries, dailyTotals, selectedDate)
- `src/stores/usePreferencesStore.ts` — Zustand (preferences, setPreferences, updatePreferences)
- `src/stores/useOnboardingStore.ts` — Zustand (full onboarding data, update, reset)
- `App.tsx` — initializeDatabase on mount, then SafeAreaProvider + RootNavigator

### ✅ Task 7: Tests + Tooling
- `__tests__/calculations/tdee.test.ts` — 8 tests (all passing)
- `jest.config.js` — ts-jest preset, node environment
- Installed: `@types/jest`, `jest`, `ts-jest`
- `tsconfig.json` — added `"types": ["jest"]`
- `tsc --noEmit` — passes clean (0 errors)
- `npx jest` — 8/8 tests passing

---

## Correction to Handoff Doc: Mifflin BMR for test case

The previous handoff said "30yo male, 80kg, 180cm → BMR=1805". This was wrong.
Actual: `10(80)+6.25(180)−5(30)+5 = 800+1125−150+5 = 1780`. TDEE=1780×1.2=2136.
Tests use correct values.

---

## Phase 1 Complete — Ready for Phase 2

Phase 2 is Onboarding + Profile (12 screens). All the types, DB functions, calculations, and navigation skeletons needed for onboarding are already in place.

### To Resume (Phase 2 Prompt):
> Continue LibreFood Phase 2: implement the full onboarding flow (12 screens). Types, DB, calculations, and navigation skeleton are done. Start with WelcomeScreen, then implement each screen in sequence. All screens live in `src/screens/onboarding/`. Use `useOnboardingStore` for state, navigation types from `src/types/navigation.ts`, and validation from `src/utils/validation.ts`. Bash commands need: `source ~/.nvm/nvm.sh` prefix.

---

## Key Technical Notes

- **nvm:** `source ~/.nvm/nvm.sh` in every Bash command (NOT `export NVM_DIR && \. ...` — that path fails)
- **expo-sqlite v14 API**: `openDatabaseAsync`, `runAsync`, `getFirstAsync`, `getAllAsync`
- **TypeScript strict**: `tsc --noEmit` passes clean
- **Tests**: `npx jest` runs via `ts-jest` preset, 8/8 passing
- **DB singleton**: `openDatabase()` in `init.ts` — call this before any service, or use `initializeDatabase()` which also runs migrations
