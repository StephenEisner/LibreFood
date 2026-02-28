import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SelectCard } from '../../components/common/SelectCard';
import { useOnboardingStore } from '../../stores/useOnboardingStore';
import { spacing } from '../../constants/theme';
import type { ActivityLevel } from '../../types/user';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ActivityLevel'>;

const OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Desk job, little to no exercise',
  },
  {
    value: 'light',
    label: 'Lightly Active',
    description: 'Exercise 1–3 days/week',
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    description: 'Exercise 3–5 days/week',
  },
  {
    value: 'active',
    label: 'Active',
    description: 'Exercise 6–7 days/week',
  },
  {
    value: 'very_active',
    label: 'Very Active',
    description: 'Hard daily exercise + physical job',
  },
];

export function ActivityLevelScreen() {
  const navigation = useNavigation<Nav>();
  const { data, update } = useOnboardingStore();
  const [selected, setSelected] = useState<ActivityLevel | null>(data.activity_level);

  function handleNext() {
    if (!selected) return;
    update({ activity_level: selected });
    navigation.navigate('GoalSelection');
  }

  return (
    <OnboardingLayout
      title="How active are you?"
      subtitle="Choose what best describes your typical week."
      progress={5 / 11}
      onBack={() => navigation.goBack()}
    >
      {OPTIONS.map((opt) => (
        <SelectCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={selected === opt.value}
          onPress={() => setSelected(opt.value)}
        />
      ))}

      <View style={styles.buttonContainer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={selected === null} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: spacing.md,
  },
});
