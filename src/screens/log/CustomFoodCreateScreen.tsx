import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LogStackParamList } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useUserStore } from '../../stores/useUserStore';
import { getFirstUser } from '../../services/database/users';
import { createCustomFood } from '../../services/database/foods';
import type { NutritionData } from '../../types/foods';

type Nav = NativeStackNavigationProp<LogStackParamList, 'CustomFoodCreate'>;

interface FormField {
  label: string;
  key: keyof NutritionData;
  unit: string;
}

const MACRO_FIELDS: FormField[] = [
  { label: 'Calories', key: 'calories', unit: 'kcal' },
  { label: 'Protein', key: 'protein_g', unit: 'g' },
  { label: 'Carbohydrates', key: 'carbs_g', unit: 'g' },
  { label: 'Fat', key: 'fat_g', unit: 'g' },
];

const MICRO_FIELDS: FormField[] = [
  { label: 'Fiber', key: 'fiber_g', unit: 'g' },
  { label: 'Sugar', key: 'sugar_g', unit: 'g' },
  { label: 'Added Sugar', key: 'added_sugar_g', unit: 'g' },
  { label: 'Cholesterol', key: 'cholesterol_mg', unit: 'mg' },
  { label: 'Sodium', key: 'sodium_mg', unit: 'mg' },
  { label: 'Saturated Fat', key: 'saturated_fat_g', unit: 'g' },
  { label: 'Trans Fat', key: 'trans_fat_g', unit: 'g' },
  { label: 'Monounsaturated Fat', key: 'monounsaturated_fat_g', unit: 'g' },
  { label: 'Polyunsaturated Fat', key: 'polyunsaturated_fat_g', unit: 'g' },
  { label: 'Vitamin A', key: 'vitamin_a_mcg', unit: 'mcg' },
  { label: 'Vitamin C', key: 'vitamin_c_mg', unit: 'mg' },
  { label: 'Vitamin D', key: 'vitamin_d_mcg', unit: 'mcg' },
  { label: 'Vitamin E', key: 'vitamin_e_mg', unit: 'mg' },
  { label: 'Vitamin K', key: 'vitamin_k_mcg', unit: 'mcg' },
  { label: 'Thiamin (B1)', key: 'thiamin_mg', unit: 'mg' },
  { label: 'Riboflavin (B2)', key: 'riboflavin_mg', unit: 'mg' },
  { label: 'Niacin (B3)', key: 'niacin_mg', unit: 'mg' },
  { label: 'Vitamin B6', key: 'vitamin_b6_mg', unit: 'mg' },
  { label: 'Folate', key: 'folate_mcg', unit: 'mcg' },
  { label: 'Vitamin B12', key: 'vitamin_b12_mcg', unit: 'mcg' },
  { label: 'Calcium', key: 'calcium_mg', unit: 'mg' },
  { label: 'Iron', key: 'iron_mg', unit: 'mg' },
  { label: 'Magnesium', key: 'magnesium_mg', unit: 'mg' },
  { label: 'Phosphorus', key: 'phosphorus_mg', unit: 'mg' },
  { label: 'Potassium', key: 'potassium_mg', unit: 'mg' },
  { label: 'Zinc', key: 'zinc_mg', unit: 'mg' },
  { label: 'Copper', key: 'copper_mg', unit: 'mg' },
  { label: 'Manganese', key: 'manganese_mg', unit: 'mg' },
  { label: 'Selenium', key: 'selenium_mcg', unit: 'mcg' },
];

