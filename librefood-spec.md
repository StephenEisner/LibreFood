# LibreFood — Complete Product Specification

**Version:** 2.0 (Fresh Start)
**Date:** February 26, 2026
**Author:** Stephen + Claude
**License:** GPL v3

---

## 1. Vision & Philosophy

LibreFood is a free, open-source, privacy-first nutrition tracking app. It is the first application in the LibreTasks ecosystem — a suite of local-first productivity tools built on principles of complete user data ownership.

### Core Values
- **100% Free** — All features available to everyone, forever. No premium tiers.
- **Evidence-Based** — Built on scientific research, not fad diets. No pseudoscience.
- **Privacy-First** — All data stored locally on your device. No cloud dependency.
- **Education-Focused** — Help users understand nutrition, not just track it.
- **No BS** — No ads, no upsells, no sponsored content, no data mining.

### Why LibreFood?
Other nutrition apps lock vitamins and minerals behind paywalls. They sell your health data. They push supplement upsells. LibreFood gives you everything — macros, micros, full vitamin/mineral tracking, body metrics, recipes, meal planning — for free, forever, with your data never leaving your device.

---

## 2. Tech Stack

### Platform & Framework
- **Framework:** React Native with Expo SDK 55 (React Native 0.83, React 19.2)
- **Language:** TypeScript (strict mode, no `any`)
- **Target Platforms:** iOS (primary), Mac (secondary), Linux (future)
- **Architecture:** New Architecture only (SDK 55 requirement)

### Core Libraries
| Library | Purpose |
|---------|---------|
| `expo-sqlite` | Local database (with tagged template literals, SQLite Inspector DevTools) |
| `@react-navigation/native` | Navigation (stack + bottom tabs) |
| `@react-navigation/native-stack` | Native stack navigator |
| `@react-navigation/bottom-tabs` | Tab navigation |
| `zustand` | State management (lightweight, no boilerplate) |
| `date-fns` | Date manipulation |
| `expo-camera` | Barcode scanning (can opt out to reduce size) |
| `expo-file-system` | Progress photos storage |
| `expo-secure-store` | Sensitive preferences |
| `expo-haptics` | Tactile feedback |

### Data Sources
| Source | Purpose | Access Method |
|--------|---------|---------------|
| USDA FoodData Central | Authoritative nutrition data, vitamins, minerals | API (hybrid: query + local cache) |
| Open Food Facts | Barcode scanning, branded/packaged products | API |
| PubMed | Nutrition research feed | API |

### Data Strategy: Hybrid Cache
- Query USDA FoodData Central API on search
- Cache every result locally in SQLite
- Over time, the user builds a rich local database of foods they actually eat
- Frequently searched foods are instant (no network needed)
- Each user's phone makes requests directly (1,000 req/hour per IP — more than enough)
- Future: option to bundle a curated subset for full offline use

---

## 3. Database Schema

All data stored locally in SQLite. WAL mode enabled. Foreign keys enforced.

### 3.1 User Profile

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  height_cm REAL NOT NULL,
  birth_date TEXT NOT NULL,           -- ISO date
  sex TEXT NOT NULL,                   -- 'male', 'female', 'other'
  activity_level TEXT NOT NULL,        -- 'sedentary', 'light', 'moderate', 'active', 'very_active'
  tdee_formula TEXT DEFAULT 'mifflin', -- 'mifflin', 'harris', 'katch'
  goal_type TEXT,                      -- 'loss', 'gain', 'maintenance', 'recomp', 'custom'
  goal_weight_kg REAL,
  goal_rate_kg_per_week REAL,          -- 0.25, 0.5, 0.75, 1.0
  custom_calorie_target INTEGER,
  tracking_purpose TEXT,               -- JSON array of selected purposes from quiz
  unit_system TEXT DEFAULT 'imperial', -- 'metric', 'imperial'
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### 3.2 Tracking Preferences ("Diet Your Way")

