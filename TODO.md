# Phase 1: Foundation - Detailed TODO
**Duration:** Weeks 1-3  
**Goal:** Set up project infrastructure, implement user profile system, and create onboarding flow

---

## Week 1: Project Setup & Database Schema

### Project Initialization
- [ ] Create GitHub repository
  - [ ] Initialize with README.md
  - [ ] Add LICENSE (GPL v3)
  - [ ] Add .gitignore for React Native
  - [ ] Create initial project structure
- [ ] Initialize Expo project with TypeScript
  - [ ] Run `npx create-expo-app librefood --template`
  - [ ] Select TypeScript template
  - [ ] Verify project runs on iOS simulator/Android emulator
- [ ] Configure development environment
  - [ ] Set up `tsconfig.json` with strict mode
  - [ ] Configure ESLint with React Native rules
  - [ ] Set up Prettier for code formatting
  - [ ] Add pre-commit hooks (husky + lint-staged)
  - [ ] Configure path aliases (@components, @services, @screens, etc.)
- [ ] Install core dependencies
  - [ ] `expo-sqlite` for database
  - [ ] `@react-navigation/native` + dependencies
  - [ ] `@react-navigation/bottom-tabs`
  - [ ] `@react-navigation/native-stack`
  - [ ] `zustand` for state management
  - [ ] `date-fns` for date utilities
- [ ] Install dev dependencies
  - [ ] Jest (should be included with Expo)
  - [ ] `@testing-library/react-native`
  - [ ] `@testing-library/jest-native`
  - [ ] `@types/jest`

### Testing Infrastructure
- [ ] Create test utilities directory
  - [ ] `src/__tests__/utils/test-utils.tsx` (custom render, providers)
  - [ ] `src/__tests__/setup.ts` (global test setup)
- [ ] Configure Jest
  - [ ] Update `jest.config.js` with coverage thresholds
  - [ ] Set up test coverage reporting
  - [ ] Add test scripts to `package.json`
- [ ] Write example test
  - [ ] Create `src/__tests__/example.test.ts`
  - [ ] Verify tests run with `npm test`
  - [ ] Verify coverage report generates

### Database Schema Implementation
- [ ] Create database initialization module
  - [ ] `src/services/database/init.ts`
  - [ ] Create `initDatabase()` function
  - [ ] Handle database upgrades/migrations
  - [ ] Write tests for database initialization
- [ ] Implement Users table
  - [ ] Create table with all fields from spec
  - [ ] Add indexes for performance
  - [ ] Write SQL creation script
  - [ ] Test: table creates successfully
  - [ ] Test: constraints work (NOT NULL, defaults)
- [ ] Implement Body Metrics table
  - [ ] Create table with foreign key to users
  - [ ] Add indexes on user_id and date
  - [ ] Write SQL creation script
  - [ ] Test: table creates with proper relationships
  - [ ] Test: cascading deletes (if user deleted)
- [ ] Implement Progress Photos table
  - [ ] Create table structure
  - [ ] Add indexes
  - [ ] Test: photo metadata storage
- [ ] Implement Foods table structure (for USDA data)
  - [ ] Create table with all nutrient fields
  - [ ] Add full-text search index on description
  - [ ] Add index on fdc_id
  - [ ] Test: table handles large datasets
- [ ] Implement Custom Foods table
  - [ ] Create table structure with all nutrient fields
  - [ ] Link to users table
  - [ ] Test: user isolation (users can't see each other's foods)
- [ ] Implement Custom Meals tables
  - [ ] Create custom_meals table
  - [ ] Create custom_meal_items table
  - [ ] Add proper foreign keys and indexes
  - [ ] Test: meals link to foods, custom foods, and recipes
  - [ ] Test: cascading deletes
- [ ] Implement Custom Recipes tables
  - [ ] Create custom_recipes table
  - [ ] Create custom_recipe_ingredients table
  - [ ] Create custom_recipe_steps table (optional structured instructions)
  - [ ] Create recipe_nutrition cache table
  - [ ] Add proper foreign keys and indexes
  - [ ] Test: all relationships work
  - [ ] Test: cascading deletes
