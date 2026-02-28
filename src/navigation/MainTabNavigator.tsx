import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { DailyLogScreen } from '../screens/log/DailyLogScreen';
import { MealsScreen } from '../screens/meals/MealsScreen';
import { MetricsScreen } from '../screens/metrics/MetricsScreen';
import { MoreScreen } from '../screens/settings/MoreScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Log" component={DailyLogScreen} />
      <Tab.Screen name="MealsRecipes" component={MealsScreen} options={{ title: 'Meals & Recipes' }} />
      <Tab.Screen name="Metrics" component={MetricsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
