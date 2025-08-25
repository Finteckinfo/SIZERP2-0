import { PurpleTheme, DarkPurpleTheme } from './index';
import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

// Theme registry
export const themeRegistry: Record<string, ThemeTypes> = {
  PurpleTheme,
  DarkPurpleTheme
};

// Get theme by name
export const getTheme = (themeName: string): ThemeTypes => {
  return themeRegistry[themeName] || PurpleTheme;
};

// Get current theme based on dark mode preference
export const getCurrentTheme = (isDark: boolean): ThemeTypes => {
  return isDark ? DarkPurpleTheme : PurpleTheme;
};

// Color utility functions
export const getColor = (theme: ThemeTypes, colorKey: keyof ThemeTypes['colors']): string => {
  return theme.colors[colorKey] || '#000000';
};

// Generate CSS custom properties from theme
export const generateCSSVariables = (theme: ThemeTypes): Record<string, string> => {
  const cssVars: Record<string, string> = {};
  
  // Add color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (value) {
      cssVars[`--color-${key}`] = value;
    }
  });
  
  // Add custom variables
  if (theme.variables) {
    Object.entries(theme.variables).forEach(([key, value]) => {
      cssVars[`--${key}`] = String(value);
    });
  }
  
  return cssVars;
};

// Apply theme to document root
export const applyTheme = (theme: ThemeTypes): void => {
  const root = document.documentElement;
  const cssVars = generateCSSVariables(theme);
  
  Object.entries(cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  // Add theme class to body
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${theme.name.toLowerCase()}`);
};

// Theme toggle function
export const toggleTheme = (currentTheme: ThemeTypes): ThemeTypes => {
  return currentTheme.dark ? PurpleTheme : DarkPurpleTheme;
};

// Get contrasting text color for a background color
export const getContrastTextColor = (backgroundColor: string): string => {
  // Simple contrast calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// Validate theme object
export const validateTheme = (theme: ThemeTypes): boolean => {
  return !!(
    theme.name &&
    typeof theme.dark === 'boolean' &&
    theme.colors &&
    Object.keys(theme.colors).length > 0
  );
};
