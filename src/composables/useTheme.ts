import { ref, onMounted, computed } from 'vue';
import { PurpleTheme, DarkPurpleTheme } from '@/theme';
import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

// Theme storage key
const THEME_STORAGE_KEY = 'siz-erp-theme';

// System preference detection
const getSystemPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Get stored theme preference
const getStoredTheme = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(THEME_STORAGE_KEY);
};

// Store theme preference
const storeTheme = (themeName: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, themeName);
};

export const useTheme = () => {
  const currentTheme = ref<ThemeTypes>(PurpleTheme);
  const isDark = ref<boolean>(false);

  // Apply theme to document
  const applyTheme = (theme: ThemeTypes) => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--color-${key}`, value);
      }
    });
    
    // Apply custom variables
    if (theme.variables) {
      Object.entries(theme.variables).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, String(value));
      });
    }
    
    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.name.toLowerCase()}`);
  };

  // Toggle theme
  const toggle = () => {
    const newTheme = isDark.value ? PurpleTheme : DarkPurpleTheme;
    currentTheme.value = newTheme;
    isDark.value = newTheme.dark;
    applyTheme(newTheme);
    storeTheme(newTheme.name);
  };

  // Set specific theme
  const setTheme = (themeName: string) => {
    const newTheme = themeName === 'DarkPurpleTheme' ? DarkPurpleTheme : PurpleTheme;
    currentTheme.value = newTheme;
    isDark.value = newTheme.dark;
    applyTheme(newTheme);
    storeTheme(newTheme.name);
  };

  // Reset to system preference
  const resetToSystem = () => {
    const systemPrefersDark = getSystemPreference();
    const newTheme = systemPrefersDark ? DarkPurpleTheme : PurpleTheme;
    currentTheme.value = newTheme;
    isDark.value = newTheme.dark;
    applyTheme(newTheme);
    localStorage.removeItem(THEME_STORAGE_KEY);
  };

  // Initialize theme
  onMounted(() => {
    const storedTheme = getStoredTheme();
    const systemPrefersDark = getSystemPreference();
    
    let initialTheme: ThemeTypes;
    
    if (storedTheme) {
      // Use stored preference
      initialTheme = storedTheme === 'DarkPurpleTheme' ? DarkPurpleTheme : PurpleTheme;
    } else {
      // Use system preference
      initialTheme = systemPrefersDark ? DarkPurpleTheme : PurpleTheme;
    }
    
    currentTheme.value = initialTheme;
    isDark.value = initialTheme.dark;
    applyTheme(initialTheme);
  });

  // Listen for system preference changes
  onMounted(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no stored preference
      if (!getStoredTheme()) {
        const newTheme = e.matches ? DarkPurpleTheme : PurpleTheme;
        currentTheme.value = newTheme;
        isDark.value = newTheme.dark;
        applyTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  });

  return {
    theme: currentTheme,
    isDark,
    toggle,
    setTheme,
    resetToSystem,
    themeName: computed(() => currentTheme.value.name)
  };
};