- [ ] Implement Food Log table
  - [ ] Create table structure
  - [ ] Support logging foods, custom foods, meals, and recipes
  - [ ] Add indexes on user_id and date
  - [ ] Test: proper foreign key relationships
- [ ] Implement User Tracking Preferences table
  - [ ] Create table with all preference fields
  - [ ] Link to users table
  - [ ] Set appropriate defaults based on quiz profile
  - [ ] Test: preferences save and load correctly
- [ ] Create migration system
  - [ ] `src/services/database/migrations.ts`
  - [ ] Track schema version
  - [ ] Handle upgrades gracefully
  - [ ] Test: migration from v1 to v2 works

### User Profile Data Layer
- [ ] Create TypeScript types
  - [ ] `src/types/user.ts` (User, UserProfile, etc.)
  - [ ] `src/types/metrics.ts` (BodyMetric, WeightEntry, etc.)
  - [ ] `src/types/goals.ts` (GoalType, ActivityLevel, etc.)
  - [ ] `src/types/foods.ts` (Food, CustomFood, etc.)
  - [ ] `src/types/meals.ts` (CustomMeal, MealItem, etc.)
  - [ ] `src/types/recipes.ts` (CustomRecipe, RecipeIngredient, RecipeStep, etc.)
  - [ ] `src/types/preferences.ts` (TrackingPreferences, UITheme, FocusMode, etc.)
- [ ] Implement User CRUD operations
  - [ ] `src/services/database/users.ts`
  - [ ] `createUser(profile: UserProfile): Promise<User>`
  - [ ] `getUser(id: number): Promise<User | null>`
  - [ ] `updateUser(id: number, updates: Partial<User>): Promise<User>`
  - [ ] `getCurrentUser(): Promise<User | null>` (get first/only user)
- [ ] Write comprehensive tests for user operations
  - [ ] Test: create user with valid data
  - [ ] Test: get user by id
  - [ ] Test: update user fields
  - [ ] Test: handle missing user (return null)
  - [ ] Test: validate data types
  - [ ] Test: age calculation from birth_date
  - [ ] Test: height unit conversions (cm <-> inches)
  - [ ] Test: weight unit conversions (kg <-> lbs)
- [ ] Implement Body Metrics operations
  - [ ] `src/services/database/metrics.ts`
  - [ ] `addWeightEntry(userId, date, weight): Promise<WeightEntry>`
  - [ ] `addBodyFatEntry(userId, date, bf): Promise<BodyFatEntry>`
  - [ ] `getMetricsForDateRange(userId, start, end): Promise<Metric[]>`
  - [ ] `getLatestWeight(userId): Promise<WeightEntry | null>`
  - [ ] Tests for all operations

### Documentation
- [ ] Create `docs/` directory
- [ ] Copy SPEC.md to docs/
- [ ] Create `docs/DATABASE_SCHEMA.md`
  - [ ] Document all tables and relationships
  - [ ] Include SQL DDL statements
  - [ ] Add ER diagram (mermaid or image)
- [ ] Create `docs/DEVELOPMENT.md`
  - [ ] Setup instructions
  - [ ] How to run tests
  - [ ] Project structure explanation
- [ ] Update main README.md
  - [ ] Project description
  - [ ] Features overview
  - [ ] Setup instructions
  - [ ] License badge

### Week 1 Acceptance Criteria
- [ ] Project runs successfully on both iOS and Android
- [ ] All tests passing (minimum 3 test files with >80% coverage)
- [ ] Database schema fully implemented and tested
- [ ] User CRUD operations work correctly
- [ ] Documentation is complete and accurate
- [ ] No TypeScript errors (`npm run tsc --noEmit` passes)
- [ ] Code passes linting (`npm run lint` passes)

---

## Week 2: TDEE Calculator & Goal Logic

### TDEE Calculation Module
- [ ] Create calculation types
  - [ ] `src/types/calculations.ts`
  - [ ] `TDEEFormula` enum
  - [ ] `ActivityLevel` enum
  - [ ] `TDEEResult` interface
  - [ ] `MacroRecommendation` interface
