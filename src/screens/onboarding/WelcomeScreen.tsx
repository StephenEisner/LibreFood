import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

const FEATURES = [
  { icon: '🔬', text: 'Evidence-based nutrition science' },
  { icon: '🔒', text: 'All data stays on your device' },
  { icon: '♾️', text: 'Free forever — no subscriptions' },
];

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🥗</Text>
          </View>
          <Text style={styles.appName}>LibreFood</Text>
          <Text style={styles.tagline}>
            Evidence-based nutrition tracking.{'\n'}Free forever.
          </Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Get Started" onPress={() => navigation.navigate('Height')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: typography.fontSize3xl,
    fontWeight: typography.fontWeightBold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.fontSizeLg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSizeLg * typography.lineHeightRelaxed,
  },
  features: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureText: {
    fontSize: typography.fontSizeMd,
    color: colors.text,
    fontWeight: typography.fontWeightMedium,
  },
  footer: {
    gap: spacing.md,
  },
});
