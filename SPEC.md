## Development Milestones

### Phase 1: Foundation (Weeks 1-3)
**Week 1:**
- Project setup (Expo init)
- Database schema implementation (all tables including meals, recipes, preferences)
- User table and profile creation
- Onboarding flow UI (basic screens)

**Week 2:**
- TDEE calculator implementation (all formulas)
- Goal setting logic
- Profile settings screen
- Metric/imperial unit conversion
- **NEW: Onboarding quiz implementation**
- **NEW: Tracking preferences setup**

**Week 3:**
- Local storage integration
- Data persistence
- Settings management
- Basic navigation structure
- **NEW: UI theme system foundation**

### Phase 2: Food Tracking & Custom Foods (Weeks 4-5)
**Week 4:**
- USDA database integration (download and embed)
- Food search functionality
- Food details display
- Serving size calculations
- Custom food creation

**Week 5:**
- Food logging implementation
- Daily log view
- Macro calculation and display
- Edit/delete log entries
- **NEW: Adaptive UI based on tracking preferences**

### Phase 2.5: Custom Meals & Recipes (Weeks 5.5-6.5)
**Week 5.5:**
- Custom meals feature
  - Create/edit meals
  - Add foods to meals
  - Quick-log meals
  - Meal management screen

**Week 6:**
- Custom recipes (basic)
  - Create recipe
  - Add ingredients
  - Basic instructions (text)
  - Nutrition calculation engine
  - Recipe list view

**Week 6.5:**
- Recipe enhancements
  - Step-by-step instructions
  - Timing fields (prep/cook)
  - Recipe photos
  - Categories and tags
  - Recipe scaling
  - Recipe detail view

### Phase 3: Body Metrics (Week 7)
- Weight tracking UI and logic
- Body fat % calculators (Navy, Skinfold)
- BMI calculation
- Progress photo capture and storage
- Metrics graphs (weight, BF%)

### Phase 4: Analytics (Week 8)
- Dashboard home screen (adaptive based on preferences)
- Detailed analytics views
- All chart types (line, bar, circular progress)
- Date range filtering
- Summary statistics calculations
- **NEW: Dashboard customization** (widget ordering)

### Phase 5: Education Hub (Week 9)
- PubMed API integration
- Research feed UI
- Static education content pages
- Nutrient explainer modals
- Bookmark functionality

### Phase 6: Advanced Features (Week 10)
- Barcode scanning (Expo + Open Food Facts)
- Recipe/meal sharing (export/import)
- **NEW: UI theme switcher** (minimalist/standard/maximalist)
- **NEW: Advanced tracking preferences** screen

### Phase 6.5: Computer Vision (Week 10.5)
- Research and select CV approach (API vs on-device)
- Implement photo capture for food
- Food recognition integration
- Calorie estimation from images
- User adjustment interface
- Accuracy validation and edge case testing
- Privacy-preserving implementation

### Phase 7: Polish & Launch Prep (Week 11)
- Data export functionality (all types)
- Onboarding improvements
- UI polish and animations
- Performance optimization
- Bug fixes
- App store assets (screenshots, descriptions)

### Phase 8: Beta Testing (Weeks 12-13)
- TestFlight (iOS) and internal testing (Android)
- User feedback collection
- Bug fixes
- Final polish

### Phase 9: Launch (Week 14)
- App Store submission
- Google Play submission
- F-Droid submission
- Website launch (GitHub Pages)
- Initial marketing (Reddit, Product Hunt, etc.)# LibreFood - Product Specification Document

## Project Overview

**Name:** LibreFood  
**Tagline:** Evidence-based nutrition tracking. Free forever.  
**Platform:** Native Mobile (iOS + Android)  
**Tech Stack:** React Native + Expo  
**Philosophy:** Open source, science-first, no premium tiers, complete data ownership

---

## Core Values

1. **Free & Open Source** - All features available to everyone, forever
2. **Evidence-Based** - Science and research-driven, no fad diets
3. **Privacy-First** - All data stored locally, user owns everything
4. **Education-Focused** - Help users understand nutrition, not just track it
5. **Customizable** - "Diet your way" - track only what matters to you
6. **No BS** - No ads, no upsells, no sponsored content

---

## Tech Stack

### Frontend
- **React Native** with **Expo** (managed workflow)
- **TypeScript** for type safety
- **React Navigation** for routing
- **Zustand** or Context API for state management
- **React Query** for API caching and data fetching
- **React Native Paper** or **NativeBase** for UI components

### Storage
- **Expo SQLite** for embedded USDA database and user data
- **Expo FileSystem** for progress photos
- **Expo SecureStore** for sensitive preferences (if needed)

### APIs & Data Sources
- **USDA FoodData Central** (embedded database + API fallback)
- **Open Food Facts** (barcode scanning)
- **PubMed API** (nutrition research feed)

### Build & Distribution
- **EAS Build** for app store builds
- **GitHub** for version control and issue tracking
- **GitHub Pages** for static website

---

## Data Architecture

