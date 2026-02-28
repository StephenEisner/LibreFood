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
import type { GoalType } from '../../types/user';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'GoalSelection'>;

const OPTIONS: { value: GoalType; label: string; description: string }[] = [
  {
    value: 'loss',
    label: 'Lose Weight',
    description: 'Eat in a calorie deficit',
  },
  {
    value: 'gain',
    label: 'Gain Weight',
    description: 'Eat in a calorie surplus',
  },
  {
    value: 'maintenance',
    label: 'Maintain Weight',
    description: 'Eat at maintenance calories',
  },
  {
    value: 'recomp',
    label: 'Body Recomposition',
    description: 'Build muscle and lose fat simultaneously',
  },
  {
    value: 'custom',
    label: 'Custom Calorie Target',
    description: 'Set your own daily calorie goal',
  },
];

export function GoalSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const { data, update } = useOnboardingStore();
  const [selected, setSelected] = useState<GoalType | null>(data.goal_type);

  function handleNext() {
    if (!selected) return;
    update({ goal_type: selected });
    navigation.navigate('TDEEFormula');
  }

  return (
    <OnboardingLayout
      title="What's your goal?"
      subtitle="This determines your calorie target."
      progress={6 / 11}
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
