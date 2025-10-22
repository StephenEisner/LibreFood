# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LibreFood** is a free, open-source, evidence-based nutrition tracking mobile app built with React Native and Expo. The app prioritizes user privacy (local-first data storage), scientific accuracy, and customizable tracking options.

**Core Philosophy:**
- Free forever - no premium tiers
- Privacy-first - all data stored locally
- Science-based - no fad diets
- Customizable - users track only what matters to them
- Educational - help users understand nutrition, not just track it

## Tech Stack

- **Framework:** React Native with Expo (managed workflow)
- **Language:** TypeScript (strict mode)
- **State Management:** Zustand or Context API
- **Navigation:** React Navigation (bottom tabs + stack navigators)
- **Database:** Expo SQLite (embedded USDA database + user data)
- **Data Sources:** USDA FoodData Central, Open Food Facts, PubMed API
- **UI Components:** React Native Paper or NativeBase (to be decided)
- **Testing:** Jest + React Native Testing Library

## Project Structure

```
librefood/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── ui/          # Base components (Button, Input, Card, etc.)
│   ├── screens/         # Screen components
│   │   ├── onboarding/  # Onboarding flow screens
│   │   ├── home/        # Dashboard
│   │   ├── food/        # Food logging
│   │   ├── progress/    # Body metrics
│   │   ├── learn/       # Education hub
│   │   └── profile/     # Settings
│   ├── navigation/      # Navigation configuration
│   ├── services/        # Business logic
│   │   ├── database/    # SQLite operations
│   │   │   ├── init.ts          # Database initialization
│   │   │   ├── migrations.ts    # Schema migrations
│   │   │   ├── users.ts         # User CRUD
│   │   │   ├── metrics.ts       # Body metrics
│   │   │   ├── foods.ts         # Food operations
│   │   │   ├── meals.ts         # Custom meals
│   │   │   └── recipes.ts       # Custom recipes
│   │   └── calculations/
│   │       ├── tdee.ts          # TDEE formulas
│   │       ├── calories.ts      # Calorie targets
│   │       └── macros.ts        # Macro recommendations
│   ├── stores/          # State management (Zustand)
│   ├── utils/           # Helper functions
│   │   └── conversions.ts       # Unit conversions
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
│       ├── user.ts
│       ├── goals.ts
│       ├── foods.ts
│       ├── meals.ts
│       ├── recipes.ts
│       ├── preferences.ts
│       └── calculations.ts
├── assets/              # Images, fonts, icons
├── docs/                # Documentation
│   ├── SPEC.md         # Product specification
│   ├── DATABASE_SCHEMA.md
│   └── DEVELOPMENT.md
├── scripts/             # Database import scripts
└── __tests__/           # Test files
```

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Clear cache and restart
npx expo start --clear

# TypeScript type checking
npm run tsc --noEmit

# Linting
npm run lint

# Format code
npm run format
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.test.ts
```

### Database
```bash
# Import USDA database (when script is created)
npm run db:import

# Reset local database (development)
npm run db:reset
```

### Build
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all
```

## Architecture & Key Concepts

### Database Architecture

The app uses Expo SQLite with a comprehensive schema:

**Core Tables:**
- `users` - User profile and settings (single user per device)
- `body_metrics` - Weight, body fat %, BMI tracking
- `progress_photos` - Progress photo metadata
- `user_tracking_preferences` - Customizable tracking settings (what nutrients to track, UI theme, dashboard layout)

**Food Data:**
- `foods` - Embedded USDA FoodData Central database (read-only)
- `custom_foods` - User-created foods
- `custom_meals` - Saved combinations of foods (no cooking)
- `custom_meal_items` - Foods/recipes in a custom meal
- `custom_recipes` - Full recipes with ingredients and instructions
- `custom_recipe_ingredients` - Recipe ingredients
- `custom_recipe_steps` - Step-by-step recipe instructions
- `recipe_nutrition` - Pre-calculated recipe nutrition cache
- `food_log` - Daily food/meal/recipe logging

**Education:**
- `research_articles` - Cached PubMed articles

**Key Design Decisions:**
- Single user per device (no multi-user support in MVP)
- All foreign keys use proper constraints with cascade deletes
- Full-text search index on food descriptions
- Nutrition cache for recipes (performance optimization)
- Date fields stored as ISO text for portability

### TDEE & Calorie Calculations

Three supported formulas for calculating BMR (Basal Metabolic Rate):

1. **Mifflin-St Jeor (default/recommended):**
   - Men: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
   - Women: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

2. **Harris-Benedict:**
   - Men: 88.362 + (13.397 × weight_kg) + (4.799 × height_cm) - (5.677 × age)
   - Women: 447.593 + (9.247 × weight_kg) + (3.098 × height_cm) - (4.330 × age)