```sql
CREATE TABLE user_tracking_preferences (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  
  -- UI customization
  focus_mode TEXT DEFAULT 'standard',       -- derived from quiz
  ui_theme TEXT DEFAULT 'standard',         -- 'minimalist', 'standard', 'maximalist'
  color_scheme TEXT DEFAULT 'system',       -- 'light', 'dark', 'system'
  
  -- Macro tracking toggles
  track_calories INTEGER DEFAULT 1,
  track_protein INTEGER DEFAULT 1,
  track_carbs INTEGER DEFAULT 1,
  track_fat INTEGER DEFAULT 1,
  track_fiber INTEGER DEFAULT 0,
  track_sugar INTEGER DEFAULT 0,
  track_cholesterol INTEGER DEFAULT 0,
  track_sodium INTEGER DEFAULT 0,
  track_saturated_fat INTEGER DEFAULT 0,
  track_trans_fat INTEGER DEFAULT 0,
  
  -- Vitamin tracking toggles
  track_vitamin_a INTEGER DEFAULT 0,
  track_vitamin_c INTEGER DEFAULT 0,
  track_vitamin_d INTEGER DEFAULT 0,
  track_vitamin_e INTEGER DEFAULT 0,
  track_vitamin_k INTEGER DEFAULT 0,
  track_thiamin INTEGER DEFAULT 0,
  track_riboflavin INTEGER DEFAULT 0,
  track_niacin INTEGER DEFAULT 0,
  track_vitamin_b6 INTEGER DEFAULT 0,
  track_folate INTEGER DEFAULT 0,
  track_vitamin_b12 INTEGER DEFAULT 0,
  
  -- Mineral tracking toggles
  track_calcium INTEGER DEFAULT 0,
  track_iron INTEGER DEFAULT 0,
  track_magnesium INTEGER DEFAULT 0,
  track_phosphorus INTEGER DEFAULT 0,
  track_potassium INTEGER DEFAULT 0,
  track_zinc INTEGER DEFAULT 0,
  track_copper INTEGER DEFAULT 0,
  track_manganese INTEGER DEFAULT 0,
  track_selenium INTEGER DEFAULT 0,
  
  -- Body metrics toggles
  track_weight INTEGER DEFAULT 1,
  track_body_fat INTEGER DEFAULT 0,
  track_measurements INTEGER DEFAULT 0,
  
  -- Feature visibility
  show_progress_photos INTEGER DEFAULT 1,
  show_research_feed INTEGER DEFAULT 1,
  show_recipes INTEGER DEFAULT 1,
  show_meal_planning INTEGER DEFAULT 0,
  
  -- Dashboard layout (JSON: which widgets, what order)
  dashboard_layout TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3.3 Body Metrics

```sql
CREATE TABLE body_metrics (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,               -- ISO date
  weight_kg REAL,
  body_fat_percentage REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_body_metrics_user_date ON body_metrics(user_id, date);

CREATE TABLE progress_photos (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  photo_type TEXT NOT NULL,         -- 'front', 'side', 'back', 'other'
  file_path TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3.4 Foods (USDA Cache + Custom)

```sql
-- Cached USDA foods (populated as user searches)
CREATE TABLE foods (
  fdc_id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  data_type TEXT,                    -- 'foundation', 'sr_legacy', 'branded', etc.
  brand_name TEXT,
  brand_owner TEXT,
  gtin_upc TEXT,
  serving_size REAL,
  serving_size_unit TEXT,
  household_serving_text TEXT,       -- "1 cup", "1 medium", etc.
  category TEXT,
  
  -- Nutrition stored as JSON blob for extensibility
  -- Contains all available nutrients from USDA response
  nutrition_json TEXT NOT NULL,
  
  -- Denormalized core macros for fast queries/display
  calories REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  
  cached_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_foods_description ON foods(description);
CREATE INDEX idx_foods_gtin ON foods(gtin_upc);

-- User-created foods
CREATE TABLE custom_foods (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size REAL NOT NULL,
  serving_size_unit TEXT NOT NULL,
  household_serving_text TEXT,
  
  -- Full nutrition as JSON (same structure as foods.nutrition_json)
  nutrition_json TEXT NOT NULL,
  
  -- Denormalized core macros
  calories REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  
  is_favorite INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3.5 Custom Meals

A "meal" is a saved combination of foods eaten together (no cooking involved).
Example: "My Morning Routine" = coffee with cream + 2 eggs + toast with butter.

```sql
CREATE TABLE custom_meals (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  is_favorite INTEGER DEFAULT 0,
  tags TEXT,                         -- JSON array: ["breakfast", "quick"]
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE custom_meal_items (
  id INTEGER PRIMARY KEY,
  meal_id INTEGER NOT NULL,
  food_id INTEGER,                   -- references foods.fdc_id (USDA)
  custom_food_id INTEGER,            -- references custom_foods.id
  recipe_id INTEGER,                 -- references custom_recipes.id
  servings REAL NOT NULL DEFAULT 1.0,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (meal_id) REFERENCES custom_meals(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(fdc_id),
  FOREIGN KEY (custom_food_id) REFERENCES custom_foods(id),
  FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id)
);
```

### 3.6 Custom Recipes

Full recipe with ingredients, instructions, yield, and auto-calculated nutrition.

```sql
CREATE TABLE custom_recipes (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,                 -- JSON array of step strings
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER,
  servings REAL NOT NULL DEFAULT 1.0,
  yield_amount REAL,
  yield_unit TEXT,                   -- "pancakes", "cups", "servings"
  difficulty TEXT,                   -- 'easy', 'medium', 'hard'
  tags TEXT,                         -- JSON array: ["dinner", "vegetarian", "quick"]
  notes TEXT,
  photo_path TEXT,
  is_favorite INTEGER DEFAULT 0,
  
  -- Cached per-serving nutrition (recomputed when ingredients change)
  nutrition_per_serving_json TEXT,
  calories_per_serving REAL,
  protein_per_serving_g REAL,
  carbs_per_serving_g REAL,
  fat_per_serving_g REAL,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE custom_recipe_ingredients (
  id INTEGER PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  food_id INTEGER,                   -- references foods.fdc_id
  custom_food_id INTEGER,            -- references custom_foods.id
  amount REAL NOT NULL,
  unit TEXT NOT NULL,                -- 'g', 'oz', 'cup', 'tbsp', 'tsp', 'ml', etc.
  name_override TEXT,                -- display name if different from food name
  sort_order INTEGER DEFAULT 0,
  is_optional INTEGER DEFAULT 0,
  notes TEXT,                        -- "finely diced", "room temperature"
  FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(fdc_id),
  FOREIGN KEY (custom_food_id) REFERENCES custom_foods(id)
);
```

### 3.7 Food Log

```sql
CREATE TABLE food_log (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,                -- ISO date
  meal_type TEXT NOT NULL,           -- 'breakfast', 'lunch', 'dinner', 'snack'
  
  -- One of these will be set (polymorphic reference)
  food_id INTEGER,                   -- USDA food
  custom_food_id INTEGER,            -- user-created food
  custom_meal_id INTEGER,            -- saved meal combo
  custom_recipe_id INTEGER,          -- recipe
  
  servings REAL NOT NULL DEFAULT 1.0,
  
  -- Snapshot of nutrition at time of logging (immutable)
  -- This preserves historical accuracy even if food data is updated
  logged_nutrition_json TEXT NOT NULL,
  logged_calories REAL,
  logged_protein_g REAL,
  logged_carbs_g REAL,
  logged_fat_g REAL,
  
  notes TEXT,
  time TEXT,                         -- optional specific time
  sort_order INTEGER DEFAULT 0,
  
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_food_log_user_date ON food_log(user_id, date);
CREATE INDEX idx_food_log_date_meal ON food_log(date, meal_type);
```

### 3.8 Research Articles Cache

```sql
CREATE TABLE research_articles (
  id INTEGER PRIMARY KEY,
  pubmed_id TEXT UNIQUE,
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT,
  journal TEXT,
  publication_date TEXT,
  url TEXT,
  relevance_tags TEXT,               -- JSON array: ["protein", "weight_loss"]
  fetched_at TEXT DEFAULT (datetime('now'))
);
```

### 3.9 Migration System

```sql
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT DEFAULT (datetime('now')),
  description TEXT
);
```

---

## 4. Feature Specifications

### 4.1 Onboarding Flow

A multi-screen setup wizard that configures the entire app experience.

**Screen sequence:**

1. **Welcome Screen**
   - App logo, tagline: "Evidence-based nutrition tracking. Free forever."
   - Feature highlights
   - "Get Started" button

2. **Height Input**
   - Unit toggle: Metric (cm) / Imperial (ft/in)
   - Numeric input with validation (100–250 cm)

3. **Birth Date**
   - Date picker
   - Validation: age 13–120
   - Shows calculated age

4. **Sex Selection**
   - Male, Female, Other
   - Note: "Used for TDEE calculation accuracy"

5. **Tracking Purpose Quiz ("What brings you to LibreFood?")**
   - Multi-select cards:
     - 🎯 Weight Management
     - 💪 Athletic Performance
     - ❤️ General Health
     - 🔬 Specific Health Condition
     - 🧠 Learn About Nutrition
     - 📊 Track Everything
     - ✨ Keep It Simple
   - Selections drive default tracking preferences

6. **Activity Level**
   - 5 options with descriptions and examples:
     - Sedentary (1.2): desk job, little exercise
     - Light (1.375): exercise 1–3 days/week
     - Moderate (1.55): exercise 3–5 days/week
     - Active (1.725): exercise 6–7 days/week
     - Very Active (1.9): hard daily exercise + physical job

7. **Goal Selection**
   - Lose weight / Gain weight / Maintain / Body recomposition / Custom calorie target

8. **TDEE Formula**
   - Mifflin-St Jeor (recommended)
   - Harris-Benedict
   - Katch-McArdle (if body fat % provided)
   - Brief description of each

9. **Current Weight**
   - Unit toggle: kg / lbs
   - Validation: 30–300 kg

10. **Goal Configuration**
    - Shows calculated TDEE
    - If loss/gain: target weight, rate (0.25–1.0 kg/week), estimated timeline
    - If maintenance/recomp: show maintenance calories
    - If custom: custom calorie input

11. **Preferences Review**
    - "Your LibreFood Setup" summary
    - What you'll be tracking
    - Dashboard preview
    - "Looks good!" or "Customize" buttons

12. **Completion**
    - "You're all set!" with summary stats
    - Quick tutorial overlay on first dashboard visit

**Quiz → Preference Mapping:**

| Quiz Selection | Default Preferences |
|----------------|-------------------|
| Weight Management | Calories, protein, weight tracking, macros |
| Athletic Performance | All macros, protein emphasis, sodium, potassium |
| General Health | Calories, macros, key vitamins (A, C, D), iron, calcium |
| Specific Health | All nutrients visible, condition-specific highlights |
| Learn About Nutrition | All nutrients, research feed visible, education cards |
| Track Everything | Maximalist theme, all toggles on |
| Keep It Simple | Minimalist theme, calories + protein only |

### 4.2 TDEE Calculator

**Formulas:**

**Mifflin-St Jeor (default):**
- Men: (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
- Women: (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161

**Harris-Benedict:**
- Men: 88.362 + (13.397 × weight_kg) + (4.799 × height_cm) − (5.677 × age)
- Women: 447.593 + (9.247 × weight_kg) + (3.098 × height_cm) − (4.330 × age)

**Katch-McArdle (requires body fat %):**
- 370 + (21.6 × lean_body_mass_kg)

**Calorie Target:**
- 1 kg fat ≈ 7,700 calories
- Loss: TDEE − (rate_kg_per_week × 7700 / 7) cal/day
- Gain: TDEE + (rate_kg_per_week × 7700 / 7) cal/day

**Macro Recommendations:**
- Protein: 1.6–2.2 g/kg bodyweight (higher for cutting)
- Fat: 0.8–1.0 g/kg bodyweight
- Carbs: remainder of calories

### 4.3 Food Tracking

**Food Search Flow:**
1. User types in search bar
2. Query local cache first (instant results)
3. Query USDA FoodData Central API in parallel
4. Merge and deduplicate results
5. Cache new API results locally
6. Display with source indicators

**Search Features:**
- Full-text search on food descriptions
- Filter by: All, Branded, Generic, Custom
- Recent foods quick access
- Favorites
- Barcode scanner (Open Food Facts)
- "Not found? Create custom food"

**Logging Flow:**
1. Search or scan food
2. See full nutrition profile (macros + micros)
3. Adjust serving size (slider, manual input, household measures)
4. Select meal type (breakfast, lunch, dinner, snack)
5. Optional: add time, notes
6. Log → nutrition snapshot saved to food_log

**Daily View:**
- Grouped by meal type
- Running totals per meal and per day
- Progress bars against daily targets
- Tap any logged item to edit/remove
- Quick-add buttons for recent/favorite foods

### 4.4 Detailed Nutrition Profiles

Every food, meal, and recipe shows a comprehensive nutrition profile:

**Macronutrients:**
- Calories (kcal)
- Protein (g)
- Total Carbohydrates (g) — with fiber, sugar, added sugar breakdown
- Total Fat (g) — with saturated, trans, monounsaturated, polyunsaturated breakdown
- Cholesterol (mg)

**Vitamins:**
- Vitamin A (mcg RAE)
- Vitamin C (mg)
- Vitamin D (mcg)
- Vitamin E (mg)
- Vitamin K (mcg)
- Thiamin / B1 (mg)
- Riboflavin / B2 (mg)
- Niacin / B3 (mg)
- Vitamin B6 (mg)
- Folate (mcg DFE)
- Vitamin B12 (mcg)

**Minerals:**
- Calcium (mg)
- Iron (mg)
- Magnesium (mg)
- Phosphorus (mg)
- Potassium (mg)
- Sodium (mg)
- Zinc (mg)
- Copper (mg)
- Manganese (mg)
- Selenium (mcg)

**Display:**
- Color-coded bars showing % of daily value (RDA/DV)
- Tap any nutrient for education card: "Why this matters", recommended ranges, food sources
- User can show/hide nutrients they don't care about (Diet Your Way)

### 4.5 Custom Foods

**Creation Flow:**
1. Name + optional brand
2. Serving size + unit
3. Enter nutrition facts (manual input, structured form)
4. Optional: household serving description
5. Save

**Features:**
- Copy from existing food and modify
- Barcode association
- Mark as favorite
- Edit/delete anytime

### 4.6 Custom Meals

**Creation Flow:**
1. Name the meal (e.g., "My Morning Routine")
2. Search and add foods, one at a time
3. Set servings for each item
4. See running nutrition total
5. Save

**Features:**
- Quick-log entire meal to any date/meal type
- Edit components (add/remove/adjust servings)
- Duplicate and modify
- Auto-calculated total nutrition
- Tags for organization

### 4.7 Custom Recipes

**Creation Flow:**
1. Name, description
2. Add ingredients (search foods → set amount + unit)
3. Add instructions (step-by-step text, can reorder)
4. Set yield (servings count + optional unit like "pancakes")
5. Set timing (prep, cook)
6. Tags, difficulty, notes
7. Optional photo
8. Save → auto-calculate nutrition per serving

**Features:**
- Full recipe builder with drag-to-reorder ingredients and steps
- Nutrition auto-calculated per serving from ingredients
- Scale recipe (adjust servings → ingredients scale proportionally)
- Log X servings of a recipe to your day
- Ingredient substitution notes
- Duplicate and modify recipes
- Tags and categories for filtering

### 4.8 Body Metrics

**Weight Tracking:**
- Daily weight entry (quick-entry from home screen)
- Trend graph: 7-day, 30-day, 90-day, all-time, custom range
- Moving average (7-day, 14-day)
- Goal progress indicator with estimated completion date
- Export to CSV

**Body Fat % Tracking:**
- Manual entry
- Built-in calculators:
  - Navy Method: waist, neck, height (+ hips for women)
  - 3-Site Skinfold (Jackson-Pollock)
  - 7-Site Skinfold
- Lean mass calculation
- Visual trend graph

**BMI Display:**
- Auto-calculated from height + weight
- Color-coded categories with educational note about BMI limitations

**Progress Photos:**
- Photo templates: Front, Side, Back, Custom
- Date-stamped gallery
- Side-by-side comparison mode
- Timeline slider
- Stored locally only
- Delete confirmation

### 4.9 Macro Dashboard

**Home Screen Widgets (user-configurable order):**
- Today's calorie progress (ring/bar)
- Macro breakdown (protein/carbs/fat bars or pie)
- Weight trend mini-graph
- Streak counter
- Quick actions (log food, log weight, scan barcode)
- Recent foods
- Research highlights
- Recipe suggestion

**Preset Focus Modes:**
- "Cutting" → Calories, protein, weight prominently
- "Bulking" → All macros, calorie surplus indicator
- "Maintenance" → Balanced view
- "Health Focus" → Key vitamins/minerals, wellness metrics
- "Custom" → User arranges everything

### 4.10 Education & Research Feed

**Nutrient Education Cards:**
- Every nutrient has a "Why it matters" expandable card
- Recommended daily values with sources
- Top food sources
- Deficiency symptoms
- Interaction notes (e.g., Vitamin C enhances iron absorption)

**PubMed Research Feed:**
- Curated nutrition research articles
- Filtered by relevance to user's tracking focus
- Article summaries
- Link to full papers
- Cached locally

### 4.11 UI Themes ("Diet Your Way")

Three information density tiers:

**Minimalist:**
- Calories + 1-2 key macros only
- Clean, spacious layout
- Large touch targets
- Minimal text

**Standard:**
- Full macros
- Key micros based on goals
- Balanced information density
- Default for most users

**Maximalist:**
- Every tracked nutrient visible
- Dense data tables
- Multiple chart types
- For the data-obsessed

**Plus:**
- Dark mode / Light mode / System
- Accent color customization (future)

### 4.12 Data Export & Portability

- Export all data to JSON
- Export food log to CSV
- Export body metrics to CSV
- Import from JSON backup
- Data is yours — always accessible, always exportable

---

## 5. Architecture

### 5.1 Project Structure

```
librefood/
├── app.config.ts                  # Expo configuration
├── App.tsx                        # Root component
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── common/                # Buttons, inputs, cards, etc.
│   │   ├── charts/                # Progress rings, bar charts, trends
│   │   ├── nutrition/             # Nutrition display components
│   │   └── forms/                 # Form components
│   ├── screens/                   # Screen components
│   │   ├── onboarding/            # All onboarding screens
│   │   ├── home/                  # Dashboard / home screen
│   │   ├── log/                   # Food logging screens
│   │   ├── foods/                 # Food search, detail, create
│   │   ├── meals/                 # Custom meals
│   │   ├── recipes/               # Custom recipes
│   │   ├── metrics/               # Body metrics, photos
│   │   ├── research/              # PubMed feed
│   │   └── settings/              # Profile, preferences, export
│   ├── navigation/                # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── OnboardingNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── types.ts
│   ├── services/                  # Business logic & data access
│   │   ├── database/              # SQLite operations
│   │   │   ├── init.ts            # DB initialization & migrations
│   │   │   ├── users.ts
│   │   │   ├── foods.ts
│   │   │   ├── meals.ts
│   │   │   ├── recipes.ts
│   │   │   ├── foodLog.ts
│   │   │   ├── metrics.ts
│   │   │   └── preferences.ts
│   │   ├── api/                   # External API clients
│   │   │   ├── usda.ts            # USDA FoodData Central
│   │   │   ├── openFoodFacts.ts   # Barcode lookups
│   │   │   └── pubmed.ts          # Research articles
│   │   └── calculations/          # Pure calculation functions
│   │       ├── tdee.ts
│   │       ├── calories.ts
│   │       ├── macros.ts
│   │       ├── bodyFat.ts
│   │       └── nutrition.ts       # Summing, averaging, etc.
│   ├── stores/                    # Zustand stores
│   │   ├── useUserStore.ts
│   │   ├── useFoodLogStore.ts
│   │   ├── usePreferencesStore.ts
│   │   └── useOnboardingStore.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── useDatabase.ts
│   │   ├── useFoodSearch.ts
│   │   ├── useNutritionTotals.ts
│   │   └── useWeightTrend.ts
│   ├── utils/                     # Utility functions
│   │   ├── units.ts               # Unit conversions
│   │   ├── formatting.ts          # Number/date formatting
│   │   ├── validation.ts
│   │   └── constants.ts           # RDA values, nutrient metadata
│   ├── types/                     # TypeScript types
│   │   ├── user.ts
│   │   ├── foods.ts
│   │   ├── meals.ts
│   │   ├── recipes.ts
│   │   ├── metrics.ts
│   │   ├── preferences.ts
│   │   ├── calculations.ts
│   │   ├── navigation.ts
│   │   └── api.ts                 # USDA response types, etc.
│   └── constants/                 # App-wide constants
│       ├── nutrients.ts           # Full nutrient metadata & RDA
│       ├── theme.ts               # Design tokens
│       └── config.ts              # API keys, endpoints
├── assets/                        # Images, fonts
├── docs/                          # Documentation
│   ├── SPEC.md                    # This file
│   ├── DATABASE_SCHEMA.md
│   └── API_INTEGRATION.md
└── __tests__/                     # Test files mirror src/ structure
```

### 5.2 Navigation Structure

```
Root
├── Onboarding Stack (shown if no user profile)
│   ├── Welcome
│   ├── Height
│   ├── BirthDate
│   ├── Sex
│   ├── TrackingQuiz
│   ├── ActivityLevel
│   ├── GoalSelection
│   ├── TDEEFormula
│   ├── CurrentWeight
│   ├── GoalConfig
│   ├── PreferencesReview
│   └── Complete
│
└── Main Tab Navigator (shown after onboarding)
    ├── Home Tab (Dashboard)
    │   └── Home Screen
    ├── Log Tab (Food Logging)
    │   ├── Daily Log View
    │   ├── Food Search
    │   ├── Food Detail
    │   ├── Create Custom Food
    │   └── Adjust Serving
    ├── Meals & Recipes Tab
    │   ├── Meals List
    │   ├── Create/Edit Meal
    │   ├── Recipes List
    │   ├── Create/Edit Recipe
    │   └── Recipe Detail
    ├── Metrics Tab
    │   ├── Weight Log
    │   ├── Body Fat Calculator
    │   ├── Progress Photos
    │   └── Trends & Charts
    └── More Tab
        ├── Settings / Profile
        ├── Preferences (Diet Your Way)
        ├── Research Feed
        ├── Data Export
        └── About
```

### 5.3 State Management

Zustand stores for:
- **User Store**: profile data, TDEE, targets
- **Food Log Store**: today's log, daily totals, recent foods
- **Preferences Store**: tracking toggles, theme, dashboard layout
- **Onboarding Store**: temp state during onboarding flow (discarded after completion)

Database is source of truth. Stores are hydrated from SQLite on app launch and kept in sync.

---

## 6. Implementation Phases

### Phase 1: Foundation (Weeks 1–2)
- [ ] Project setup (Expo SDK 55, TypeScript, linting)
- [ ] Database initialization + migration system
- [ ] All table creation
- [ ] TypeScript types for all entities
- [ ] TDEE calculation functions (all 3 formulas)
- [ ] Calorie/macro target calculations
- [ ] Unit conversion utilities
- [ ] Navigation skeleton (onboarding + main tabs)

### Phase 2: Onboarding + Profile (Weeks 3–4)
- [ ] All 12 onboarding screens
- [ ] Quiz → preference mapping logic
- [ ] User profile persistence
- [ ] Preferences persistence
- [ ] Settings screen (edit profile, change preferences)

### Phase 3: Food Search + Logging (Weeks 5–7)
- [ ] USDA API client
- [ ] Local food cache (query + persist)
- [ ] Food search screen (local + API hybrid)
- [ ] Food detail screen with full nutrition profile
- [ ] Serving size adjustment
- [ ] Food logging to daily log
- [ ] Daily log view (grouped by meal type)
- [ ] Daily nutrition totals
- [ ] Recent foods + favorites
- [ ] Custom food creation

### Phase 4: Dashboard + Metrics (Weeks 8–9)
- [ ] Home dashboard with configurable widgets
- [ ] Calorie progress ring
- [ ] Macro breakdown charts
- [ ] Weight logging + trend graph
- [ ] Body fat calculator (Navy method)
- [ ] BMI display
- [ ] Progress photos (capture, gallery, compare)

### Phase 5: Meals + Recipes (Weeks 10–12)
- [ ] Custom meal builder
- [ ] Quick-log meals
- [ ] Recipe builder (ingredients, instructions, yield)
- [ ] Recipe nutrition auto-calculation
- [ ] Recipe scaling
- [ ] Log recipe servings
- [ ] Tags, search, favorites for meals/recipes

### Phase 6: Polish + Extras (Weeks 13–15)
- [ ] Barcode scanning (Open Food Facts)
- [ ] PubMed research feed
- [ ] Nutrient education cards
- [ ] UI theme system (minimalist/standard/maximalist)
- [ ] Dark mode
- [ ] Data export (JSON, CSV)
- [ ] Data import
- [ ] Streak tracking
- [ ] Performance optimization
- [ ] Accessibility pass

---

## 7. Nutrition Data Reference

### USDA FoodData Central API

**Base URL:** `https://api.nal.usda.gov/fdc/v1/`

**Key Endpoints:**
- `POST /foods/search` — Search foods by query
- `GET /food/{fdcId}` — Get food details by FDC ID
- `POST /foods` — Get multiple foods by ID list

**Rate Limit:** 1,000 requests/hour per IP address (each user's phone = own limit)

**API Key:** Free, obtained from https://fdc.nal.usda.gov/api-key-signup

### Open Food Facts API

**Base URL:** `https://world.openfoodfacts.org/api/v2/`

**Key Endpoint:**
- `GET /product/{barcode}` — Get product by barcode

**Rate Limit:** None specified, but be respectful

### Recommended Daily Values (RDA/DV)

Based on FDA Daily Values (adults, 2,000 calorie diet):

| Nutrient | Daily Value | Unit |
|----------|-------------|------|
| Calories | 2,000 | kcal |
| Total Fat | 78 | g |
| Saturated Fat | 20 | g |
| Cholesterol | 300 | mg |
| Sodium | 2,300 | mg |
| Total Carbs | 275 | g |
| Fiber | 28 | g |
| Added Sugars | 50 | g |
| Protein | 50 | g |
| Vitamin A | 900 | mcg |
| Vitamin C | 90 | mg |
| Vitamin D | 20 | mcg |
| Vitamin E | 15 | mg |
| Vitamin K | 120 | mcg |
| Thiamin | 1.2 | mg |
| Riboflavin | 1.3 | mg |
| Niacin | 16 | mg |
| Vitamin B6 | 1.7 | mg |
| Folate | 400 | mcg |
| Vitamin B12 | 2.4 | mcg |
| Calcium | 1,300 | mg |
| Iron | 18 | mg |
| Magnesium | 420 | mg |
| Phosphorus | 1,250 | mg |
| Potassium | 4,700 | mg |
| Zinc | 11 | mg |
| Copper | 0.9 | mg |
| Manganese | 2.3 | mg |
| Selenium | 55 | mcg |

---

## 8. Product Website

A public-facing website to describe LibreFood, attract users, and establish credibility as a serious open-source project.

### Goals
- Communicate the core value proposition quickly (free, private, evidence-based)
- Differentiate from paid competitors (MyFitnessPal, Cronometer)
- Link to App Store / TestFlight and the GitHub repo
- Serve as a landing page for anyone who discovers the project

### Hosting
- **GitHub Pages** — static site, free, version-controlled alongside the app
- Lives at `librefood.app` (or `stepheneisner.github.io/LibreFood` until custom domain is set up)
- Separate repo or `/website` subdirectory in this repo (TBD)

### Content Sections
1. **Hero** — App name, tagline ("Evidence-based nutrition tracking. Free forever."), screenshot/mockup, primary CTA (Download on App Store / Join TestFlight)
2. **Why LibreFood?** — 3–4 differentiators: no paywalls, no data selling, open-source, scientific
3. **Features** — Key features with icons: full macro + micronutrient tracking, USDA data, barcode scanning, custom foods/meals/recipes, body metrics, research feed
4. **How It Works** — Simple 3-step: Set up your profile → Log your food → Understand your nutrition
5. **Privacy** — "Your data never leaves your device" — explicit privacy guarantee
6. **Open Source** — GPL v3, GitHub link, contribution welcome
7. **Footer** — Links: GitHub, Privacy Policy, Contact

### Tech Stack (Website)
- Plain HTML/CSS/JS or a simple static site generator (e.g., Astro, Eleventy)
- No frameworks required — the site should be fast and simple
- Mobile-responsive
- Dark/light mode support

### When to Build
After Phase 3 (food logging) is working — at that point there's enough of a product to show. Can be built in parallel with Phase 4 or 5.

---

## 9. Claude Code Session Prompts

Prepared prompts for each implementation phase, to be used when starting coding sessions.

### Session 1: Project Initialization

```
# Task: Initialize LibreFood project with Expo SDK 55

## Requirements
1. Create Expo project with TypeScript template
2. Install all dependencies from spec
3. Configure app.config.ts with expo-sqlite plugin (enableFTS: true)
4. Set up ESLint + Prettier
5. Create directory structure per spec
6. Create placeholder files for navigation skeleton
7. Verify project builds and runs

## Dependencies to install
expo-sqlite, @react-navigation/native, @react-navigation/native-stack, 
@react-navigation/bottom-tabs, zustand, date-fns, expo-camera, 
expo-file-system, expo-secure-store, expo-haptics,
react-native-screens, react-native-safe-area-context

## Verify
- `npx expo start` runs without errors
- TypeScript compiles cleanly
- SQLite module loads
```

### Session 2: Database Layer

```
# Task: Implement complete SQLite database layer

## Requirements
1. Database initialization with WAL mode + foreign keys
2. Migration system (schema_migrations table, versioned migrations)
3. All tables from spec (users, preferences, foods, custom_foods, 
   custom_meals, custom_meal_items, custom_recipes, 
   custom_recipe_ingredients, food_log, body_metrics, 
   progress_photos, research_articles)
4. CRUD functions for each table
5. Use expo-sqlite tagged template literals where appropriate
6. TypeScript types for all entities (strict, no `any`)
7. Indexes on frequently queried fields

## Key patterns
- Singleton database connection
- All operations async
- Nutrition stored as JSON blobs with denormalized core macros
- Food log snapshots nutrition at time of logging (immutable)

## Tests
- All tables create successfully
- CRUD operations work for each entity
- Foreign key constraints enforced
- Cascading deletes work correctly
- Migration system tracks versions properly
```

### Session 3: Calculations

```
# Task: Implement all calculation functions

## TDEE Formulas
- Mifflin-St Jeor (men/women)
- Harris-Benedict (men/women)
- Katch-McArdle (lean body mass)
- Activity multipliers (5 levels: 1.2, 1.375, 1.55, 1.725, 1.9)

## Calorie Targets
- Loss: TDEE - (rate * 7700 / 7)
- Gain: TDEE + (rate * 7700 / 7)
- Maintenance: TDEE
- Custom: user-specified

## Macro Recommendations
- Protein: 1.6-2.2 g/kg (based on goal)
- Fat: 0.8-1.0 g/kg
- Carbs: remainder

## Body Fat Calculators
- Navy Method (men/women formulas)
- BMI calculation

## Unit Conversions
- lbs ↔ kg, ft/in ↔ cm, oz ↔ g, cups/tbsp/tsp ↔ ml

## Requirements
- Pure functions (no side effects)
- Comprehensive tests with known values
- Edge case handling (negative values, zeroes, extremes)
- TypeScript types for all inputs/outputs
```

---

## 9. Key Design Decisions

1. **Nutrition as JSON blobs** — Extensible without schema migrations when USDA adds new nutrients. Core macros denormalized for fast queries.

2. **Food log snapshots** — `logged_nutrition_json` captures nutrition at time of logging. Even if food data is later updated or corrected, your historical log remains accurate.

3. **Hybrid data strategy** — API-first with aggressive local caching. Users build their own local food database organically through usage.

4. **Diet Your Way** — Everything is toggleable. Don't care about Vitamin K? Hide it. Want to see every mineral? Turn them all on. The app adapts to your goals.

5. **Three-tier food model** — Foods (building blocks) → Meals (combos, no cooking) → Recipes (ingredients + instructions + yield). Clear conceptual hierarchy.

6. **Expo SDK 55** — Latest stable release with New Architecture, tagged template literals for SQLite, SQLite Inspector DevTools, React 19.2.

7. **No server** — Zero backend infrastructure. Everything local. USDA/OFF APIs queried directly from the device. The only "server" is a static GitHub Pages site.
