import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { isValidWeightKg } from '../../utils/validation';
import { lbsToKg, kgToLbs } from '../../utils/units';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'CurrentWeight'>;

export function CurrentWeightScreen() {
  const navigation = useNavigation<Nav>();
  const { data, update } = useOnboardingStore();

  const isImperial = data.unit_system === 'imperial';
  const [displayUnit, setDisplayUnit] = useState<'kg' | 'lbs'>(isImperial ? 'lbs' : 'kg');
  const [rawValue, setRawValue] = useState(() => {
    if (!data.weight_kg) return '';
    return displayUnit === 'lbs'
      ? String(Math.round(kgToLbs(data.weight_kg)))
      : String(Math.round(data.weight_kg));
  });

  function getWeightKg(): number | null {
    const v = parseFloat(rawValue);
    if (isNaN(v)) return null;
    return displayUnit === 'lbs' ? lbsToKg(v) : v;
  }

  function toggleUnit() {
    const newUnit = displayUnit === 'kg' ? 'lbs' : 'kg';
    const kg = getWeightKg();
    if (kg !== null) {
      setRawValue(
        newUnit === 'lbs'
          ? String(Math.round(kgToLbs(kg) * 10) / 10)
          : String(Math.round(kg * 10) / 10)
      );
    }
    setDisplayUnit(newUnit);
  }

  const weightKg = getWeightKg();
  const hasInput = rawValue.length > 0;
  const isValid = weightKg !== null && isValidWeightKg(weightKg);

  function handleNext() {
    if (!isValid || weightKg === null) return;
    update({ weight_kg: weightKg });
    navigation.navigate('GoalConfig');
  }

  return (
    <OnboardingLayout
      title="Current weight"
      subtitle="Used to calculate calorie targets and macros."
      progress={8 / 11}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={rawValue}
          onChangeText={setRawValue}
          keyboardType="decimal-pad"
          placeholder={displayUnit === 'lbs' ? '180' : '82'}
          placeholderTextColor={colors.gray400}
          maxLength={6}
        />
        <TouchableOpacity style={styles.unitToggle} onPress={toggleUnit}>
          <Text style={styles.unitToggleText}>{displayUnit}</Text>
        </TouchableOpacity>
      </View>

      {hasInput && weightKg !== null && !isValidWeightKg(weightKg) && (
        <Text style={styles.error}>Please enter a weight between 30–300 kg.</Text>
      )}

      <View style={styles.buttonContainer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={!isValid} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize2xl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    textAlign: 'center',
    backgroundColor: colors.white,
  },
  unitToggle: {
    backgroundColor: colors.gray100,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  unitToggleText: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    color: colors.gray700,
  },
  error: {
    fontSize: typography.fontSizeSm,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
});