export function CustomFoodCreateScreen() {
  const navigation = useNavigation<Nav>();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingSizeUnit, setServingSizeUnit] = useState('g');
  const [householdText, setHouseholdText] = useState('');
  const [macros, setMacros] = useState<Record<string, string>>({
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  });
  const [micros, setMicros] = useState<Record<string, string>>({});
  const [showMicros, setShowMicros] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      getFirstUser().then((u) => { if (u) setUser(u); });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a food name.');
      return;
    }
    if (!macros.calories || !macros.protein_g || !macros.carbs_g || !macros.fat_g) {
      Alert.alert('Required', 'Please enter calories, protein, carbs, and fat.');
      return;
    }

    const currentUser = useUserStore.getState().user;
    if (!currentUser) {
      Alert.alert('Error', 'User not found. Please restart the app.');
      return;
    }

    const servSz = parseFloat(servingSize) || 100;
    const nutrition: NutritionData = {
      calories: parseFloat(macros.calories) || 0,
      protein_g: parseFloat(macros.protein_g) || 0,
      carbs_g: parseFloat(macros.carbs_g) || 0,
      fat_g: parseFloat(macros.fat_g) || 0,
    };

    // Add micros
    for (const field of MICRO_FIELDS) {
      const val = micros[field.key];
      if (val && val.trim()) {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) {
          (nutrition[field.key] as number) = parsed;
        }
      }
    }

    setSaving(true);
    try {
      await createCustomFood({
        user_id: currentUser.id,
        name: name.trim(),
        brand: brand.trim() || null,
        serving_size: servSz,
        serving_size_unit: servingSizeUnit.trim() || 'g',
        household_serving_text: householdText.trim() || null,
        nutrition_json: JSON.stringify(nutrition),
        calories: nutrition.calories,
        protein_g: nutrition.protein_g ?? null,
        carbs_g: nutrition.carbs_g ?? null,
        fat_g: nutrition.fat_g ?? null,
        is_favorite: 0,
      });
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create custom food:', err);
      Alert.alert('Error', 'Failed to create food. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic info */}
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <View style={styles.card}>
          <LabeledInput
            label="Food Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chicken Breast"
          />
          <LabeledInput
            label="Brand (optional)"
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Generic"
          />
        </View>

        {/* Serving */}
        <Text style={styles.sectionTitle}>Serving Size</Text>
        <View style={styles.card}>
          <View style={styles.servingRow}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <LabeledInput
                label="Amount"
                value={servingSize}
                onChangeText={setServingSize}
                keyboardType="decimal-pad"
                placeholder="100"
              />
            </View>
            <View style={{ flex: 1 }}>
              <LabeledInput
                label="Unit"
                value={servingSizeUnit}
                onChangeText={setServingSizeUnit}
                placeholder="g"
              />
            </View>
          </View>
          <LabeledInput
            label="Household Measure (optional)"
            value={householdText}
            onChangeText={setHouseholdText}
            placeholder="e.g. 1 cup"
          />
          <Text style={styles.servingNote}>Nutrition values below are per the serving size above.</Text>
        </View>

        {/* Macros */}
        <Text style={styles.sectionTitle}>Macronutrients *</Text>
        <View style={styles.card}>
          {MACRO_FIELDS.map((field) => (
            <LabeledInput
              key={field.key}
              label={`${field.label} (${field.unit})`}
              value={macros[field.key] ?? ''}
              onChangeText={(v) => setMacros((prev) => ({ ...prev, [field.key]: v }))}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          ))}
        </View>

        {/* Micros (collapsible) */}
        <Pressable
          style={styles.microsToggle}
          onPress={() => setShowMicros((v) => !v)}
        >
          <Text style={styles.microsToggleText}>
            {showMicros ? '▲' : '▼'} Micronutrients (optional)
          </Text>
        </Pressable>

        {showMicros && (
          <View style={styles.card}>
            {MICRO_FIELDS.map((field) => (
              <LabeledInput
                key={field.key}
                label={`${field.label} (${field.unit})`}
                value={micros[field.key] ?? ''}
                onChangeText={(v) => setMicros((prev) => ({ ...prev, [field.key]: v }))}
                keyboardType="decimal-pad"
                placeholder="0"
              />
            ))}
          </View>
        )}

        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Create Food</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad';
}

function LabeledInput({ label, value, onChangeText, placeholder, keyboardType = 'default' }: LabeledInputProps) {
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={inputStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        keyboardType={keyboardType}
        autoCorrect={false}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: typography.fontWeightMedium,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm - 2,
    fontSize: typography.fontSizeSm,
    color: colors.text,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  servingNote: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  microsToggle: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  microsToggleText: {
    fontSize: typography.fontSizeSm,
    color: colors.primary,
    fontWeight: typography.fontWeightSemibold,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightBold,
  },
});
