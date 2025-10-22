/**
 * Demo App for Expo Go
 * Uses mock database instead of expo-sqlite
 */

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { mockDatabase } from './src/services/database/mock';
import type { User } from './src/types/user';
import type { BodyMetric } from './src/types/metrics';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);

  useEffect(() => {
    async function loadDemo() {
      try {
        // Initialize with demo data
        await mockDatabase.seedDemoData();

        // Load user
        const demoUser = await mockDatabase.getCurrentUser();
        setUser(demoUser);

        // Load metrics
        if (demoUser) {
          const userMetrics = await mockDatabase.getMetrics(demoUser.id);
          setMetrics(userMetrics);

          const latest = await mockDatabase.getLatestWeight(demoUser.id);
          setLatestWeight(latest?.weight_kg ?? null);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load demo:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadDemo();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    await mockDatabase.seedDemoData();
    const demoUser = await mockDatabase.getCurrentUser();
    setUser(demoUser);
    if (demoUser) {
      const userMetrics = await mockDatabase.getMetrics(demoUser.id);
      setMetrics(userMetrics);
      const latest = await mockDatabase.getLatestWeight(demoUser.id);
      setLatestWeight(latest?.weight_kg ?? null);
    }
    setLoading(false);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error:</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Demo...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>🥗 LibreFood</Text>
      <Text style={styles.subtitle}>Demo Mode (Expo Go)</Text>
      <Text style={styles.version}>v1.0.0 - Development</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Database Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Mode:</Text>
          <Text style={styles.statusValue}>✅ Mock (In-Memory)</Text>
        </View>
        <Text style={styles.note}>
          Note: Using mock database for Expo Go compatibility. Install development build for real
          SQLite.
        </Text>
      </View>

      {user && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Profile</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Height:</Text>
            <Text style={styles.statusValue}>{user.height_cm} cm</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Sex:</Text>
            <Text style={styles.statusValue}>{user.sex}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Activity:</Text>
            <Text style={styles.statusValue}>{user.activity_level}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Goal:</Text>
            <Text style={styles.statusValue}>
              {user.goal_type.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
      )}

      {latestWeight && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Weight</Text>
          <Text style={styles.weightValue}>{latestWeight.toFixed(1)} kg</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weight History</Text>
        <Text style={styles.note}>{metrics.length} entries recorded</Text>
        {metrics.slice(0, 5).map((metric, index) => (
          <View key={metric.id} style={styles.metricRow}>
            <Text style={styles.metricDate}>{metric.date}</Text>
            <Text style={styles.metricWeight}>
              {metric.weight_kg ? `${metric.weight_kg.toFixed(1)} kg` : '-'}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Reset Demo Data" onPress={handleReset} color="#4CAF50" />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 For Full Features:</Text>
        <Text style={styles.infoText}>
          Build a development client with: npm run build:dev:ios
        </Text>
        <Text style={styles.infoText}>This will enable real SQLite database and all features.</Text>
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 8,
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  version: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  note: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  weightValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metricDate: {
    fontSize: 14,
    color: '#666',
  },
  metricWeight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 16,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 40,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
