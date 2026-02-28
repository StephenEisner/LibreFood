import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { getFirstUser } from '../services/database/users';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [hasUser, setHasUser] = useState<boolean | null>(null);

  useEffect(() => {
    getFirstUser().then((user) => {
      setHasUser(user !== null);
    });
  }, []);

  if (hasUser === null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {hasUser ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
