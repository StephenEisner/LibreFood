import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SelectCard } from '../../components/common/SelectCard';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { colors, spacing, typography } from '../../constants/theme';
import type { Sex } from '../../types/user';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Sex'>;

const OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other / Prefer not to say' },
];

export function SexScreen() {
  const navigation = useNavigation<Nav>();
  const { data, update } = useOnboardingStore();
  const [selected, setSelected] = useState<Sex | null>(data.sex);

  function handleNext() {
    if (!selected) return;
    update({ sex: selected });
    navigation.navigate('TrackingQuiz');
  }

  return (
    <OnboardingLayout
      title="Biological sex"
      subtitle="Used only for TDEE calculation accuracy."
      progress={3 / 11}
      onBack={() => navigation.goBack()}
    >
      {OPTIONS.map((opt) => (
        <SelectCard
          key={opt.value}
          label={opt.label}
          selected={selected === opt.value}
          onPress={() => setSelected(opt.value)}
        />
      ))}

      <Text style={styles.note}>
        This is used only to improve the accuracy of your metabolic rate estimate.
      </Text>

      <View style={styles.buttonContainer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={selected === null} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  note: {
    fontSize: typography.fontSizeXs,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    lineHeight: typography.fontSizeXs * typography.lineHeightRelaxed,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
});
