import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { LogStackParamList } from './types';
import { DailyLogScreen } from '../screens/log/DailyLogScreen';
import { FoodSearchScreen } from '../screens/log/FoodSearchScreen';
import { FoodDetailScreen } from '../screens/log/FoodDetailScreen';
import { CustomFoodCreateScreen } from '../screens/log/CustomFoodCreateScreen';
import { CustomFoodEditScreen } from '../screens/log/CustomFoodEditScreen';

const Stack = createNativeStackNavigator<LogStackParamList>();

export function LogStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DailyLog" component={DailyLogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FoodSearch" component={FoodSearchScreen} options={{ title: 'Search Foods' }} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="CustomFoodCreate" component={CustomFoodCreateScreen} options={{ title: 'Create Food' }} />
      <Stack.Screen name="CustomFoodEdit" component={CustomFoodEditScreen} options={{ title: 'Edit Food' }} />
    </Stack.Navigator>
  );
}
