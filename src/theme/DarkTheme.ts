import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const DarkPurpleTheme: ThemeTypes = {
  name: 'DarkPurpleTheme',
  dark: true,
  variables: {
    'border-color': '#2d8a3a',
    'carousel-control-size': 10
  },
  colors: {
    // Primary colors - darker shades
    primary: '#2d8a3a',
    primary200: '#5a9e5a',
    
    // Secondary colors - darker shades
    secondary: '#010d2e',
    secondary200: '#2a3a6a',
    
    // Status colors - adjusted for dark theme
    info: '#0288d1',
    success: '#00a843',
    accent: '#e67e22',
    warning: '#f57c00',
    error: '#d32f2f',
    
    // Light variants - much darker for dark theme
    lightprimary: '#1a3d1a',
    lightsecondary: '#1a1a2e',
    lightsuccess: '#1a3d1a',
    lighterror: '#3d1a1a',
    lightwarning: '#3d2e1a',
    
    // Dark variants - even darker
    darkprimary: '#1a4d1a',
    darksecondary: '#000814',
    
    // Text colors - inverted for dark theme
    darkText: '#ffffff',
    lightText: '#b0b0b0',
    
    // Border colors - darker
    borderLight: '#404040',
    inputBorder: '#555555',
    
    // Background colors - dark
    containerBg: '#1a1a1a',
    surface: '#2d2d2d',
    background: '#121212',
    'on-surface-variant': '#e0e0e0',
    
    // Social media colors - slightly muted
    facebook: '#3a5a9a',
    twitter: '#1a8cd8',
    linkedin: '#0d5a8a',
    
    // Gray scale - dark theme appropriate
    gray100: '#2a2a2a'
  }
};

export { DarkPurpleTheme };