- [ ] Implement Mifflin-St Jeor formula
  - [ ] `src/services/calculations/tdee.ts`
  - [ ] `calculateMifflinStJeor(weight, height, age, sex): number`
  - [ ] Handle male/female differences
  - [ ] Tests: verify against known values
  - [ ] Test case: 30yo male, 80kg, 180cm = ~1800 BMR
  - [ ] Test case: 30yo female, 60kg, 165cm = ~1400 BMR
  - [ ] Test: edge case - negative values should throw error
  - [ ] Test: edge case - zero values should throw error
  - [ ] Test: edge case - extreme values (very young/old, very light/heavy)
- [ ] Implement Harris-Benedict formula
  - [ ] `calculateHarrisBenedict(weight, height, age, sex): number`
  - [ ] Tests with same test cases as Mifflin
  - [ ] Test: results differ from Mifflin (they should)
- [ ] Implement Katch-McArdle formula
  - [ ] `calculateKatchMcArdle(weight, bodyFatPercentage): number`
  - [ ] Calculate lean body mass
  - [ ] Tests: verify with known values
  - [ ] Test case: 80kg, 15% BF = 68kg LBM = ~1830 BMR
  - [ ] Test: missing body fat % should throw error
  - [ ] Test: invalid BF% (>100% or <0%) should throw error
- [ ] Implement activity multipliers
  - [ ] `applyActivityMultiplier(bmr, activityLevel): number`
  - [ ] All 5 activity levels from spec
  - [ ] Tests: verify each multiplier
  - [ ] Test: sedentary (1.2)
  - [ ] Test: light (1.375)
  - [ ] Test: moderate (1.55)
  - [ ] Test: active (1.725)
  - [ ] Test: very active (1.9)
- [ ] Create unified TDEE calculator
  - [ ] `calculateTDEE(user, formula, activityLevel): TDEEResult`
  - [ ] Switch between formulas based on user preference
  - [ ] Return object with BMR, TDEE, and formula used
  - [ ] Tests: integration tests for all formulas

### Calorie Target Calculator
- [ ] Implement maintenance calculation
  - [ ] `src/services/calculations/calories.ts`
  - [ ] `calculateMaintenanceCalories(tdee): number`
  - [ ] Test: should equal TDEE
- [ ] Implement deficit calculation (weight loss)
  - [ ] `calculateDeficitCalories(tdee, rateKgPerWeek): number`
  - [ ] Formula: 1kg fat = ~7700 calories
  - [ ] Rate options: 0.25, 0.5, 0.75, 1.0 kg/week
  - [ ] Tests: verify each rate
  - [ ] Test: 0.5 kg/week = 550 cal deficit/day
  - [ ] Test: 1.0 kg/week = 1100 cal deficit/day
  - [ ] Test: deficit doesn't go below safe minimum (1200 women, 1500 men)
- [ ] Implement surplus calculation (weight gain)
  - [ ] `calculateSurplusCalories(tdee, rateKgPerWeek): number`
  - [ ] Same rates as deficit
  - [ ] Tests: verify each rate
  - [ ] Test: 0.5 kg/week = 550 cal surplus/day
- [ ] Implement goal-based calorie target
  - [ ] `calculateCalorieTarget(user, goal): number`
  - [ ] Handle all goal types: loss, gain, maintenance, recomp, custom
  - [ ] For recomp: return maintenance calories
  - [ ] For custom: return user's custom_calorie_target
  - [ ] Tests for all goal types
  - [ ] Test: custom goal returns exact value
  - [ ] Test: recomp returns maintenance

### Macro Recommendation Engine
- [ ] Implement protein calculation
  - [ ] `src/services/calculations/macros.ts`
  - [ ] `calculateProteinTarget(weight, goal): number`
  - [ ] Cutting: 2.0-2.2g/kg
  - [ ] Bulking: 1.6-1.8g/kg
  - [ ] Maintenance: 1.6-2.0g/kg
  - [ ] Tests for each goal type
- [ ] Implement fat calculation
  - [ ] `calculateFatTarget(weight): number`
  - [ ] 0.8-1.0g/kg bodyweight
  - [ ] Tests: verify range
- [ ] Implement carb calculation
  - [ ] `calculateCarbTarget(calorieTarget, protein, fat): number`
  - [ ] Remainder after protein and fat
  - [ ] Formula: (calories - (protein×4 + fat×9)) / 4
  - [ ] Tests: verify math
