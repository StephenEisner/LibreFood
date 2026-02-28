import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface SelectCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  multiSelect?: boolean;
}

export function SelectCard({
  label,
  description,
  selected,
  onPress,
  multiSelect = false,
}: SelectCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.row}>
        <View style={styles.indicator}>
          {multiSelect ? (
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
              {selected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          ) : (
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected && <View style={styles.radioDot} />}
            </View>
          )}
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
          {description ? (
            <Text style={[styles.description, selected && styles.descriptionSelected]}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  indicator: {
    paddingTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.fontWeightBold,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightMedium,
    color: colors.text,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeightSemibold,
  },
  description: {
    fontSize: typography.fontSizeSm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: typography.fontSizeSm * typography.lineHeightNormal,
  },
  descriptionSelected: {
    color: colors.primary,
    opacity: 0.8,
  },
});
