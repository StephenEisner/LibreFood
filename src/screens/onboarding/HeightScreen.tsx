import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { isValidHeightCm } from '../../utils/validation';
import { ftInToCm } from '../../utils/units';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import type { UnitSystem } from '../../types/user';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Height'>;

export function HeightScreen() {
  const navigation = useNavigation<Nav>();
  const { data, update } = useOnboardingStore();

  const [unitSystem, setUnitSystem] = useState<UnitSystem>(data.unit_system);
  const [cmValue, setCmValue] = useState(data.height_cm ? String(Math.round(data.height_cm)) : '');
  const [ftValue, setFtValue] = useState('');
  const [inValue, setInValue] = useState('');

  function getHeightCm(): number | null {
    if (unitSystem === 'metric') {
      const v = parseFloat(cmValue);
      return isNaN(v) ? null : v;
    }
    const ft = parseFloat(ftValue);
    const inches = parseFloat(inValue) || 0;
    if (isNaN(ft)) return null;
    return ftInToCm(ft, inches);
  }

  const heightCm = getHeightCm();
  const hasInput = unitSystem === 'metric' ? cmValue.length > 0 : ftValue.length > 0;
  const isValid = heightCm !== null && isValidHeightCm(heightCm);

  function handleNext() {
    if (!isValid || heightCm === null) return;
    update({ height_cm: heightCm, unit_system: unitSystem });
    navigation.navigate('BirthDate');
  }

  return (
    <OnboardingLayout
      title="How tall are you?"
      subtitle="Used to calculate your energy needs."
      progress={1 / 11}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.segmentRow}>
        {(['metric', 'imperial'] as UnitSystem[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.segment, unitSystem === s && styles.segmentActive]}
            onPress={() => setUnitSystem(s)}
          >
            <Text style={[styles.segmentText, unitSystem === s && styles.segmentTextActive]}>
              {s === 'metric' ? 'Metric (cm)' : 'Imperial (ft/in)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {unitSystem === 'metric' ? (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={cmValue}
            onChangeText={setCmValue}
            keyboardType="decimal-pad"
            placeholder="175"
            placeholderTextColor={colors.gray400}
            maxLength={5}
          />
          <Text style={styles.unit}>cm</Text>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputShort]}
            value={ftValue}
            onChangeText={setFtValue}
            keyboardType="number-pad"
            placeholder="5"
            placeholderTextColor={colors.gray400}
            maxLength={1}
          />
          <Text style={styles.unit}>ft</Text>
          <TextInput
            style={[styles.input, styles.inputShort]}
            value={inValue}
            onChangeText={setInValue}
            keyboardType="number-pad"
            placeholder="9"
            placeholderTextColor={colors.gray400}
            maxLength={2}
          />
          <Text style={styles.unit}>in</Text>
        </View>
      )}

      {hasInput && heightCm !== null && !isValidHeightCm(heightCm) && (
        <Text style={styles.error}>Please enter a height between 100–250 cm.</Text>
      )}

      <View style={styles.buttonContainer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={!isValid} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.xl,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
  },
  segmentTextActive: {
    color: colors.text,
    fontWeight: typography.fontWeightSemibold,
  },
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
  inputShort: {
    flex: 0,
    width: 72,
  },
  unit: {
    fontSize: typography.fontSizeLg,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightMedium,
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
