// Design Tokens - Turma Pantera
// Centralized design system tokens for consistent UI

export const colors = {
  // Primary palette
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary (cyan/sky)
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Accent (purple)
  accent: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  
  // Semantic colors
  success: {
    light: '#86efac',
    DEFAULT: '#22c55e',
    dark: '#16a34a',
  },
  warning: {
    light: '#fde047',
    DEFAULT: '#eab308',
    dark: '#ca8a04',
  },
  error: {
    light: '#fca5a5',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#93c5fd',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },
  
  // Neutral scale
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
}

// Dark theme specific colors
export const darkTheme = {
  // Backgrounds
  bg: {
    primary: '#030712',      // Main background
    secondary: '#08101f',    // Card/panel background
    tertiary: '#0f172a',     // Elevated surfaces
    overlay: 'rgba(2, 6, 23, 0.8)',
  },
  
  // Glass effect
  glass: {
    bg: 'rgba(10, 20, 44, 0.52)',
    bgStrong: 'rgba(8, 15, 36, 0.76)',
    border: 'rgba(125, 180, 255, 0.24)',
  },
  
  // Text
  text: {
    primary: '#eff6ff',
    secondary: 'rgba(191, 219, 254, 0.82)',
    muted: 'rgba(148, 163, 184, 0.9)',
    inverse: '#0f172a',
  },
  
  // Gradients
  gradient: {
    primary: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
    hero: 'radial-gradient(circle at top, rgba(59,130,246,0.22), transparent 28%), radial-gradient(circle at 85% 20%, rgba(56,189,248,0.14), transparent 24%), linear-gradient(180deg, #030712 0%, #08101f 45%, #050b16 100%)',
    glass: 'radial-gradient(circle at top, rgba(96,165,250,0.18), transparent 55%), linear-gradient(180deg, rgba(15,23,42,0.44), rgba(15,23,42,0.1))',
  },
}

// Light theme specific colors
export const lightTheme = {
  // Backgrounds
  bg: {
    primary: '#f8fafc',
    secondary: '#ffffff',
    tertiary: '#f1f5f9',
    overlay: 'rgba(248, 250, 252, 0.9)',
  },
  
  // Glass effect (adjusted for light)
  glass: {
    bg: 'rgba(255, 255, 255, 0.72)',
    bgStrong: 'rgba(241, 245, 249, 0.9)',
    border: 'rgba(148, 163, 184, 0.3)',
  },
  
  // Text
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#64748b',
    inverse: '#f8fafc',
  },
  
  // Gradients
  gradient: {
    primary: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
    hero: 'radial-gradient(circle at top, rgba(59,130,246,0.12), transparent 28%), radial-gradient(circle at 85% 20%, rgba(56,189,248,0.08), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 45%, #e2e8f0 100%)',
    glass: 'radial-gradient(circle at top, rgba(96,165,250,0.12), transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.8), rgba(241,245,249,0.6))',
  },
}

// Spacing scale (in rem)
export const spacing = {
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
}

// Typography
export const typography = {
  fontFamily: {
    sans: "'Nunito', system-ui, sans-serif",
    display: "'Cinzel', serif",
    mono: "'JetBrains Mono', monospace",
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],// 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
}

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  DEFAULT: '0.5rem', // 8px
  md: '0.625rem',   // 10px
  lg: '0.75rem',    // 12px
  xl: '0.875rem',   // 14px
  '2xl': '1rem',    // 16px
  '3xl': '1.125rem', // 18px
  full: '9999px',
}

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Glass shadows
  glass: '0 14px 40px rgba(2, 6, 23, 0.52), 0 0 0 1px rgba(148, 163, 184, 0.04), inset 0 1px 0 rgba(255,255,255,0.08)',
  glassHover: '0 18px 48px rgba(2, 6, 23, 0.58), 0 0 30px rgba(59,130,246,0.12)',
  
  // Glow
  glow: {
    primary: '0 0 20px rgba(59, 130, 246, 0.5)',
    secondary: '0 0 20px rgba(14, 165, 233, 0.5)',
    accent: '0 0 20px rgba(139, 92, 246, 0.5)',
    success: '0 0 20px rgba(34, 197, 94, 0.5)',
    error: '0 0 20px rgba(239, 68, 68, 0.5)',
  },
}

// Transitions
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  DEFAULT: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
}

// Z-index scale
export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
}

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Animation durations
export const animation = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
}

// Export all tokens
export const tokens = {
  colors,
  darkTheme,
  lightTheme,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  animation,
}

export default tokens