- [ ] Create unified macro calculator
  - [ ] `calculateMacros(user, calorieTarget): MacroRecommendation`
  - [ ] Return object with protein, fat, carbs in grams
  - [ ] Also include percentages
  - [ ] Tests: integration tests
  - [ ] Test: total calories from macros match target (within ±10)

### Unit Conversion Utilities
- [ ] Create conversion module
  - [ ] `src/utils/conversions.ts`
  - [ ] `kgToLbs(kg): number`
  - [ ] `lbsToKg(lbs): number`
  - [ ] `cmToFeet(cm): {feet: number, inches: number}`
  - [ ] `feetToCm(feet, inches): number`
  - [ ] Tests for all conversions
  - [ ] Test: round-trip conversions (kg->lbs->kg)
  - [ ] Test: edge cases (zero, negative, large values)

### Week 2 Acceptance Criteria
- [ ] All calculation functions implemented and tested
- [ ] Test coverage >90% for calculations module
- [ ] All formulas match expected mathematical results
- [ ] Edge cases handled gracefully (errors thrown with clear messages)
- [ ] TypeScript types are strict (no `any`)
- [ ] Documentation comments on all public functions
- [ ] Manual verification: calculator outputs match online TDEE calculators

---

## Week 3: Onboarding UI & Navigation

### Navigation Setup
- [ ] Configure React Navigation
  - [ ] `src/navigation/RootNavigator.tsx`
  - [ ] Set up navigation container
  - [ ] Create navigation theme (colors, fonts)
- [ ] Create Onboarding Stack Navigator
  - [ ] `src/navigation/OnboardingNavigator.tsx`
  - [ ] Stack navigator for onboarding flow
  - [ ] Screens: Welcome, Height, BirthDate, Sex, Activity, Goal, Formula, Weight, GoalConfig, Complete
- [ ] Create Main App Navigator (stub for now)
  - [ ] `src/navigation/MainNavigator.tsx`
  - [ ] Bottom tab navigator (Home, Log, Progress, Learn, Profile)
  - [ ] Placeholder screens for each tab
- [ ] Create navigation logic
  - [ ] Check if user exists in database
  - [ ] If no user: show Onboarding
  - [ ] If user exists: show Main App
  - [ ] Test: navigation switches correctly

### Shared UI Components
- [ ] Create component library structure
  - [ ] `src/components/ui/`
- [ ] Button component
  - [ ] `src/components/ui/Button.tsx`
  - [ ] Primary, secondary, outline variants
  - [ ] Sizes: small, medium, large
  - [ ] Loading state
  - [ ] Disabled state
  - [ ] Tests: renders correctly, handles press
- [ ] Input component
  - [ ] `src/components/ui/Input.tsx`
  - [ ] Number input variant
  - [ ] Text input variant
  - [ ] Error state
  - [ ] Label and helper text
  - [ ] Tests: value changes, validation
- [ ] Picker/Dropdown component
  - [ ] `src/components/ui/Picker.tsx`
  - [ ] Single select
  - [ ] Tests: selection works
- [ ] Card component
  - [ ] `src/components/ui/Card.tsx`
  - [ ] Container for content sections
  - [ ] Tests: renders children

### Onboarding Screens

#### Welcome Screen
- [ ] `src/screens/onboarding/WelcomeScreen.tsx`
- [ ] App logo/icon
- [ ] Tagline: "Evidence-based nutrition tracking. Free forever."
- [ ] Feature highlights (bullets)
- [ ] "Get Started" button
- [ ] Tests: renders correctly, navigation works

#### Height Input Screen
- [ ] `src/screens/onboarding/HeightScreen.tsx`
- [ ] Unit toggle: Metric (cm) / Imperial (ft/in)
- [ ] Numeric input(s) for height
- [ ] Validation: height between 100-250cm (or equivalent)
- [ ] "Continue" button (disabled until valid)
- [ ] "Back" button
- [ ] Store value in temp state (not DB yet)
- [ ] Tests: unit conversion, validation, navigation

#### Birth Date Screen
- [ ] `src/screens/onboarding/BirthDateScreen.tsx`
- [ ] Date picker component
- [ ] Validation: age 13-120 years
- [ ] Show calculated age
- [ ] Continue/back buttons
- [ ] Store in temp state
- [ ] Tests: age calculation, validation

