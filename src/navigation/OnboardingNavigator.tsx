import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { HeightScreen } from '../screens/onboarding/HeightScreen';
import { BirthDateScreen } from '../screens/onboarding/BirthDateScreen';
import { SexScreen } from '../screens/onboarding/SexScreen';
import { TrackingQuizScreen } from '../screens/onboarding/TrackingQuizScreen';
import { ActivityLevelScreen } from '../screens/onboarding/ActivityLevelScreen';
import { GoalSelectionScreen } from '../screens/onboarding/GoalSelectionScreen';
import { TDEEFormulaScreen } from '../screens/onboarding/TDEEFormulaScreen';
import { CurrentWeightScreen } from '../screens/onboarding/CurrentWeightScreen';
import { GoalConfigScreen } from '../screens/onboarding/GoalConfigScreen';
import { PreferencesReviewScreen } from '../screens/onboarding/PreferencesReviewScreen';
import { CompleteScreen } from '../screens/onboarding/CompleteScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Height" component={HeightScreen} />
      <Stack.Screen name="BirthDate" component={BirthDateScreen} />
      <Stack.Screen name="Sex" component={SexScreen} />
      <Stack.Screen name="TrackingQuiz" component={TrackingQuizScreen} />
      <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="TDEEFormula" component={TDEEFormulaScreen} />
      <Stack.Screen name="CurrentWeight" component={CurrentWeightScreen} />
      <Stack.Screen name="GoalConfig" component={GoalConfigScreen} />
      <Stack.Screen name="PreferencesReview" component={PreferencesReviewScreen} />
      <Stack.Screen name="Complete" component={CompleteScreen} />
    </Stack.Navigator>
  );
}
