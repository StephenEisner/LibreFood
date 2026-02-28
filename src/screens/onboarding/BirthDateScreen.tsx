import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { isValidAge } from '../../utils/validation';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'BirthDate'>;

function getAge(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function padded(val: string, len: number): string {
  return val.padStart(len, '0');
}

export function BirthDateScreen() {
  const navigation = useNavigation<Nav>();
  const { data, update } = useOnboardingStore();

  const existingParts = data.birth_date ? data.birth_date.split('-') : null;
  const [month, setMonth] = useState(existingParts ? existingParts[1].replace(/^0/, '') : '');
  const [day, setDay] = useState(existingParts ? existingParts[2].replace(/^0/, '') : '');
  const [year, setYear] = useState(existingParts ? existingParts[0] : '');

  function buildIso(): string | null {
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);
    if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;
    if (year.length !== 4) return null;
    return `${y}-${padded(String(m), 2)}-${padded(String(d), 2)}`;
  }

  const iso = buildIso();
  const age = iso ? getAge(iso) : null;
  const isValid = iso !== null && isValidAge(iso);

  function handleNext() {
    if (!iso || !isValid) return;
    update({ birth_date: iso });
    navigation.navigate('Sex');
  }

  return (
    <OnboardingLayout
      title="When were you born?"
      subtitle="Used to calculate age for TDEE."
      progress={2 / 11}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.inputRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Month</Text>
          <TextInput
            style={styles.input}
            value={month}
            onChangeText={setMonth}
            keyboardType="number-pad"
            placeholder="MM"
            placeholderTextColor={colors.gray400}
            maxLength={2}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Day</Text>
          <TextInput
            style={styles.input}
            value={day}
            onChangeText={setDay}
            keyboardType="number-pad"
            placeholder="DD"
            placeholderTextColor={colors.gray400}
            maxLength={2}
          />
        </View>
        <View style={[styles.field, styles.fieldWide]}>
          <Text style={styles.fieldLabel}>Year</Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            placeholder="YYYY"
            placeholderTextColor={colors.gray400}
            maxLength={4}
          />
        </View>
      </View>

      {age !== null && (
        <View style={[styles.agePill, isValid ? styles.agePillValid : styles.agePillInvalid]}>
          <Text style={[styles.ageText, isValid ? styles.ageTextValid : styles.ageTextInvalid]}>
            {isValid ? `Age: ${age}` : 'Age must be between 13–120'}
          </Text>
        </View>
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
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  field: {
    flex: 1,
  },
  fieldWide: {
    flex: 1.5,
  },
  fieldLabel: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeightSemibold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    textAlign: 'center',
    backgroundColor: colors.white,
  },
  agePill: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  agePillValid: {
    backgroundColor: colors.secondaryLight,
  },
  agePillInvalid: {
    backgroundColor: '#FEE2E2',
  },
  ageText: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
  },
  ageTextValid: {
    color: colors.secondary,
  },
  ageTextInvalid: {
    color: colors.danger,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
});
