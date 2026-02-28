export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Height: undefined;
  BirthDate: undefined;
  Sex: undefined;
  TrackingQuiz: undefined;
  ActivityLevel: undefined;
  GoalSelection: undefined;
  TDEEFormula: undefined;
  CurrentWeight: undefined;
  GoalConfig: undefined;
  PreferencesReview: undefined;
  Complete: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Log: undefined;
  MealsRecipes: undefined;
  Metrics: undefined;
  More: undefined;
};

export type LogStackParamList = {
  DailyLog: undefined;
  FoodSearch: { date: string; mealType: string };
  FoodDetail: { fdcId: number };
  CustomFoodCreate: undefined;
  CustomFoodEdit: { id: number };
};

export type MealsStackParamList = {
  MealsList: undefined;
  MealDetail: { id: number };
  MealCreate: undefined;
  RecipesList: undefined;
  RecipeDetail: { id: number };
  RecipeCreate: undefined;
};

export type MetricsStackParamList = {
  MetricsDashboard: undefined;
  WeightHistory: undefined;
  BodyFatHistory: undefined;
  ProgressPhotos: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Settings: undefined;
  Profile: undefined;
  ResearchFeed: undefined;
  Export: undefined;
};
