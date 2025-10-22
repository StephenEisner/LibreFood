# LibreFood - Product Specification Document

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
5. **No BS** - No ads, no upsells, no sponsored content

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
  -- ... (all same fields)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
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

---

## MVP Feature Specifications

### 1. User Onboarding & Profile

**Initial Setup Flow:**
1. Welcome screen (brand introduction)
2. Height input (cm or ft/in with toggle)
3. Birth date picker
4. Sex selection
5. Activity level selection with descriptions
6. Goal selection screen
7. TDEE calculation formula preference
8. Current weight entry
9. Goal configuration (target weight, rate, or custom calories)

**Profile Settings (accessible later):**
- Edit all onboarding info
- Switch between metric/imperial
- Change TDEE formula
- Adjust goals
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
- Filter by: All, Branded, Generic, Custom
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

**Daily Log View:**
- Today's foods organized by meal
- Running calorie/macro totals
- Visual progress bars (calories, protein, carbs, fat)
- Micronutrient summary (tap to expand)
- Edit/delete logged items
- Add quick note for the day

**Nutrition Summary:**
- Macros: calories, protein, carbs, fat, fiber, sugar
- Micronutrients (expandable): all vitamins and minerals from USDA
- % of daily value indicators (based on RDI/DV)
- Color coding: under/meeting/over targets

### 5. Custom Foods

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

### 7. Education Hub

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

### 8. Barcode Scanning

**Implementation:**
- Expo Barcode Scanner
- Query Open Food Facts API by barcode
- Display product info from OFF
- Map OFF data to our schema
- Allow user to edit before saving
- Cache scanned items locally
- Fallback: "Not found? Add manually"

### 8.5. Computer Vision Calorie Estimation

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

### 9. Data Export & Portability

**Implementation:**
- Expo Barcode Scanner
- Query Open Food Facts API by barcode
- Display product info from OFF
- Map OFF data to our schema
- Allow user to edit before saving
- Cache scanned items locally
- Fallback: "Not found? Add manually"

### 9. Data Export & Portability

**Export Options:**
- Export all data (comprehensive JSON)
- Export food log (CSV)
- Export weight tracking (CSV)
- Export body metrics (CSV)
- Export custom foods (JSON)
- Export date range (selectable)

**Export Format:**
- Standard, documented format
- Include schema version
- Human-readable JSON/CSV
- Can be imported to spreadsheet software

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
├── Home (Dashboard)
├── Log Food
├── Progress (Body Metrics)
├── Learn (Education Hub)
└── Profile (Settings)

Stack Navigators:
├── Onboarding Stack (first launch only)
├── Food Detail Stack (search → detail → log)
├── Analytics Stack (graphs, details)
└── Settings Stack (profile editing, preferences)
```

### Key Screens

#### 1. Home/Dashboard
- Header: Date selector, notification icon
- Today's calorie progress (large circular)
- Macro breakdown (3 smaller circles or bars)
- Quick actions: "Log Food", "Log Weight"
- Recent foods (quick log)
- Streak indicator
- Bottom tab navigation

#### 2. Log Food
- Search bar (prominent)
- Barcode scan button
- Filter tabs: All, Recent, Favorites, Custom
- Search results list
- Tap food → Food Detail sheet
- Bottom: "Create Custom Food" link

#### 3. Food Detail Modal
- Food name, brand
- Serving size selector (dropdown + manual)
- Nutrition facts table
- Meal type selector
- Time picker
- Notes field
- "Add to Log" button

#### 4. Daily Log
- Date navigation (< Today >)
- Meal sections (Breakfast, Lunch, Dinner, Snacks)
- Foods listed with serving + macros
- Running totals at top
- Tap food to edit/delete
- "Add note for today"
- Micronutrients expandable section

#### 5. Progress (Body Metrics)
- Header tabs: Weight, Body Fat %, Photos
- Current value (large)
- Quick entry input
- Trend graph (interactive)
- Time range selector (7d, 30d, 90d, all)
- Goal progress indicator
- History list (tap to edit)

#### 6. Progress Photos
- Grid view of photos (chronological)
- Filter by type (front, side, back)
- "Add Photo" FAB button
- Tap photo → full screen with:
  - Date
  - Notes
  - Edit/Delete options
  - Compare mode (select another photo)

#### 7. Analytics
- Summary cards:
  - Average calories
  - Average macros
  - Weight change
  - Logging consistency
- Graph section (scrollable):
  - Weight trend
  - Calorie intake
  - Macro distribution
  - Micronutrient trends (selectable)
- Date range selector
- Export data button

#### 8. Learn (Education Hub)
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

#### 9. Profile/Settings
- User info summary
- Edit Profile
- Goals & Preferences
  - Change goal
  - Adjust TDEE formula
  - Activity level
- Display Settings
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
- Recipe builder (calculate nutrition for recipes)
- Meal planning
- Integration with cooking app
- Grocery list generation

**Phase 3 Features:**
- Apple Health / Google Fit integration
- Wearable sync (weight from smart scales)
- Water intake tracking
- Sleep tracking correlation

**Phase 4 Features:**
- Optional cloud sync (encrypted)
- Multi-device support
- Backup/restore
- Social features (optional, privacy-first)

**Integration with Cooking App:**
- Shared ingredient database
- Log recipes directly
- Meal prep → auto-log meals
- Shopping list → nutrition planning

**Integration with Storage App:**
- Pantry inventory
- Expiration tracking
- "What can I make with what I have?"
- Auto-suggest meals based on inventory

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
