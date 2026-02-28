import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface OnboardingLayoutProps {
  title: string;
  subtitle?: string;
  progress: number; // 0–1
  onBack?: () => void;
  children: React.ReactNode;
}

export function OnboardingLayout({
  title,
  subtitle,
  progress,
  onBack,
  children,
}: OnboardingLayoutProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.children}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 28,
    color: colors.primary,
    lineHeight: 32,
    marginTop: -2,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize2xl,
    fontWeight: typography.fontWeightBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizeMd,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: typography.fontSizeMd * typography.lineHeightNormal,
  },
  children: {
    marginTop: spacing.md,
  },
});
