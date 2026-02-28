export const colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  secondaryLight: '#D1FAE5',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',

  // Neutrals
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  white: '#FFFFFF',
  black: '#000000',

  // Semantic
  background: '#FFFFFF',
  backgroundDark: '#111827',
  surface: '#F9FAFB',
  surfaceDark: '#1F2937',
  text: '#111827',
  textDark: '#F9FAFB',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  borderDark: '#374151',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 18,
  fontSizeXl: 20,
  fontSize2xl: 24,
  fontSize3xl: 30,

  fontWeightNormal: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemibold: '600' as const,
  fontWeightBold: '700' as const,

  lineHeightTight: 1.25,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