3. **Katch-McArdle (requires body fat %):**
   - 370 + (21.6 × lean_body_mass_kg)

**Activity Multipliers:**
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Active: 1.725
- Very Active: 1.9

**Calorie Targets:**
- 1 kg body weight = 7700 calories
- Weight loss: TDEE - (goal_rate_kg_per_week × 7700 / 7)
- Weight gain: TDEE + (goal_rate_kg_per_week × 7700 / 7)
- Safe minimums: 1200 cal/day (women), 1500 cal/day (men)

**Macro Recommendations:**
- Protein: 1.6-2.2g/kg (higher when cutting)
- Fat: 0.8-1.0g/kg
- Carbs: Remaining calories (calories - protein×4 - fat×9) / 4

### Customizable Tracking System ("Diet Your Way")

LibreFood adapts to user goals through an onboarding quiz that generates a personalized tracking configuration:

**Quiz Options (multi-select):**
- Weight Management → Track calories, protein, weight (minimalist view)
- Athletic Performance → Track all macros, meal timing
- General Health → Track balanced macros + key micronutrients (Vit D, iron, calcium, fiber)
- Specific Health Condition → Custom nutrient focus (e.g., diabetes → carbs/sugar/fiber)
- Learn About Nutrition → Track everything, maximalist UI, research feed
- Track Everything → All nutrients, dense UI
- Keep It Simple → Calories + protein only, minimalist UI

**UI Themes:**
- **Minimalist:** Large typography, whitespace, essential metrics only
- **Standard:** Balanced information density (default)
- **Maximalist:** Dense data display, all metrics visible, tables

**Tracking Preferences Control:**
- Which macros to track (calories always on)
- Which micronutrients to show (vitamins, minerals)
- Dashboard widget selection and ordering
- Feature visibility (recipes, meals, research feed)

### Navigation Structure

```
App
├── OnboardingStack (first launch)
│   ├── Welcome
│   ├── Height
│   ├── BirthDate
│   ├── Sex
│   ├── TrackingQuiz (NEW - multi-select purpose)
│   ├── ActivityLevel
│   ├── GoalSelection
│   ├── Formula
│   ├── Weight
│   ├── GoalConfig
│   ├── PreferencesReview (NEW - show generated config)
│   └── Complete
└── MainApp
    ├── BottomTabs
    │   ├── Home (Dashboard)
    │   ├── LogFood (with tabs: Foods | Meals | Recipes)
    │   ├── Progress (Body Metrics)
    │   ├── Learn (Education Hub - conditional)
    │   └── Profile (Settings)
    └── Stacks
        ├── FoodStack (search → detail → log)
        ├── MealsStack (list → detail → create/edit → log)
        ├── RecipesStack (list → detail → create/edit → log)
        └── SettingsStack
```

### Custom Meals vs. Custom Recipes

**Custom Meals:**
- Saved combinations of foods eaten together
- No cooking involved
- Example: "Morning Coffee Routine" (coffee + cream + toast)
- Quick-log entire combination
- Nutrition auto-calculated from components

**Custom Recipes:**
- Full recipes with ingredients and step-by-step instructions
- Includes prep/cook times, servings, photos, tags
- Nutrition calculated per serving
- Can scale servings (ingredients auto-adjust)
- Track "times cooked" counter
- Support for both text and structured step-by-step instructions

**Key Distinction:** Meals are for foods consumed together; recipes are for cooked dishes with instructions.

## Development Guidelines

### TypeScript Usage
- Use strict mode (no `any`, use `unknown` for truly unknown types)
- Define types in `/src/types/` by domain
- Use interfaces for objects, type aliases for unions/primitives
- Export types alongside implementations

### Testing Requirements
- Write tests BEFORE implementation (TDD preferred)
- Coverage targets: >80% overall, >90% for calculations
- Test file naming: `*.test.ts` or `*.test.tsx`
- Use React Native Testing Library for components
- Mock database calls in unit tests
- Integration tests for complete flows (e.g., onboarding)

### Component Patterns
- Functional components with hooks (no class components)
- Co-locate styles with components
- Extract reusable logic into custom hooks
- Keep components small and focused (<200 lines)
- Use composition over prop drilling

### Database Guidelines
- Always use transactions for multi-step operations
- Validate data before database operations
- Handle null/undefined from queries gracefully
- Use prepared statements (parameterized queries) to prevent SQL injection
- Index frequently queried fields (user_id, date)
- Never expose raw SQL to UI components (use service layer)

### State Management
- Local component state for UI-only state
- Zustand stores for cross-component state
- Database for persistent data
- Onboarding flow uses temporary Zustand store (cleared after completion)

### Error Handling
- Throw descriptive errors in calculation functions
- Catch and display user-friendly errors in UI
- Log errors for debugging (use console.error)
- Validate inputs at boundaries (UI, API, database)