#### Sex Selection Screen
- [ ] `src/screens/onboarding/SexScreen.tsx`
- [ ] Options: Male, Female, Other
- [ ] Explanation: "Used for TDEE calculation accuracy"
- [ ] Continue/back buttons
- [ ] Tests: selection works

#### NEW: Tracking Purpose Quiz Screen
- [ ] `src/screens/onboarding/TrackingQuizScreen.tsx`
- [ ] Header: "What brings you to LibreFood?"
- [ ] Subtitle: "We'll customize your experience"
- [ ] Multi-select option cards:
  - [ ] 🎯 Weight Management
  - [ ] 💪 Athletic Performance
  - [ ] ❤️ General Health
  - [ ] 🔬 Specific Health Condition (with sub-menu)
  - [ ] 🧠 Learn About Nutrition
  - [ ] 📊 Track Everything
  - [ ] ✨ Keep It Simple
- [ ] Each card: icon, title, brief description
- [ ] Multi-select UI (checkboxes or toggle cards)
- [ ] Continue button (enabled after ≥1 selection)
- [ ] Store selections in temp state
- [ ] Tests: multi-select works, all combinations
- [ ] Tests: configuration profile generation

#### Activity Level Screen
- [ ] `src/screens/onboarding/ActivityScreen.tsx`
- [ ] 5 activity level options (radio buttons or cards)
- [ ] Each option shows:
  - Name
  - Description
  - Examples
- [ ] Continue/back buttons
- [ ] Tests: selection works

#### Goal Selection Screen
- [ ] `src/screens/onboarding/GoalScreen.tsx`
- [ ] Goal type options:
  - Lose weight
  - Gain weight
  - Maintain weight
  - Body recomposition
  - Custom calorie target
- [ ] Brief description for each
- [ ] Continue/back buttons
- [ ] Tests: all options selectable

#### TDEE Formula Screen
- [ ] `src/screens/onboarding/FormulaScreen.tsx`
- [ ] Explanation of TDEE
- [ ] Formula options:
  - Mifflin-St Jeor (Recommended)
  - Harris-Benedict
  - Katch-McArdle (if BF% provided later)
- [ ] Brief description of each
- [ ] "Most users should use Mifflin-St Jeor" note
- [ ] Continue/back buttons
- [ ] Tests: selection works

#### Current Weight Screen
- [ ] `src/screens/onboarding/WeightScreen.tsx`
- [ ] Unit toggle: kg / lbs
- [ ] Numeric input for weight
- [ ] Validation: weight between 30-300kg (or equivalent)
- [ ] Continue/back buttons
- [ ] Tests: validation, unit conversion

#### Goal Configuration Screen
- [ ] `src/screens/onboarding/GoalConfigScreen.tsx`
- [ ] Show calculated TDEE (using data so far)
- [ ] If weight loss/gain:
  - Target weight input
  - Rate selector (0.25, 0.5, 0.75, 1.0 kg/week)
  - Show estimated time to goal
- [ ] If maintenance/recomp:
  - Just show maintenance calories
- [ ] If custom:
  - Custom calorie input
- [ ] "Continue to Review" button
- [ ] Tests: calculations correct, all paths work

#### NEW: Preferences Review Screen
- [ ] `src/screens/onboarding/PreferencesReviewScreen.tsx`
- [ ] Header: "Your LibreFood Setup"
- [ ] Show based on quiz:
  - "You'll be tracking:" (list nutrients/metrics)
  - "Your dashboard:" (preview widgets)
  - "Your experience:" (UI theme)
- [ ] Visual preview of dashboard layout
- [ ] "Looks good!" button (proceed to complete)
- [ ] "Customize" button (deep link to preferences)
- [ ] Note: "Change anytime in Settings"
- [ ] Tests: preview matches configuration
- [ ] Tests: customization works

#### Completion/Summary Screen
- [ ] `src/screens/onboarding/CompleteScreen.tsx`
- [ ] "You're all set!" message
- [ ] Summary of choices:
  - Goal
  - Calorie target
  - Macro targets
  - Tracking focus