### Local Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  height_cm REAL NOT NULL,
  birth_date TEXT NOT NULL,
  sex TEXT NOT NULL, -- 'male', 'female', 'other'
  activity_level TEXT NOT NULL, -- 'sedentary', 'light', 'moderate', 'active', 'very_active'
  tdee_formula TEXT DEFAULT 'mifflin', -- 'mifflin', 'harris', 'katch'
  goal_type TEXT, -- 'loss', 'gain', 'maintenance', 'recomp', 'custom'
  goal_weight_kg REAL,
  goal_rate_kg_per_week REAL, -- 0.25, 0.5, 0.75, 1.0
  custom_calorie_target INTEGER,
  tracking_purpose TEXT, -- JSON array of purposes from onboarding quiz
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### Body Metrics Table
```sql
CREATE TABLE body_metrics (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL, -- ISO date
  weight_kg REAL,
  body_fat_percentage REAL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Progress Photos Table
```sql
CREATE TABLE progress_photos (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  photo_type TEXT NOT NULL, -- 'front', 'side', 'back', 'other'
  file_path TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Foods Table (USDA Database - embedded)
```sql
CREATE TABLE foods (
  fdc_id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  data_type TEXT, -- 'foundation', 'sr_legacy', 'branded', etc.
  brand_name TEXT,
  brand_owner TEXT,
  gtinUpc TEXT,
  serving_size REAL,
  serving_size_unit TEXT,
  category TEXT,
  -- Macros
  calories REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  fiber_g REAL,
  sugar_g REAL,
  -- Vitamins (all in appropriate units)
  vitamin_a_mcg REAL,
  vitamin_c_mg REAL,
  vitamin_d_mcg REAL,
  vitamin_e_mg REAL,
  vitamin_k_mcg REAL,
  thiamin_mg REAL,
  riboflavin_mg REAL,
  niacin_mg REAL,
  vitamin_b6_mg REAL,
  folate_mcg REAL,
  vitamin_b12_mcg REAL,
  -- Minerals
  calcium_mg REAL,
  iron_mg REAL,
  magnesium_mg REAL,
  phosphorus_mg REAL,
  potassium_mg REAL,
  sodium_mg REAL,
  zinc_mg REAL,
  copper_mg REAL,
  manganese_mg REAL,
  selenium_mcg REAL,
  -- Additional
  cholesterol_mg REAL,
  saturated_fat_g REAL,
  trans_fat_g REAL,
  updated_at TEXT
);
```

#### Custom Foods Table (user-created)
```sql
CREATE TABLE custom_foods (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size REAL NOT NULL,
  serving_size_unit TEXT NOT NULL,
  -- Same nutrient columns as foods table
  calories REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  fiber_g REAL,
  sugar_g REAL,
  -- Vitamins
  vitamin_a_mcg REAL,
  vitamin_c_mg REAL,
  vitamin_d_mcg REAL,
  vitamin_e_mg REAL,
  vitamin_k_mcg REAL,
  thiamin_mg REAL,
  riboflavin_mg REAL,
  niacin_mg REAL,
  vitamin_b6_mg REAL,
  folate_mcg REAL,
  vitamin_b12_mcg REAL,
  -- Minerals
  calcium_mg REAL,
  iron_mg REAL,
  magnesium_mg REAL,
  phosphorus_mg REAL,
  potassium_mg REAL,
  sodium_mg REAL,
  zinc_mg REAL,
  copper_mg REAL,
  manganese_mg REAL,
  selenium_mcg REAL,
  -- Additional
  cholesterol_mg REAL,
  saturated_fat_g REAL,
  trans_fat_g REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Custom Meals Table
```sql
CREATE TABLE custom_meals (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE custom_meal_items (
  id INTEGER PRIMARY KEY,
  meal_id INTEGER NOT NULL,
  food_id INTEGER, -- references foods.fdc_id
  custom_food_id INTEGER, -- references custom_foods.id
  recipe_id INTEGER, -- references custom_recipes.id
  servings REAL NOT NULL DEFAULT 1.0,
  notes TEXT, -- e.g., "extra butter", "no dressing"
  FOREIGN KEY (meal_id) REFERENCES custom_meals(id) ON DELETE CASCADE
);
```

#### Custom Recipes Table
```sql
CREATE TABLE custom_recipes (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  servings REAL NOT NULL, -- how many servings recipe yields
  
  -- Timing
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER,
  
  -- Instructions
  instructions TEXT, -- full text or JSON for step-by-step
  
  -- Categorization
  category TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'
  tags TEXT, -- JSON array: ['quick', 'vegetarian', 'high-protein']
  difficulty TEXT, -- 'easy', 'medium', 'hard'
  
  -- Media
  photo_path TEXT, -- local path to recipe photo
  
  -- Other
  notes TEXT, -- tips, substitutions
  source TEXT, -- where recipe came from (if adapted)
  is_favorite BOOLEAN DEFAULT 0,
  times_cooked INTEGER DEFAULT 0,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE custom_recipe_ingredients (
  id INTEGER PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  food_id INTEGER, -- references foods.fdc_id
  custom_food_id INTEGER, -- references custom_foods.id
  
  amount REAL NOT NULL,
  unit TEXT NOT NULL, -- 'cup', 'gram', 'tablespoon', etc.
  
  notes TEXT, -- e.g., "chopped", "diced", "optional"
  order_index INTEGER, -- for displaying ingredients in order
  
  FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id) ON DELETE CASCADE
);

CREATE TABLE custom_recipe_steps (
  id INTEGER PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  duration_minutes INTEGER, -- time for this step
  FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id) ON DELETE CASCADE
);

-- Recipe nutrition cache (pre-calculated for performance)
CREATE TABLE recipe_nutrition (
  recipe_id INTEGER PRIMARY KEY,
  per_serving BOOLEAN, -- true if per serving, false if total
  
  -- Cache all nutrition values
  calories REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  fiber_g REAL,
  sugar_g REAL,
  -- All vitamins and minerals (same as foods table)
  vitamin_a_mcg REAL,
  vitamin_c_mg REAL,
  vitamin_d_mcg REAL,
  -- ... (include all nutrients)
  
  calculated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id) ON DELETE CASCADE
);
```

#### Food Log Table
```sql
CREATE TABLE food_log (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL, -- ISO date
  time TEXT NOT NULL, -- ISO time or meal type
  meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
  food_id INTEGER, -- references foods.fdc_id
  custom_food_id INTEGER, -- references custom_foods.id
  servings REAL NOT NULL DEFAULT 1.0,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Nutrition Research Cache Table
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
  fetched_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### User Tracking Preferences Table
```sql
CREATE TABLE user_tracking_preferences (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  
  -- Based on onboarding quiz
  focus_mode TEXT, -- derived from quiz: 'weight_loss', 'performance', 'health', etc.
  ui_theme TEXT DEFAULT 'standard', -- 'minimalist', 'standard', 'maximalist'
  
  -- Macro tracking toggles
  track_calories BOOLEAN DEFAULT 1,
  track_protein BOOLEAN DEFAULT 1,
  track_carbs BOOLEAN DEFAULT 1,
  track_fat BOOLEAN DEFAULT 1,
  track_fiber BOOLEAN DEFAULT 0,
  track_sugar BOOLEAN DEFAULT 0,
  track_cholesterol BOOLEAN DEFAULT 0,
  track_sodium BOOLEAN DEFAULT 0,
  track_saturated_fat BOOLEAN DEFAULT 0,
  
  -- Vitamin tracking toggles
  track_vitamin_a BOOLEAN DEFAULT 0,
  track_vitamin_c BOOLEAN DEFAULT 0,
  track_vitamin_d BOOLEAN DEFAULT 0,
  track_vitamin_e BOOLEAN DEFAULT 0,
  track_vitamin_k BOOLEAN DEFAULT 0,
  track_b_vitamins BOOLEAN DEFAULT 0,
  
  -- Mineral tracking toggles
  track_calcium BOOLEAN DEFAULT 0,
  track_iron BOOLEAN DEFAULT 0,
  track_magnesium BOOLEAN DEFAULT 0,
  track_potassium BOOLEAN DEFAULT 0,
  track_zinc BOOLEAN DEFAULT 0,
  
  -- Body metrics tracking
  track_weight BOOLEAN DEFAULT 1,
  track_body_fat BOOLEAN DEFAULT 0,
  track_measurements BOOLEAN DEFAULT 0,
  
  -- Feature visibility
  show_progress_photos BOOLEAN DEFAULT 1,
  show_research_feed BOOLEAN DEFAULT 1,
  show_recipes BOOLEAN DEFAULT 1,
  show_meals BOOLEAN DEFAULT 1,
  show_meal_planning BOOLEAN DEFAULT 0,
  
  -- Dashboard customization
  dashboard_layout TEXT, -- JSON: which widgets to show and in what order
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## MVP Feature Specifications

### 1. User Onboarding & Profile

**Initial Setup Flow:**
1. Welcome screen (brand introduction)
2. Height input (cm or ft/in with toggle)
3. Birth date picker
4. Sex selection
5. **NEW: "What brings you to LibreFood?" Quiz** (tracking purpose)
6. Activity level selection with descriptions
7. Goal selection screen
8. TDEE calculation formula preference
9. Current weight entry
10. Goal configuration (target weight, rate, or custom calories)
11. **NEW: Tracking preferences review** (what you'll be tracking)

**Profile Settings (accessible later):**
- Edit all onboarding info
- Switch between metric/imperial
- Change TDEE formula
- Adjust goals
- **NEW: Customize tracking preferences** (what nutrients to track)
- **NEW: UI theme selector** (minimalist/standard/maximalist)
- Privacy settings
- Export data
- About/Help

### 2. TDEE Calculator

**Formulas to implement:**

**Mifflin-St Jeor (default):**
- Men: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
- Women: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

**Harris-Benedict:**
- Men: 88.362 + (13.397 × weight_kg) + (4.799 × height_cm) - (5.677 × age)
- Women: 447.593 + (9.247 × weight_kg) + (3.098 × height_cm) - (4.330 × age)

**Katch-McArdle (requires body fat %):**
- 370 + (21.6 × lean_body_mass_kg)

**Activity Multipliers:**
- Sedentary (little/no exercise): 1.2
- Light (exercise 1-3 days/week): 1.375
- Moderate (exercise 3-5 days/week): 1.55
- Active (exercise 6-7 days/week): 1.725
- Very Active (hard exercise daily + physical job): 1.9

**Calorie Target Calculation:**
- Maintenance: TDEE × activity_multiplier
- Weight loss: maintenance - (goal_rate_kg_per_week × 7700 / 7) cal/day
- Weight gain: maintenance + (goal_rate_kg_per_week × 7700 / 7) cal/day
- Custom: user-defined value

**Macro Recommendations (based on goal):**
- Protein: 1.6-2.2g per kg bodyweight (higher for cutting)
- Fat: 0.8-1.0g per kg bodyweight
- Carbs: remainder of calories

### 3. Body Metrics Tracking

**Weight Tracking:**
- Daily weight entry (manual)
- Quick entry from home screen
- Weight trend graph (7-day, 30-day, 90-day, all-time, custom)
- Moving average calculation (7-day, 14-day)
- Goal progress indicator
- Export to CSV

**Body Fat % Tracking:**
- Optional field
- Manual entry
- Built-in calculators:
  - **Navy Method**: waist, neck, height (+ hips for women)
  - **3-Site Skinfold** (Jackson-Pollock): chest, abdomen, thigh (men) or tricep, suprailiac, thigh (women)
  - **7-Site Skinfold**: chest, midaxillary, tricep, subscapular, abdomen, suprailiac, thigh
- Visual trend graph
- Lean mass calculation (if BF% provided)

**BMI Display:**
- Auto-calculated from height/weight
- Color-coded categories (underweight, normal, overweight, obese)
- Educational note: "BMI limitations explained" link

**Progress Photos:**
- Photo templates: Front, Side, Back, Custom
- Date-stamped gallery view
- Side-by-side comparison mode
- Timeline slider
- Photos stored locally only
- Optional notes per photo
- Delete protection (confirm before delete)

### 4. Food Tracking

**Food Search:**
- Search embedded USDA database
- Filter by: All, Branded, Generic, Custom Foods, Custom Meals, Custom Recipes
- Recent foods quick access
- Favorites/frequent foods
- Barcode scanner (Open Food Facts API)
- "Not found? Add custom food" CTA

**Food Entry:**
- Select food from search
- Adjust serving size (multiple, fraction, grams)
- Choose meal type (breakfast, lunch, dinner, snack, other)
- Set time (default: now)
- Add notes
- Quick copy from previous days
- **NEW: Quick-log entire custom meal**
- **NEW: Log recipe servings**

**Daily Log View:**
- Today's foods organized by meal
- Running calorie/macro totals
- Visual progress bars (calories, protein, carbs, fat)
- **NEW: Micronutrient summary** (only shows nutrients user is tracking)
- Edit/delete logged items
- Add quick note for the day
- **NEW: Expandable detail view** (based on UI theme)

**Nutrition Summary:**
- Macros: calories, protein, carbs, fat, fiber, sugar
- **NEW: Micronutrients** (only displayed if user is tracking them)
- % of daily value indicators (based on RDI/DV)
- Color coding: under/meeting/over targets
- **NEW: Adaptive display** based on tracking preferences

### 5. Custom Foods, Meals, and Recipes

#### Custom Foods

**Add Custom Food:**
- Name (required)
- Brand (optional)
- Serving size + unit
- Macros: calories, protein, carbs, fat (required)
- Fiber, sugar (optional)
- Full micronutrient entry (optional, expandable)
- Save to personal database

**Edit/Manage Custom Foods:**
- List view of all custom foods
- Search custom foods
- Edit existing
- Delete (with confirmation)
- Export custom foods

#### Custom Meals

**What is a Custom Meal:**
- Saved combination of foods you eat together
- No cooking involved, just foods consumed together
- Example: "Morning Coffee Routine" = coffee + cream + toast
- Quick-log the entire combination at once

**Create Custom Meal:**
- Name (required, e.g., "My Breakfast")
- Description (optional)
- Add foods:
  - Search and add from any source (USDA, custom foods, recipes)
  - Set servings for each item
  - Add notes per item (optional)
- Mark as favorite (optional)
- Save

**Manage Custom Meals:**
- List view of all meals
- Search meals
- Edit meal components
- Duplicate and modify
- Delete (with confirmation)
- Filter by favorites

**Log Custom Meal:**
- Search for meal
- Quick-log entire meal to current meal time
- Or adjust servings/items before logging
- Nutrition auto-calculated from components

#### Custom Recipes

**What is a Custom Recipe:**
- Full recipe with ingredients, instructions, and yield
- Cooking involved
- Nutrition calculated per serving
- Example: "Protein Pancakes (4 servings)"

**Create Custom Recipe:**
- **Basic Info:**
  - Name (required)
  - Description (optional)
  - Category (breakfast, lunch, dinner, snack, dessert)
  - Servings/Yield (required)
  - Difficulty (easy, medium, hard)
  - Tags (vegetarian, vegan, quick, high-protein, etc.)

- **Ingredients:**
  - Add ingredients from any source
  - Amount + unit for each
  - Notes per ingredient (e.g., "chopped", "optional")
  - Order ingredients as they appear in recipe

- **Instructions:**
  - Option 1: Full text instructions
  - Option 2: Step-by-step (structured)
    - Each step numbered
    - Optional duration per step
  
- **Timing:**
  - Prep time (optional)
  - Cook time (optional)
  - Total time (auto-calculated or manual)

- **Media:**
  - Add photo of finished dish (optional)
  - Take photo or select from gallery

- **Other:**
  - Notes (tips, substitutions, variations)
  - Source (if adapted from somewhere)
  - Mark as favorite

**Recipe Features:**
- **Nutrition Auto-Calculation:**
  - Total recipe nutrition calculated from ingredients
  - Per-serving nutrition displayed
  - Updates when ingredients change
  
- **Recipe Scaling:**
  - Adjust serving size
  - Ingredients auto-scale proportionally
  - Nutrition updates automatically

- **Cook Counter:**
  - Track how many times you've made it
  - Increments when you log it

**Manage Custom Recipes:**
- List view (card or list layout)
- Search recipes
- Filter by:
  - Category
  - Tags
  - Favorites
  - Recently cooked
- Sort by:
  - Name
  - Date created
  - Times cooked
  - Prep time
- Edit recipe
- Duplicate recipe (for variations)
- Delete (with confirmation)
- Share recipe (export to file)

**Log Custom Recipe:**
- Search for recipe
- View recipe details (ingredients, instructions, nutrition)
- Choose number of servings eaten
- Add to food log
- Nutrition auto-calculated for servings consumed
- Recipe "times cooked" counter increments

**Recipe Detail View:**
- Photo (if added)
- Name and description
- Category, tags, difficulty
- Servings yield
- Timing (prep/cook/total)
- Nutrition facts (per serving and total)
- Ingredients list
- Instructions (step-by-step or full text)
- Notes
- Action buttons:
  - Log servings
  - Edit recipe
  - Duplicate
  - Share
  - Delete

### 6. Analytics & Visualizations

**Dashboard/Home Screen:**
- Today's calorie intake vs target (circular progress)
- Today's macro breakdown (visual chart)
- Quick weight entry button
- "Log food" prominent CTA
- Streak counter (consecutive days logged)

**Detailed Analytics (separate tab/screen):**

**Graphs:**
- Weight trend (line graph, 7d/30d/90d/all/custom)
- Calorie intake over time (bar chart)
- Macro distribution over time (stacked bar)
- Protein intake trend
- Specific micronutrient trends (selectable)
- Goal progress projection

**Summary Stats:**
- Average daily calories (7d, 30d)
- Average macros
- Logging consistency %
- Weight change rate
- Days until goal (estimated)

**Granularity Options:**
- Daily view
- Weekly averages
- Monthly trends
- Custom date range selector

### 7. "Diet Your Way" - Customizable Tracking & UI

#### Onboarding Quiz: "What brings you to LibreFood?"

**Quiz Screen (after basic profile info, before goal setting):**

Display options (user can select multiple):
- 🎯 **Weight Management** (loss or gain)
- 💪 **Athletic Performance** (sports, gym)
- ❤️ **General Health** (feel better, more energy)
- 🔬 **Specific Health Condition** (diabetes, heart health, etc.)
- 🧠 **Learn About Nutrition** (education-focused)
- 📊 **Track Everything** (data enthusiast)
- ✨ **Keep It Simple** (just the basics)

**Configuration Profiles Based on Selection:**

**Weight Management:**
- Track: Calories, protein, weight
- UI Theme: Standard
- Dashboard: Calorie progress, weight trend, deficit calculator
- Show: Basic macros, weight projections
- Hide: Most micronutrients (available in settings)

**Athletic Performance:**
- Track: Calories, all macros (protein/carbs focus), weight
- UI Theme: Standard or Maximalist option
- Dashboard: Macro breakdown, meal timing suggestions
- Show: Pre/post workout features (future)
- Optional: Meal timing around workouts

**General Health:**
- Track: Balanced macros, key micros (Vit D, iron, calcium, fiber)
- UI Theme: Standard
- Dashboard: Balanced macro/micro view
- Show: Research feed, nutrient education
- Focus: Overall wellness, nutrient diversity

**Specific Health Condition:**
- Sub-menu appears:
  - Diabetes Management → Track carbs, sugar, fiber prominently
  - Heart Health → Track sodium, cholesterol, saturated fat
  - Other → User customizes
- UI Theme: Standard with focus on relevant nutrients
- Dashboard: Condition-specific metrics highlighted

**Learn About Nutrition:**
- Track: Everything available
- UI Theme: Maximalist (default, can change)
- Dashboard: Detailed breakdowns, all nutrients
- Show: Research feed (prominent), nutrient explainers
- Focus: Education and understanding

**Track Everything:**
- Track: All macros, all available micros
- UI Theme: Maximalist
- Dashboard: Dense info display, detailed analytics
- Show: All features, advanced analytics
- For data enthusiasts

**Keep It Simple:**
- Track: Calories, protein, weight only
- UI Theme: Minimalist
- Dashboard: Simple circular progress, minimal text
- Hide: Advanced features (available in settings)
- Clean, uncluttered experience

**Multi-Selection Logic:**
- If "Weight Management + Performance" → Track calories, all macros, weight
- If "Health + Learn" → Show research feed, track important nutrients, education prominent
- If "Simple + Health" → Simple UI but with key health nutrients
- App intelligently merges features from selected profiles

#### UI Theme System

**Three UI Themes:**

**Minimalist:**
- Large, clean typography
- Lots of whitespace
- Simple circular progress indicators
- Hide optional info by default
- Tap to expand details
- Focus on essential metrics only
- Calm, uncluttered interface

**Standard (Default):**
- Balanced information density
- Cards and sections
- Most common metrics visible
- Good for majority of users
- Progressive disclosure (advanced features available but not prominent)

**Maximalist/Power User:**
- Dense information display
- Tables and detailed breakdowns
- All tracked metrics visible simultaneously
- Advanced features prominent
- Minimal whitespace
- For nutrition enthusiasts and data-driven users

**Theme affects:**
- Dashboard layout and density
- Daily log detail level
- Analytics depth
- Navigation structure
- Font sizes and spacing

**Switching themes:**
- Available in Settings → Display
- Changes apply immediately
- Can preview each theme before applying

#### Tracking Preferences Customization

**Accessible in Settings → Tracking Preferences**

**Macro Tracking:**
- Toggle tracking for each macro:
  - Calories (always on)
  - Protein
  - Carbohydrates
  - Fat
  - Fiber
  - Sugar
  - Cholesterol
  - Sodium
  - Saturated Fat

**Micronutrient Tracking:**
- **Vitamins:** A, C, D, E, K, B-complex
- **Minerals:** Calcium, Iron, Magnesium, Potassium, Zinc, etc.
- Toggle individual nutrients or use preset groups:
  - "Essential vitamins" (A, C, D)
  - "B-complex vitamins"
  - "Essential minerals" (calcium, iron, magnesium)
  - "Electrolytes" (sodium, potassium)

**Body Metrics:**
- Weight tracking (on/off)
- Body fat percentage (on/off)
- Other measurements (on/off)
- Progress photos (on/off)

**Feature Visibility:**
- Research feed (show/hide)
- Recipes feature (show/hide)
- Meals feature (show/hide)
- Meal planning (show/hide, future feature)

**Dashboard Customization:**
- Choose which widgets appear on home screen
- Reorder widgets (drag and drop)
- Widget options:
  - Today's calorie progress
  - Macro breakdown
  - Weight trend
  - Streak counter
  - Quick actions
  - Recent foods
  - Research highlights
  - Recipe of the day

**Preset Focus Modes:**
- Quick presets for common scenarios
- "Cutting" → Calories, protein, weight
- "Bulking" → Calories, all macros, weight
- "Maintenance" → Balanced view
- "Health Focus" → Key nutrients, wellness
- "Custom" → Manually configure everything

**Why "Diet Your Way" Matters:**
- Reduces overwhelm for beginners
- Focuses users on what they actually care about
- Respects that not everyone wants to track everything
- Makes app feel personalized
- Prevents feature bloat feeling
- Users can always enable more later

#### Review Screen After Quiz

After onboarding quiz, before finalizing setup:

**"Your LibreFood Setup"**
- Shows what user will be tracking based on quiz
- UI theme selected
- Dashboard preview
- "You can change any of this anytime in Settings"
- Confirm or customize further

**"What's New in Nutrition" Feed:**
- PubMed API integration
- Filter: recent (last 3 months), meta-analyses, systematic reviews
- Search terms: nutrition, diet, micronutrients, etc.
- Article cards showing:
  - Title
  - Authors
  - Journal
  - Publication date
  - Abstract preview
  - Link to full paper
- Refresh feed button
- Bookmark articles (local)
- Weekly update notification

**Basic Nutrition Principles (Static Content):**
- Macronutrients 101
  - Carbohydrates (types, function, sources)
  - Proteins (function, requirements, sources)
  - Fats (types, function, sources)
  - Fiber (importance, sources)
- Micronutrients Overview
  - Vitamins (fat-soluble vs water-soluble)
  - Minerals (macro vs trace)
- How Digestion Works
- Reading Nutrition Labels
- Common Myths Debunked
- Understanding TDEE & BMR
- Sustainable weight management

**Nutrient Explainers (contextual):**
- Tap any nutrient in daily log
- Modal/drawer opens with:
  - What it does
  - Why it matters
  - Food sources
  - Daily recommendations (RDI)
  - Deficiency symptoms
  - Link to research

### 8. Education Hub

**Implementation:**
- Expo Barcode Scanner
- Query Open Food Facts API by barcode
- Display product info from OFF
- Map OFF data to our schema
- Allow user to edit before saving
- Cache scanned items locally
- Fallback: "Not found? Add manually"

### 9. Barcode Scanning

**Research Phase:**
- Evaluate existing solutions:
  - **LogMeal API** - food recognition + nutrition estimation
  - **Clarifai Food Model** - food recognition (then lookup in our DB)
  - **Nutritionix Track API** - food recognition + nutrition
  - **TensorFlow Lite** - on-device model (Food-101 dataset)
- Decision criteria: accuracy, cost, privacy, offline capability

**Implementation Options:**

**Option A: Cloud API (Recommended for MVP)**
- Pros: Higher accuracy, no model size in app, easier to update
- Cons: Requires internet, potential costs, privacy considerations
- Suggested: LogMeal API (free tier: 100 requests/month)

**Option B: On-Device ML**
- Pros: Works offline, no ongoing costs, privacy-first
- Cons: Larger app size, lower accuracy, harder to update
- Implementation: TensorFlow Lite with Food-101 or custom-trained model

**Option C: Hybrid (Future)**
- Use cloud when available, fall back to on-device
- Best of both worlds

**User Flow:**
1. User takes photo of meal
2. CV model identifies food items
3. App estimates calories and macros
4. User reviews and adjusts estimates
5. Confirms and logs to daily diary
6. Photo saved with meal log (optional)

**Features:**
- Multi-food detection (plate with multiple items)
- Portion size estimation (visual cues)
- Confidence score display
- Manual adjustment encouraged
- Educational note: "CV estimates are approximate"

**Privacy:**
- Photos processed locally when possible
- If cloud: explicit user consent, photos not stored on server
- All photos stored locally only
- Option to delete photos after processing

**Testing:**
- Accuracy validation against known foods
- Edge cases: unusual angles, lighting, plating
- Performance testing (processing time)
- Privacy audit (no data leakage)

### 10. Computer Vision Calorie Estimation

**Implementation:**
- Expo Barcode Scanner
- Query Open Food Facts API by barcode
- Display product info from OFF
- Map OFF data to our schema
- Allow user to edit before saving
- Cache scanned items locally
- Fallback: "Not found? Add manually"

### 9. Data Export & Portability

### 11. Data Export & Portability

**Export Options:**
- Export all data (comprehensive JSON)
- Export food log (CSV)
- Export weight tracking (CSV)
- Export body metrics (CSV)
- Export custom foods (JSON)
- **NEW: Export custom meals** (JSON)
- **NEW: Export custom recipes** (JSON with all details)
- Export date range (selectable)

**Export Format:**
- Standard, documented format
- Include schema version
- Human-readable JSON/CSV
- Can be imported to spreadsheet software
- **NEW: Recipe export** includes ingredients and instructions

**Future:** Import capability for migrating data

---

## Development Milestones

### Phase 1: Foundation (Weeks 1-3)
**Week 1:**
- Project setup (Expo init)
- Database schema implementation
- User table and profile creation
- Onboarding flow UI

**Week 2:**
- TDEE calculator implementation (all formulas)
- Goal setting logic
- Profile settings screen
- Metric/imperial unit conversion

**Week 3:**
- Local storage integration
- Data persistence
- Settings management
- Basic navigation structure

### Phase 2: Food Tracking (Weeks 4-5)
**Week 4:**
- USDA database integration (download and embed)
- Food search functionality
- Food details display
- Serving size calculations

**Week 5:**
- Food logging implementation
- Daily log view
- Macro calculation and display
- Edit/delete log entries

### Phase 3: Body Metrics (Week 6)
- Weight tracking UI and logic
- Body fat % calculators (Navy, Skinfold)
- BMI calculation
- Progress photo capture and storage
- Metrics graphs (weight, BF%)

### Phase 4: Analytics (Week 7)
- Dashboard home screen
- Detailed analytics views
- All chart types (line, bar, circular progress)
- Date range filtering
- Summary statistics calculations

### Phase 5: Education Hub (Week 8)
- PubMed API integration
- Research feed UI
- Static education content pages
- Nutrient explainer modals
- Bookmark functionality

### Phase 6: Advanced Features (Week 9)
- Barcode scanning (Expo + Open Food Facts)
- Custom food creation
- Custom food management

### Phase 6.5: Computer Vision Calorie Estimation (Week 9.5)
- Research and select CV approach (API vs on-device)
- Implement photo capture for food
- Food recognition integration
- Calorie estimation from images
- User adjustment interface
- Accuracy validation and edge case testing
- Privacy-preserving implementation

### Phase 7: Polish & Launch Prep (Week 10)
- Data export functionality
- Onboarding improvements
- UI polish and animations
- Performance optimization
- Bug fixes
- App store assets (screenshots, descriptions)

### Phase 8: Beta Testing (Week 11-12)
- TestFlight (iOS) and internal testing (Android)
- User feedback collection
- Bug fixes
- Final polish

### Phase 9: Launch (Week 13)
- App Store submission
- Google Play submission
- Website launch (GitHub Pages)
- Initial marketing (Reddit, Product Hunt, etc.)

---

## Screen-by-Screen Breakdown

### Navigation Structure
```
Bottom Tabs:
├── Home (Dashboard - adaptive based on preferences)
├── Log Food (Search: Foods, Meals, Recipes)
├── Progress (Body Metrics)
├── Learn (Education Hub - if enabled in preferences)
└── Profile (Settings)

Stack Navigators:
├── Onboarding Stack (first launch only)
│   ├── Welcome
│   ├── Height
│   ├── Birth Date
│   ├── Sex
│   ├── Tracking Quiz (NEW)
│   ├── Activity Level
│   ├── Goal Selection
│   ├── Formula
│   ├── Weight
│   ├── Goal Config
│   ├── Preferences Review (NEW)
│   └── Complete
├── Food Stack (search → detail → log)
│   ├── Food Search
│   ├── Food Detail
│   ├── Barcode Scanner
│   ├── Custom Food Creator
│   └── Add to Log
├── Meals Stack (NEW)
│   ├── Meals List
│   ├── Meal Detail
│   ├── Create/Edit Meal
│   └── Log Meal
├── Recipes Stack (NEW)
│   ├── Recipes List
│   ├── Recipe Detail
│   ├── Create/Edit Recipe
│   ├── Add Ingredients
│   ├── Add Instructions
│   └── Log Recipe
├── Analytics Stack (graphs, details)
└── Settings Stack (profile editing, preferences)
    ├── Profile
    ├── Goals
    ├── Tracking Preferences (NEW)
    ├── UI Theme (NEW)
    ├── Display Settings
    └── Data Management
```

### Key Screens

#### 1. Home/Dashboard
- Header: Date selector, notification icon
- **Adaptive layout based on tracking preferences and UI theme**
- **Minimalist:** Large calorie circle, weight quick entry, done
- **Standard:** Calorie progress, macro breakdown (3 circles), quick actions
- **Maximalist:** Calorie, macros, tracked micros, graphs, recent foods, streak
- Quick actions: "Log Food", "Log Meal", "Log Recipe", "Log Weight"
- Bottom tab navigation

#### 2. Log Food
- Search bar (prominent)
- **NEW: Tabs:** Foods | Meals | Recipes
- Barcode scan button
- Filter tabs per section:
  - **Foods:** All, Recent, Favorites, USDA, Branded, Custom
  - **Meals:** All, Recent, Favorites
  - **Recipes:** All, Recent, Favorites, By Category
- Search results list
- Tap item → Detail sheet
- Bottom: "Create Custom Food/Meal/Recipe" (context-aware)

#### 3. Food/Meal/Recipe Detail Modal
- Name, brand (if applicable)
- Thumbnail photo (if recipe)
- Serving size selector (dropdown + manual)
- **For recipes:** "View Recipe" button (opens full recipe view)
- Nutrition facts table (adaptive to tracking preferences)
- Meal type selector
- Time picker
- Notes field
- "Add to Log" button

#### 4. Recipe Detail View (Full Screen)
- Hero photo (if added)
- Recipe name and description
- Tags, category, difficulty
- Servings yield and timing
- **Tabs:**
  - Overview (summary)
  - Ingredients (list)
  - Instructions (step-by-step or text)
  - Nutrition (per serving and total)
  - Notes
- Action bar:
  - Log servings
  - Edit
  - Favorite
  - Share
  - Delete

#### 5. Create/Edit Recipe
- **Sections:**
  - Basic Info (name, description, category, servings, difficulty, tags)
  - Timing (prep, cook)
  - Ingredients (add/remove/reorder)
  - Instructions (text or step-by-step)
  - Photo (camera or gallery)
  - Notes
- Save button
- **Live nutrition preview** as ingredients are added

#### 6. Daily Log
- Date navigation (< Today >)
- Meal sections (Breakfast, Lunch, Dinner, Snacks)
- Foods/meals/recipes listed with serving + macros
- Running totals at top (adaptive based on tracking preferences)
- Tap item to edit/delete
- "Add note for today"
- **Micronutrients section** (only if user tracks any micros)
  - Shows only nutrients user is tracking
  - Expandable for details

#### 7. Custom Meals List
- List/grid view toggle
- Search bar
- Filter: All, Favorites, Recent
- Meal cards showing:
  - Name
  - Description
  - Quick nutrition summary
  - Component count ("5 items")
- Tap to view details or quick-log
- FAB: "Create Meal"

#### 8. Custom Recipes List
- List/grid/card view toggle
- Search bar
- Filters:
  - Category (breakfast, lunch, dinner, etc.)
  - Tags (quick, vegetarian, high-protein, etc.)
  - Favorites
  - Recently cooked
- Sort:
  - Name (A-Z)
  - Date created
  - Times cooked
  - Prep time
- Recipe cards showing:
  - Photo (if added)
  - Name
  - Category and tags
  - Servings and timing
  - Quick nutrition summary
  - Times cooked
- Tap to view full recipe
- FAB: "Create Recipe"

#### 9. Progress (Body Metrics)
- Header tabs: Weight, Body Fat %, Photos
- Current value (large)
- Quick entry input
- Trend graph (interactive, adapts to UI theme)
- Time range selector (7d, 30d, 90d, all)
- Goal progress indicator
- History list (tap to edit)

#### 10. Analytics
- Summary cards (adaptive based on what user tracks):
  - Average calories
  - Average macros (only tracked ones)
  - Average micros (only tracked ones)
  - Weight change
  - Logging consistency
- Graph section (scrollable):
  - Weight trend
  - Calorie intake
  - Macro distribution
  - **Micronutrient trends** (only for tracked nutrients)
- Date range selector
- Export data button
- **Display density adapts to UI theme**

#### 11. Learn (Education Hub)
- **Only visible if user enabled in tracking preferences**
- Top tabs: What's New, Basics
- **What's New:**
  - Article cards (scrollable feed)
  - Refresh button
  - Filter options
  - Bookmarks view
- **Basics:**
  - Topic list (expandable)
  - Macros 101
  - Micros 101
  - Digestion
  - Myths
  - etc.

#### 12. Profile/Settings
- User info summary
- Edit Profile
- Goals & Preferences
  - Change goal
  - Adjust TDEE formula
  - Activity level
- **NEW: Tracking Preferences**
  - What nutrients to track
  - Focus mode presets
  - Dashboard customization
  - Feature visibility
- **NEW: Display Settings**
  - UI Theme (minimalist/standard/maximalist)
  - Units (metric/imperial)
  - Theme (light/dark/auto)
- Data Management
  - Export data
  - Clear cache
- About
  - Version
  - Open source info
  - Privacy policy
  - Contact/feedback

#### 13. Onboarding Quiz Screen (NEW)
- Header: "What brings you to LibreFood?"
- Subtitle: "We'll customize your experience based on your goals"
- **Option cards** (can select multiple):
  - 🎯 Weight Management
  - 💪 Athletic Performance
  - ❤️ General Health
  - 🔬 Specific Health Condition (expands to sub-options)
  - 🧠 Learn About Nutrition
  - 📊 Track Everything
  - ✨ Keep It Simple
- Each card shows:
  - Icon
  - Title
  - Brief description (2-3 words)
- Multi-select UI (checkboxes or toggle cards)
- Continue button (enabled after at least one selection)

#### 14. Preferences Review Screen (NEW)
- Header: "Your LibreFood Setup"
- Subtitle: "Based on your goals, here's what we've set up"
- **Sections:**
  - "You'll be tracking:" (list of nutrients/metrics)
  - "Your dashboard will show:" (preview widgets)
  - "Your experience:" (UI theme selected)
- Visual preview of dashboard
- "Looks good!" button
- "Customize" button (goes to detailed preferences)
- Note: "You can change any of this anytime in Settings"

---

## API Integration Details

### USDA FoodData Central

**Initial Setup:**
1. Download full dataset (CSV/JSON) from https://fdc.nal.usda.gov/download-datasets/
2. Parse and import into local SQLite database
3. Ship database with app (embedded)

**Update Strategy:**
- Quarterly app updates with refreshed database
- Optional: background download of database updates

**API Fallback (for real-time):**
- Endpoint: `https://api.nal.usda.gov/fdc/v1/foods/search`
- API Key: obtained from https://api.data.gov/signup/
- Rate limit: 1000 req/hour per IP (per user device)
- Use for: new foods not in embedded DB

**Data Mapping:**
- Map FDC nutrient IDs to our schema
- Handle missing data gracefully
- Store nutrient unit conversions

### Open Food Facts

**Barcode Lookup:**
- Endpoint: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- No API key required
- Rate limit: 100 req/min per user
- Response: JSON with product data

**Data Extraction:**
- Product name: `product.product_name`
- Brand: `product.brands`
- Nutrients: `product.nutriments` (various fields)
- Serving: `product.serving_size`
- Image: `product.image_url`

**Fallback:**
- If barcode not found, offer manual entry
- Suggest user contributes to OFF

### PubMed API

**Search Endpoint:**
- Base: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`
- Search: `esearch.fcgi?db=pubmed&term=nutrition[MeSH]&retmode=json`
- Fetch details: `efetch.fcgi?db=pubmed&id={pmid}&retmode=xml`

**Search Strategy:**
- Keywords: nutrition, diet, micronutrients, vitamins, minerals
- Filters: meta-analysis, systematic review, last 3 months
- Return: 20-50 recent articles
- Cache locally for 7 days

**Display:**
- Title, authors, journal, date, abstract
- Link to PubMed Central (free full text when available)
- Link to journal (paid access)

---

## Design Guidelines

### Color Palette
- Primary: Science blue (#2196F3)
- Secondary: Evidence green (#4CAF50)
- Accent: Insight orange (#FF9800)
- Background: Clean white / Dark mode gray
- Text: High contrast for accessibility

### Typography
- Headers: Bold, clear (e.g., SF Pro / Roboto)
- Body: Readable, ~16px base
- Data: Tabular nums for nutrition facts

### UI Principles
- Clean, uncluttered
- Data-first (show the numbers)
- Accessible (WCAG AA minimum)
- Fast interactions (no loading spinners)
- Progressive disclosure (advanced features hidden until needed)

### Inspiration
- MyFitnessPal (food logging UX)
- Strong app (workout tracking simplicity)
- Apple Health (clean data viz)
- Cronometer (micronutrient detail)

---

## Privacy & Data Policy

**Data Storage:**
- 100% local storage
- No cloud sync (Phase 1)
- No user accounts required
- No analytics/tracking
- No ads

**Permissions Required:**
- Camera (for barcode scanning + progress photos)
- Photo library (for saving progress photos)
- Internet (for API calls to USDA/OFF/PubMed)

**Privacy Policy Highlights:**
- We don't collect any personal data
- All data stays on your device
- No third-party tracking
- Open source = auditable

---

## Open Source Strategy

**License:** GNU General Public License v3.0 (GPL v3) - ensures all derivatives remain open source

**Repository Structure:**
```
librefood/
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/ (API, database)
│   ├── utils/
│   ├── hooks/
│   └── types/
├── assets/
├── docs/
├── scripts/ (database import, etc.)
└── README.md
```

**Documentation:**
- README with setup instructions
- Contributing guidelines
- Code of conduct
- Architecture overview
- Database schema docs

**Community:**
- GitHub Issues for bug reports
- Discussions for feature requests
- Pull request template
- Automated testing (CI/CD)

---

## Marketing & Launch Strategy

### Website (GitHub Pages)
- librefood.github.io or custom domain (librefood.app, librefood.org)
- Hero: "Evidence-based nutrition tracking. Free forever."
- Features overview
- Screenshots
- Download buttons (App Store, Google Play, F-Droid)
- "Why LibreFood?" (comparison to paid apps)
- Open source badge
- Privacy commitment

### Launch Platforms
1. **Product Hunt** - "Free, open-source nutrition tracker with all features unlocked"
2. **Reddit** - r/nutrition, r/fitness, r/loseit, r/opensource
3. **Hacker News** - Show HN post
4. **Twitter/X** - science-based nutrition community

### Outreach (Post-Launch)
- Email science-based nutrition influencers (Gil Carvalho, etc.)
- "We built what we wished existed - mind checking it out?"
- No sponsorship ask initially - just feedback
- Once proven: ask for sponsorship or shoutout

### App Store Optimization
**Title:** LibreFood - Nutrition Tracker  
**Subtitle:** Free, science-based food tracking  
**Keywords:** nutrition, calories, macro, diet, fitness, health, weight loss, vitamins, free, open source, libre

**Description highlights:**
- All features free forever
- No ads, no subscriptions
- Track vitamins & minerals (premium in other apps)
- Evidence-based education
- Complete data ownership
- Open source & transparent

---

## Future Enhancements (Post-MVP)

**Phase 2 Features:**
- **Recipe builder** (already in MVP - full featured)
- Meal planning and prep tracking
- Integration with cooking app (LibreFood Cook for sharing)
- Grocery list generation from recipes

**Phase 3 Features:**
- Apple Health / Google Fit integration
- Wearable sync (weight from smart scales)
- Water intake tracking
- Sleep tracking correlation
- Restaurant database

**Phase 4 Features:**
- Optional cloud sync (encrypted)
- Multi-device support
- Backup/restore
- Social features (optional, privacy-first)
- Recipe sharing community

**Integration with LibreFood Cook:**
- Shared ingredient database
- Recipe import/export between apps
- Community recipe sharing
- User ratings and reviews
- Recipe collections and meal plans

**Integration with LibreFood Store:**
- Pantry inventory
- Expiration tracking
- "What can I make with what I have?"
- Auto-suggest meals based on inventory
- Shopping list integration

---

## Success Metrics

**MVP Goals (First 3 months):**
- 1,000 active users
- 4.0+ star rating on app stores
- 50+ GitHub stars
- Community funding for year 2 ($99 secured)

**Long-term Goals (Year 1):**
- 10,000+ active users
- Featured in app stores
- Partnerships with nutrition influencers
- Foundation for cooking app integration

**Community Goals:**
- 10+ contributors on GitHub
- Active Discord/Slack community
- User-submitted features/bugs
- Translations to 3+ languages

---

## Risk Mitigation

**Technical Risks:**
- Database size too large → solution: incremental loading, only essential nutrients
- Performance issues → solution: optimize queries, indexes, lazy loading
- API rate limits → solution: embedded data, caching, user IP isolation

**Adoption Risks:**
- Low discoverability → solution: ASO, community marketing, influencer partnerships
- Switching costs from other apps → solution: import feature, migration guide
- Feature parity with paid apps → solution: highlight what we have that they don't

**Sustainability Risks:**
- $99/year Apple fee → solution: community funding, personal commitment year 1
- Maintenance burden → solution: open source contributions, clear architecture
- Scope creep → solution: ruthless MVP prioritization, phased rollout

---

## Next Steps

1. **Review & Approve Spec** (you're here!)
2. **Set up GitHub repo** with project structure
3. **Initialize Expo project** with TypeScript
4. **Download & process USDA database** (create import scripts)
5. **Begin Phase 1 development** (Claude Code takes over)
6. **Weekly progress reviews** (you coach, Claude builds)
7. **Beta testing** (weeks 11-12)
8. **Launch!** (week 13)

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2025  
**Status:** Draft for Review
