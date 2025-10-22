/**
 * Database initialization and schema management
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'librefood.db';
const DATABASE_VERSION = 1;

/**
 * Open or create the LibreFood database
 */
export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return db;
}

/**
 * Initialize the database schema
 * Creates all tables and indexes if they don't exist
 */
export async function initDatabase(): Promise<void> {
  const db = await openDatabase();

  try {
    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Create schema version table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Check current schema version
    const versionResult = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
    );

    const currentVersion = versionResult?.version || 0;

    // Apply migrations if needed
    if (currentVersion < DATABASE_VERSION) {
      await applyMigrations(db, currentVersion, DATABASE_VERSION);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Apply database migrations from current version to target version
 */
async function applyMigrations(
  db: SQLite.SQLiteDatabase,
  fromVersion: number,
  toVersion: number
): Promise<void> {
  console.log(`Applying migrations from version ${fromVersion} to ${toVersion}`);

  if (fromVersion < 1 && toVersion >= 1) {
    await applyMigration1(db);
  }

  // Future migrations will be added here
  // if (fromVersion < 2 && toVersion >= 2) {
  //   await applyMigration2(db);
  // }
}

/**
 * Migration 1: Initial schema
 * Creates all base tables for Phase 1
 */
async function applyMigration1(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Applying migration 1: Initial schema');

  await db.execAsync(`
    -- Users table (single user per device)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      height_cm REAL NOT NULL,
      birth_date TEXT NOT NULL,
      sex TEXT NOT NULL CHECK(sex IN ('male', 'female', 'other')),
      activity_level TEXT NOT NULL CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
      goal_type TEXT NOT NULL CHECK(goal_type IN ('lose_weight', 'gain_weight', 'maintain_weight', 'body_recomposition', 'custom')),
      tdee_formula TEXT NOT NULL DEFAULT 'mifflin_st_jeor' CHECK(tdee_formula IN ('mifflin_st_jeor', 'harris_benedict', 'katch_mcardle')),
      target_weight_kg REAL,
      goal_rate_kg_per_week REAL,
      custom_calorie_target INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Body metrics table
    CREATE TABLE IF NOT EXISTS body_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      weight_kg REAL,
      body_fat_percentage REAL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON body_metrics(user_id, date DESC);

    -- Progress photos table
    CREATE TABLE IF NOT EXISTS progress_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      photo_uri TEXT NOT NULL,
      weight_kg REAL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON progress_photos(user_id, date DESC);

    -- User tracking preferences table
    CREATE TABLE IF NOT EXISTS user_tracking_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      track_calories INTEGER NOT NULL DEFAULT 1,
      track_protein INTEGER NOT NULL DEFAULT 1,
      track_fat INTEGER NOT NULL DEFAULT 1,
      track_carbs INTEGER NOT NULL DEFAULT 1,
      track_fiber INTEGER NOT NULL DEFAULT 0,
      track_sugar INTEGER NOT NULL DEFAULT 0,
      track_sodium INTEGER NOT NULL DEFAULT 0,
      track_cholesterol INTEGER NOT NULL DEFAULT 0,
      track_vitamins INTEGER NOT NULL DEFAULT 0,
      track_minerals INTEGER NOT NULL DEFAULT 0,
      track_water INTEGER NOT NULL DEFAULT 1,
      track_body_metrics INTEGER NOT NULL DEFAULT 1,
      ui_theme TEXT NOT NULL DEFAULT 'standard' CHECK(ui_theme IN ('minimalist', 'standard', 'maximalist')),
      focus_mode TEXT NOT NULL DEFAULT 'weight_management',
      dashboard_widgets TEXT NOT NULL DEFAULT '["calories","macros","weight","meal_log"]',
      show_recipes INTEGER NOT NULL DEFAULT 1,
      show_meals INTEGER NOT NULL DEFAULT 1,
      show_research_feed INTEGER NOT NULL DEFAULT 0,
      show_progress_photos INTEGER NOT NULL DEFAULT 1,
      use_metric INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Foods table (USDA FoodData Central - read-only)
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fdc_id INTEGER NOT NULL UNIQUE,
      description TEXT NOT NULL,
      data_type TEXT NOT NULL,
      calories REAL NOT NULL,
      protein_g REAL NOT NULL,
      fat_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      fiber_g REAL NOT NULL DEFAULT 0,
      sugar_g REAL NOT NULL DEFAULT 0,
      sodium_mg REAL,
      cholesterol_mg REAL,
      vitamin_a_mcg REAL,
      vitamin_c_mg REAL,
      vitamin_d_mcg REAL,
      calcium_mg REAL,
      iron_mg REAL,
      potassium_mg REAL,
      brand_owner TEXT,
      brand_name TEXT,
      serving_size REAL,
      serving_unit TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_foods_fdc_id ON foods(fdc_id);
    CREATE INDEX IF NOT EXISTS idx_foods_description ON foods(description);

    -- Custom foods table (user-created)
    CREATE TABLE IF NOT EXISTS custom_foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      brand TEXT,
      calories REAL NOT NULL,
      protein_g REAL NOT NULL,
      fat_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      fiber_g REAL NOT NULL DEFAULT 0,
      sugar_g REAL NOT NULL DEFAULT 0,
      sodium_mg REAL,
      cholesterol_mg REAL,
      vitamin_a_mcg REAL,
      vitamin_c_mg REAL,
      vitamin_d_mcg REAL,
      calcium_mg REAL,
      iron_mg REAL,
      potassium_mg REAL,
      serving_size_g REAL,
      serving_unit TEXT,
      notes TEXT,
      barcode TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_custom_foods_user ON custom_foods(user_id);
    CREATE INDEX IF NOT EXISTS idx_custom_foods_barcode ON custom_foods(barcode) WHERE barcode IS NOT NULL;

    -- Custom meals table
    CREATE TABLE IF NOT EXISTS custom_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      times_logged INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_custom_meals_user ON custom_meals(user_id);

    -- Custom meal items table
    CREATE TABLE IF NOT EXISTS custom_meal_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_id INTEGER NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('food', 'custom_food', 'recipe')),
      item_id INTEGER NOT NULL,
      quantity_g REAL NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (meal_id) REFERENCES custom_meals(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_custom_meal_items_meal ON custom_meal_items(meal_id);

    -- Custom recipes table
    CREATE TABLE IF NOT EXISTS custom_recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      servings INTEGER NOT NULL,
      prep_time_minutes INTEGER,
      cook_time_minutes INTEGER,
      instructions TEXT NOT NULL,
      tags TEXT,
      photo_uri TEXT,
      times_cooked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_custom_recipes_user ON custom_recipes(user_id);

    -- Custom recipe ingredients table
    CREATE TABLE IF NOT EXISTS custom_recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('food', 'custom_food')),
      item_id INTEGER NOT NULL,
      quantity_g REAL NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_custom_recipe_ingredients_recipe ON custom_recipe_ingredients(recipe_id);

    -- Custom recipe steps table (optional structured instructions)
    CREATE TABLE IF NOT EXISTS custom_recipe_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      duration_minutes INTEGER,
      FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id) ON DELETE CASCADE,
      UNIQUE(recipe_id, step_number)
    );

    CREATE INDEX IF NOT EXISTS idx_custom_recipe_steps_recipe ON custom_recipe_steps(recipe_id, step_number);

    -- Recipe nutrition cache table
    CREATE TABLE IF NOT EXISTS recipe_nutrition (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL UNIQUE,
      serving_size_g REAL NOT NULL,
      calories_per_serving REAL NOT NULL,
      protein_per_serving REAL NOT NULL,
      fat_per_serving REAL NOT NULL,
      carbs_per_serving REAL NOT NULL,
      fiber_per_serving REAL NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id) ON DELETE CASCADE
    );

    -- Food log table
    CREATE TABLE IF NOT EXISTS food_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
      item_type TEXT NOT NULL CHECK(item_type IN ('food', 'custom_food', 'custom_meal', 'custom_recipe')),
      item_id INTEGER NOT NULL,
      quantity_g REAL NOT NULL,
      logged_at TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_food_log_user_date ON food_log(user_id, date DESC);

    -- Research articles table (for Education Hub)
    CREATE TABLE IF NOT EXISTS research_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pubmed_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      abstract TEXT,
      authors TEXT,
      journal TEXT,
      publication_date TEXT,
      url TEXT,
      tags TEXT,
      cached_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_research_articles_pubmed ON research_articles(pubmed_id);

    -- Record schema version
    INSERT INTO schema_version (version) VALUES (1);
  `);

  console.log('Migration 1 applied successfully');
}

/**
 * Drop all tables (for testing/development only)
 */
export async function dropAllTables(): Promise<void> {
  const db = await openDatabase();

  await db.execAsync(`
    PRAGMA foreign_keys = OFF;

    DROP TABLE IF EXISTS food_log;
    DROP TABLE IF EXISTS research_articles;
    DROP TABLE IF EXISTS recipe_nutrition;
    DROP TABLE IF EXISTS custom_recipe_steps;
    DROP TABLE IF EXISTS custom_recipe_ingredients;
    DROP TABLE IF EXISTS custom_recipes;
    DROP TABLE IF EXISTS custom_meal_items;
    DROP TABLE IF EXISTS custom_meals;
    DROP TABLE IF EXISTS custom_foods;
    DROP TABLE IF EXISTS foods;
    DROP TABLE IF EXISTS user_tracking_preferences;
    DROP TABLE IF EXISTS progress_photos;
    DROP TABLE IF EXISTS body_metrics;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS schema_version;

    PRAGMA foreign_keys = ON;
  `);

  console.log('All tables dropped');
}

/**
 * Reset database (drop and reinitialize)
 * For development/testing only
 */
export async function resetDatabase(): Promise<void> {
  await dropAllTables();
  await initDatabase();
  console.log('Database reset complete');
}