- [ ] "Start Tracking" button → Main App
- [ ] Save all data to database on this screen
- [ ] Tests: data persists, navigation to main app [ ] `src/screens/onboarding/CompleteScreen.tsx`
- [ ] "You're all set!" message
- [ ] Summary of choices:
  - Goal
  - Calorie target
  - Macro targets
- [ ] "Start Tracking" button → Main App
- [ ] Save all data to database on this screen
- [ ] Tests: data persists, navigation to main app

### State Management for Onboarding
- [ ] Create onboarding store
  - [ ] `src/stores/onboardingStore.ts` (Zustand)
  - [ ] Store temp values from each screen
  - [ ] Store quiz selections
  - [ ] Validation functions
  - [ ] Configuration profile generator (quiz → preferences)
  - [ ] Save to database function
  - [ ] Clear store function (after completion)
  - [ ] Tests: state updates correctly
  - [ ] Tests: profile generation works for all quiz combinations

### Integration Tests
- [ ] Complete onboarding flow test
  - [ ] `src/__tests__/integration/onboarding.test.tsx`
  - [ ] Navigate through all screens
  - [ ] Enter valid data
  - [ ] Verify data saves to database
  - [ ] Verify navigation to main app
- [ ] Edge case test: restart onboarding
  - [ ] User quits mid-flow
  - [ ] Re-opens app
  - [ ] Should start from beginning

### Week 3 Acceptance Criteria
- [ ] User can complete entire onboarding flow
- [ ] All data validates correctly
- [ ] Data persists to database
- [ ] Navigation works smoothly (back buttons, continue buttons)
- [ ] Unit conversions work correctly
- [ ] TDEE displays correct calculated value
- [ ] App navigates to main app after completion
- [ ] No crashes or console errors
- [ ] Tests cover all screens and flows
- [ ] UI is clean and intuitive (manual testing)

---

## Phase 1 Overall Acceptance Criteria

### Functional Requirements
- [x] User can complete onboarding from start to finish
- [x] User profile data persists correctly
- [x] TDEE calculations match expected values (verified manually)
- [x] All goal types work correctly
- [x] Unit conversions are accurate
- [x] Navigation is smooth and intuitive

### Technical Requirements
- [x] All unit tests passing
- [x] Test coverage >80% overall
- [x] Test coverage >90% for calculations
- [x] No TypeScript errors
- [x] Code passes linting
- [x] No console warnings or errors
- [x] Database schema properly normalized
- [x] All data types are strictly typed

### Documentation Requirements
- [x] README.md is comprehensive
- [x] SPEC.md is in docs folder
- [x] DATABASE_SCHEMA.md is complete
- [x] DEVELOPMENT.md has setup instructions
- [x] Code has JSDoc comments on public functions
- [x] All modules have descriptive file headers

### Quality Requirements
- [x] Performance: No lag on UI interactions
- [x] Accessibility: Basic accessibility compliance (labels, contrast)
- [x] Error handling: Graceful error messages
- [x] UX: Intuitive flow, clear instructions

---

## Next Phase Preview

**Phase 2: Food Tracking** will include:
- USDA database download and import script
- Food search functionality
- Food logging system
- Daily log view
- Macro calculations and display

**Estimated Start Date:** Week 4  
**Prerequisites:** Phase 1 complete and approved

---

## Notes for Claude Code Sessions

### Session 1: Project Setup & Database
**Focus:** Initialize project, set up testing, implement database schema  
**Time Estimate:** 2-3 hours  
**Key Deliverables:** Working project with database and tests

### Session 2: Calculations
**Focus:** TDEE, calorie targets, macro calculations  
**Time Estimate:** 2-3 hours  
**Key Deliverables:** Fully tested calculation modules

### Session 3: Onboarding UI (Part 1)
**Focus:** Navigation setup, shared components, first 4-5 screens  
**Time Estimate:** 2-3 hours  
**Key Deliverables:** Working onboarding flow (partial)

### Session 4: Onboarding UI (Part 2)
**Focus:** Remaining screens, integration, polish  
**Time Estimate:** 2-3 hours  
**Key Deliverables:** Complete onboarding flow with tests

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Approved By:** (awaiting approval)  
**Start Date:** TBD
