# Phase 2 Handoff — Onboarding Flow

## Status: COMPLETE ✅

All 12 onboarding screens are implemented, type-safe, and connected to the existing stores/DB/calculations from Phase 1.

---

## What was built

### Shared components (`src/components/common/`)
| File | Purpose |
|------|---------|
| `OnboardingLayout.tsx` | SafeAreaView + progress bar + title/subtitle + ScrollView wrapper |
| `PrimaryButton.tsx` | Styled button, `variant='primary'` (blue) or `'secondary'` (gray outline) |
| `SelectCard.tsx` | Tappable card with radio or checkbox indicator, selected state highlight |

### Onboarding screens (`src/screens/onboarding/`)
| Screen | Progress | Key behavior |
|--------|----------|-------------|
| `WelcomeScreen` | 0 | App name, tagline, 3 feature bullets, "Get Started" |
| `HeightScreen` | 1/11 | Metric (cm) or Imperial (ft/in) segment toggle, validates 100–250 cm |
| `BirthDateScreen` | 2/11 | MM/DD/YYYY fields, real-time age display, validates age 13–120 |
| `SexScreen` | 3/11 | Male/Female/Other radio cards |
| `TrackingQuizScreen` | 4/11 | 7 multi-select purpose cards, at least 1 required |
| `ActivityLevelScreen` | 5/11 | 5 activity levels with descriptions |
| `GoalSelectionScreen` | 6/11 | 5 goal types (loss/gain/maintenance/recomp/custom) |
| `TDEEFormulaScreen` | 7/11 | Mifflin (default)/Harris/Katch; always has a selection |
| `CurrentWeightScreen` | 8/11 | Numeric input with kg↔lbs toggle button, validates 30–300 kg |
| `GoalConfigScreen` | 9/11 | Live TDEE display, goal weight + rate selector (loss/gain), custom calorie input, timeline estimate |
| `PreferencesReviewScreen` | 10/11 | Summary table of all collected data + calorie target |
| `CompleteScreen` | 11/11 | TDEE + calorie target + macros display, "Start Tracking" persists to DB |

---

## Data flow

```
Each screen → useOnboardingStore.update({ ... })
CompleteScreen.handleComplete():
  1. createUser(data) → userId
  2. buildPreferences(userId, tracking_purposes) → createPreferences()
  3. getUser(userId) → useUserStore.setUser()
  4. getPreferences(userId) → usePreferencesStore.setPreferences()
  5. useOnboardingStore.reset()
  6. navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
```

After completion, `RootNavigator` detects the user via `getFirstUser()` and routes directly to `MainTabNavigator` on subsequent launches.

---

## `buildPreferences()` logic (CompleteScreen.tsx)

Maps `TrackingPurpose[]` to `UserTrackingPreferences`. Starts with base defaults (calories + all 4 macros on), then overlays per-purpose additions:

| Purpose | Effect |
|---------|--------|
| `keep_it_simple` | `ui_theme='minimalist'`, carbs+fat tracking off |
| `track_everything` | `ui_theme='maximalist'`, all 34 nutrients + body metrics + photos + research feed |
| `weight_management` | `track_weight=1` |
| `athletic_performance` | sodium + potassium + weight |
| `general_health` | vitamins A/C/D + iron + calcium |
| `specific_health` | all micronutrients on |
| `learn_nutrition` | vitamins A/C/D + fiber + sugar + calcium + iron + `show_research_feed=1` |

Multiple selections merge (union).

---

## Katch-McArdle note

When `tdee_formula='katch'` and no body fat % is known, lean body mass is estimated as `weight_kg × 0.85`. This is used in `GoalConfigScreen` and `CompleteScreen`. User can refine BF% in Phase 4 (Metrics).

---

## Verification checklist (run before Phase 3)

- [ ] `tsc --noEmit` — no errors (was clean at handoff)
- [ ] `npx expo start` — app launches on WelcomeScreen
- [ ] Walk all 12 screens — validation blocks "Next" on invalid input
- [ ] Complete flow → SQLite has user row (`getFirstUser()` returns non-null)
- [ ] Kill/reopen app → lands on MainTabNavigator, not onboarding

---

## Phase 3: Food Search + Logging

Next phase implements the core food logging experience:

### Screens to build
- `DailyLogScreen` — daily food log by meal (Breakfast/Lunch/Dinner/Snacks), macro summary bar
- `FoodSearchScreen` — search bar → USDA API → results list; cache hits shown first
- `FoodDetailScreen` — food details, serving size input, log button
- `CustomFoodCreateScreen` — manual food entry form
- `CustomFoodEditScreen` — edit a custom food

### Architecture
- USDA FoodData Central: `GET /foods/search?query=...&api_key=...` → cache in `foods` table
- `src/services/api/usda.ts` — fetch wrapper (use `config.ts` base URL)
- `src/services/database/foods.ts` — `upsertFood()`, `searchLocalFoods()` — already exists
- `src/services/database/foodLog.ts` — `addLogEntry()`, `getLogForDate()` — already exists
- `useFoodLogStore` — already exists (in-memory log state)

### Key decisions needed
1. USDA API key handling — hardcode a demo key or require user to enter?
2. Serving size: support multiple serving units from USDA data?
3. Meal types: fixed 4 (Breakfast/Lunch/Dinner/Snacks) or configurable?

### Files to create/modify
**Create:**
- `src/services/api/usda.ts` — USDA search + detail fetch
- `src/screens/log/DailyLogScreen.tsx`
- `src/screens/log/FoodSearchScreen.tsx`
- `src/screens/log/FoodDetailScreen.tsx`
- `src/screens/log/CustomFoodCreateScreen.tsx`
- `src/screens/log/CustomFoodEditScreen.tsx`

**Modify:**
- Navigation to wire up `LogStackNavigator` (currently placeholder)
- `MainTabNavigator` — Log tab should use the stack

**No changes needed:**
- All DB services, types, stores — already in place from Phase 1
