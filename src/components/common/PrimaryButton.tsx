import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[
        styles.button,
        isPrimary ? styles.primaryBg : styles.secondaryBg,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBg: {
    backgroundColor: colors.primary,
  },
  secondaryBg: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
  },
  primaryLabel: {
    color: colors.white,
  },
  secondaryLabel: {
    color: colors.gray700,
  },
});
