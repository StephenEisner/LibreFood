import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('librefood.db');
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');
  return db;
}

interface Migration {
  version: number;
  description: string;
  up: string;
}

const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        height_cm REAL NOT NULL,
        birth_date TEXT NOT NULL,
        sex TEXT NOT NULL,
        activity_level TEXT NOT NULL,
        tdee_formula TEXT DEFAULT 'mifflin',
        goal_type TEXT,
        goal_weight_kg REAL,
        goal_rate_kg_per_week REAL,
        custom_calorie_target INTEGER,
        tracking_purpose TEXT,
        unit_system TEXT DEFAULT 'imperial',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS user_tracking_preferences (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        focus_mode TEXT DEFAULT 'standard',
        ui_theme TEXT DEFAULT 'standard',
        color_scheme TEXT DEFAULT 'system',
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
        track_calcium INTEGER DEFAULT 0,
        track_iron INTEGER DEFAULT 0,
        track_magnesium INTEGER DEFAULT 0,
        track_phosphorus INTEGER DEFAULT 0,
        track_potassium INTEGER DEFAULT 0,
        track_zinc INTEGER DEFAULT 0,
        track_copper INTEGER DEFAULT 0,
        track_manganese INTEGER DEFAULT 0,
        track_selenium INTEGER DEFAULT 0,
        track_weight INTEGER DEFAULT 1,
        track_body_fat INTEGER DEFAULT 0,
        track_measurements INTEGER DEFAULT 0,
        show_progress_photos INTEGER DEFAULT 1,
        show_research_feed INTEGER DEFAULT 1,
        show_recipes INTEGER DEFAULT 1,
        show_meal_planning INTEGER DEFAULT 0,
        dashboard_layout TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS body_metrics (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        weight_kg REAL,
        body_fat_percentage REAL,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON body_metrics(user_id, date);

      CREATE TABLE IF NOT EXISTS progress_photos (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        photo_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS foods (
        fdc_id INTEGER PRIMARY KEY,
        description TEXT NOT NULL,
        data_type TEXT,
        brand_name TEXT,
        brand_owner TEXT,
        gtin_upc TEXT,
        serving_size REAL,
        serving_size_unit TEXT,
        household_serving_text TEXT,
        category TEXT,
        nutrition_json TEXT NOT NULL,
        calories REAL,
        protein_g REAL,
        carbs_g REAL,
        fat_g REAL,
        cached_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_foods_description ON foods(description);
      CREATE INDEX IF NOT EXISTS idx_foods_gtin ON foods(gtin_upc);

      CREATE TABLE IF NOT EXISTS custom_foods (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        brand TEXT,
        serving_size REAL NOT NULL,
        serving_size_unit TEXT NOT NULL,
        household_serving_text TEXT,
        nutrition_json TEXT NOT NULL,
        calories REAL,
        protein_g REAL,
        carbs_g REAL,
        fat_g REAL,
        is_favorite INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_meals (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        notes TEXT,
        is_favorite INTEGER DEFAULT 0,
        tags TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_meal_items (
        id INTEGER PRIMARY KEY,
        meal_id INTEGER NOT NULL,
        food_id INTEGER,
        custom_food_id INTEGER,
        recipe_id INTEGER,
        servings REAL NOT NULL DEFAULT 1.0,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (meal_id) REFERENCES custom_meals(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(fdc_id),
        FOREIGN KEY (custom_food_id) REFERENCES custom_foods(id),
        FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id)
      );

      CREATE TABLE IF NOT EXISTS custom_recipes (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        instructions TEXT,
        prep_time_minutes INTEGER,
        cook_time_minutes INTEGER,
        total_time_minutes INTEGER,
        servings REAL NOT NULL DEFAULT 1.0,
        yield_amount REAL,
        yield_unit TEXT,
        difficulty TEXT,
        tags TEXT,
        notes TEXT,
        photo_path TEXT,
        is_favorite INTEGER DEFAULT 0,
        nutrition_per_serving_json TEXT,
        calories_per_serving REAL,
        protein_per_serving_g REAL,
        carbs_per_serving_g REAL,
        fat_per_serving_g REAL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_recipe_ingredients (
        id INTEGER PRIMARY KEY,
        recipe_id INTEGER NOT NULL,
        food_id INTEGER,
        custom_food_id INTEGER,
        amount REAL NOT NULL,
        unit TEXT NOT NULL,
        name_override TEXT,
        sort_order INTEGER DEFAULT 0,
        is_optional INTEGER DEFAULT 0,
        notes TEXT,
        FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(fdc_id),
        FOREIGN KEY (custom_food_id) REFERENCES custom_foods(id)
      );

      CREATE TABLE IF NOT EXISTS food_log (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        food_id INTEGER,
        custom_food_id INTEGER,
        custom_meal_id INTEGER,
        custom_recipe_id INTEGER,
        servings REAL NOT NULL DEFAULT 1.0,
        logged_nutrition_json TEXT NOT NULL,
        logged_calories REAL,
        logged_protein_g REAL,
        logged_carbs_g REAL,
        logged_fat_g REAL,
        notes TEXT,
        time TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_food_log_user_date ON food_log(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_food_log_date_meal ON food_log(date, meal_type);

      CREATE TABLE IF NOT EXISTS research_articles (
        id INTEGER PRIMARY KEY,
        pubmed_id TEXT UNIQUE,
        title TEXT NOT NULL,
        abstract TEXT,
        authors TEXT,
        journal TEXT,
        publication_date TEXT,
        url TEXT,
        relevance_tags TEXT,
        fetched_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT DEFAULT (datetime('now')),
        description TEXT
      );
    `,
  },
];

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  // Ensure the migrations table exists before querying it
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now')),
      description TEXT
    )
  `);

  const applied = await database.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC'
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue;

    await database.execAsync(migration.up);
    await database.runAsync(
      'INSERT INTO schema_migrations (version, description) VALUES (?, ?)',
      migration.version,
      migration.description
    );
  }
}

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await openDatabase();
  await runMigrations(database);
  return database;
}
