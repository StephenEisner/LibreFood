import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/services/database/init';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => setDbReady(true));
  }, []);

  if (!dbReady) return null;

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
