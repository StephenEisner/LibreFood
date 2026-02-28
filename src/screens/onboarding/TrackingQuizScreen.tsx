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
import type { TrackingPurpose } from '../../types/user';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'TrackingQuiz'>;

const OPTIONS: { value: TrackingPurpose; label: string; description: string }[] = [
  {
    value: 'weight_management',
    label: 'Weight Management',
    description: 'Lose, gain, or maintain weight',
  },
  {
    value: 'athletic_performance',
    label: 'Athletic Performance',
    description: 'Fuel training and optimize recovery',
  },
  {
    value: 'general_health',
    label: 'General Health',
    description: 'Eat balanced and feel good',
  },
  {
    value: 'specific_health',
    label: 'Specific Health Condition',
    description: 'Managing a health condition through diet',
  },
  {
    value: 'learn_nutrition',
    label: 'Learn About Nutrition',
    description: 'Understand what\'s in your food',
  },
  {
    value: 'track_everything',
    label: 'Track Everything',
    description: 'Full nutrient detail and data nerd mode',
  },
  {
    value: 'keep_it_simple',
    label: 'Keep It Simple',
    description: 'Just calories and protein, nothing more',
  },
];

export function TrackingQuizScreen() {
  const navigation = useNavigation<Nav>();
  const { data, update } = useOnboardingStore();
  const [selected, setSelected] = useState<TrackingPurpose[]>(data.tracking_purposes);

  function toggle(value: TrackingPurpose) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handleNext() {
    if (selected.length === 0) return;
    update({ tracking_purposes: selected });
    navigation.navigate('ActivityLevel');
  }

  return (
    <OnboardingLayout
      title="What brings you to LibreFood?"
      subtitle="Select all that apply."
      progress={4 / 11}
      onBack={() => navigation.goBack()}
    >
      {OPTIONS.map((opt) => (
        <SelectCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={selected.includes(opt.value)}
          onPress={() => toggle(opt.value)}
          multiSelect
        />
      ))}

      <View style={styles.buttonContainer}>
        <PrimaryButton label="Next" onPress={handleNext} disabled={selected.length === 0} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: spacing.md,
  },
});
