export { PurpleTheme } from './LightTheme';
export { DarkPurpleTheme } from './DarkTheme';

// Theme selector helper
export const themes = {
  light: 'PurpleTheme',
  dark: 'DarkPurpleTheme'
} as const;

export type ThemeMode = keyof typeof themes;