### API Usage
- USDA FoodData Central: Embedded database + API fallback
- Open Food Facts: Barcode scanning (100 req/min limit)
- PubMed: Research articles (cache for 7 days)
- Always handle API failures gracefully (show cached data or error message)

### Unit Conversion
- Store all data in metric (kg, cm) in database
- Convert to imperial only for display
- Use utility functions in `utils/conversions.ts`
- Test round-trip conversions

### Performance Considerations
- Use FlatList for long lists (food search results)
- Implement pagination for food search (LIMIT/OFFSET)
- Cache recipe nutrition calculations
- Use indexes on frequently queried fields
- Lazy load components when appropriate

## Development Phases

The project is being built in phases. See `SPEC.md` and `TODO.md` for detailed breakdowns.

**Current Phase:** Phase 1 - Foundation (Weeks 1-3)
- Project setup, database schema, onboarding flow

**Key Milestones:**
- Phase 1: Foundation (Weeks 1-3)
- Phase 2: Food Tracking & Custom Foods (Weeks 4-5)
- Phase 2.5: Custom Meals & Recipes (Weeks 5.5-6.5)
- Phase 3: Body Metrics (Week 7)
- Phase 4: Analytics (Week 8)
- Phase 5: Education Hub (Week 9)
- Phase 6: Advanced Features (Week 10) - Barcode scanning, UI themes
- Phase 6.5: Computer Vision (Week 10.5) - Food recognition from photos
- Phase 7: Polish & Launch Prep (Week 11)
- Phase 8: Beta Testing (Weeks 12-13)
- Phase 9: Launch (Week 14)

## Important Constraints

### Privacy Requirements
- **ALL data stored locally** - no cloud sync in MVP
- No user accounts required
- No analytics/tracking
- No ads
- Camera permission only for barcode scanning and progress photos
- API calls limited to: USDA (food data), Open Food Facts (barcodes), PubMed (research)

### Legal/Licensing
- License: GPL v3 (all derivatives must remain open source)
- No proprietary dependencies
- App store distribution: iOS App Store, Google Play, F-Droid

### Data Integrity
- Single user per device (no multi-user in MVP)
- Export all data to JSON/CSV for portability
- Never lose user data (careful with migrations)
- Validate all inputs (especially nutrition data from external sources)

## External Data Sources

### USDA FoodData Central
- Download full dataset: https://fdc.nal.usda.gov/download-datasets/
- API (fallback): https://api.nal.usda.gov/fdc/v1/foods/search
- Update embedded database quarterly
- Map FDC nutrient IDs to our schema

### Open Food Facts
- Barcode lookup: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- No API key required
- Rate limit: 100 req/min

### PubMed API
- Base: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`
- Search recent nutrition research (meta-analyses, systematic reviews)
- Cache articles locally for 7 days

## Code Quality Standards

- **Linting:** ESLint with React Native rules (no warnings in production)
- **Formatting:** Prettier (run before commits)
- **Type Safety:** No TypeScript errors (`tsc --noEmit` must pass)
- **Testing:** All tests passing before merge
- **Documentation:** JSDoc comments on all public functions
- **Accessibility:** WCAG AA compliance (minimum)
- **Performance:** No lag on interactions, test on low-end devices

## When Starting New Work

1. **Understand the context:** Read `SPEC.md` for feature details, `TODO.md` for current phase tasks
2. **Check the database schema:** See `docs/DATABASE_SCHEMA.md` (once created)
3. **Write types first:** Define TypeScript interfaces in `/src/types/`
4. **Write tests first:** TDD approach for calculations and business logic
5. **Implement incrementally:** Small, testable units
6. **Test on both platforms:** iOS and Android
7. **Update documentation:** If architecture changes, update this file

## Useful Context

- **Target users:** Health-conscious individuals, athletes, people managing weight, nutrition learners
- **Key differentiator:** All features free forever (competitors charge for micronutrient tracking, recipes, etc.)
- **Scientific rigor:** Evidence-based recommendations, no fad diets, PubMed integration
- **User empowerment:** Complete data ownership, customizable tracking, educational focus

## References

- **Product Spec:** `SPEC.md` - Complete feature specifications and requirements
- **Development TODO:** `TODO.md` - Phase 1 detailed task breakdown
- **USDA Food Data:** https://fdc.nal.usda.gov/
- **Open Food Facts:** https://world.openfoodfacts.org/
- **React Native:** https://reactnative.dev/
- **Expo:** https://docs.expo.dev/

---

**Note for Claude Code:** This project is in the planning/setup phase. When implementing features, always refer to `SPEC.md` for detailed requirements and `TODO.md` for the current phase tasks. Prioritize test coverage and type safety.
