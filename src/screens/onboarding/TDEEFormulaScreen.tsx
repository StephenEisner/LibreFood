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
import type { TDEEFormula } from '../../types/user';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'TDEEFormula'>;

const OPTIONS: { value: TDEEFormula; label: string; description: string }[] = [
  {
    value: 'mifflin',
    label: 'Mifflin-St Jeor (Recommended)',
    description: 'Most accurate for most people',
  },
  {
    value: 'harris',
    label: 'Harris-Benedict',
    description: 'Classic formula, slightly higher estimates',
  },
  {
    value: 'katch',
    label: 'Katch-McArdle',
    description: 'Best if you know your body fat % (can set up later)',
  },
];

export function TDEEFormulaScreen() {
  const navigation = useNavigation<Nav>();
  const { data, update } = useOnboardingStore();
  const [selected, setSelected] = useState<TDEEFormula>(data.tdee_formula);

  function handleNext() {
    update({ tdee_formula: selected });
    navigation.navigate('CurrentWeight');
  }

  return (
    <OnboardingLayout
      title="TDEE formula"
      subtitle="How should we estimate your metabolic rate?"
      progress={7 / 11}
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
        <PrimaryButton label="Next" onPress={handleNext} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: spacing.md,
  },
});
