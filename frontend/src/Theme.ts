export const Colors = {
  primary: '#154212',
  primaryContainer: '#2d5a27',
  primaryFixed: '#bcf0ae',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#9dd090',
  secondary: '#0061a4',
  secondaryContainer: '#33a0fd',
  onSecondary: '#ffffff',
  tertiary: '#705d00',
  tertiaryContainer: '#c9a900',
  tertiaryFixed: '#ffe16d',
  tertiaryFixedDim: '#e9c400',
  onTertiaryContainer: '#4c3e00',
  surface: '#f8f9fa',
  surfaceBright: '#f8f9fa',
  surfaceDim: '#d9dadb',
  surfaceVariant: '#e1e3e4',
  surfaceContainer: '#edeeef',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainerHigh: '#e7e8e9',
  surfaceContainerHighest: '#e1e3e4',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#191c1d',
  onSurfaceVariant: '#42493e',
  onBackground: '#191c1d',
  background: '#f8f9fa',
  outline: '#72796e',
  outlineVariant: '#c2c9bb',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a'
} as const;

export const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  marginMobile: '20px',
  marginDesktop: '40px',
  cardPaddingY: '12px',
  cardPaddingX: '24px'
} as const;

export const Typography = {
  fontFamilyBody: "'Inter', system-ui, sans-serif",
  fontFamilyDisplay: "'Montserrat', system-ui, sans-serif",
  displayLg: {
    fontSize: '48px',
    lineHeight: '56px',
    letterSpacing: '-0.02em',
    fontWeight: 800
  },
  headlineLg: {
    fontSize: '32px',
    lineHeight: '40px',
    letterSpacing: '-0.01em',
    fontWeight: 700
  },
  headlineLgMobile: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 700
  },
  headlineMd: {
    fontSize: '20px',
    lineHeight: '28px',
    fontWeight: 700
  },
  scoreDisplay: {
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: 800
  },
  bodyLg: {
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 400
  },
  bodyMd: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400
  },
  labelLg: {
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.05em',
    fontWeight: 600
  },
  labelMd: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500
  }
} as const;

export const Radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px'
} as const;

export const Shadows = {
  card: '0 4px 20px rgba(0, 0, 0, 0.04)',
  cardElevated: '0 8px 30px rgba(0, 0, 0, 0.08)',
  navbar: '0 1px 2px rgba(0, 0, 0, 0.06)'
} as const;

export const Breakpoints = {
  tablet: 768,
  desktop: 1024,
  maxContent: 1200
} as const;

export const Theme = {
  Colors,
  Spacing,
  Typography,
  Radii,
  Shadows,
  Breakpoints
} as const;

export type ThemeType = typeof Theme;
