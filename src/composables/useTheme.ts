import { ref, onMounted } from 'vue';

// Theme storage key
const THEME_STORAGE_KEY = 'siz-erp-theme';

// System preference detection
const getSystemPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Get stored theme preference
const getStoredTheme = (): boolean | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === null) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading stored theme:', error);
    return null;
  }
};

// Store theme preference
const storeTheme = (isDarkMode: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDarkMode));
  } catch (error) {
    console.error('Error storing theme:', error);
  }
};

// Global theme state - singleton pattern
let globalThemeState: ReturnType<typeof createThemeState> | null = null;

function createThemeState() {
  const isDark = ref<boolean>(false);

  // Toggle theme - optimized for performance
  const toggle = () => {
    isDark.value = !isDark.value;
    storeTheme(isDark.value);
    applyTheme(isDark.value);
  };

  // Set specific theme
  const setTheme = (darkMode: boolean) => {
    isDark.value = darkMode;
    storeTheme(isDark.value);
    applyTheme(darkMode);
  };

  // Apply theme to DOM - optimized function
  const applyTheme = (darkMode: boolean) => {
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      if (darkMode) {
        document.body.classList.add('dark-theme');
        document.documentElement.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
        document.documentElement.classList.remove('dark-theme');
      }
    });
  };

  // Reset to system preference
  const resetToSystem = () => {
    const systemPrefersDark = getSystemPreference();
    setTheme(systemPrefersDark);
    localStorage.removeItem(THEME_STORAGE_KEY);
  };

  // Initialize theme
  onMounted(() => {
    const storedTheme = getStoredTheme();
    const systemPrefersDark = getSystemPreference();
    
    let initialTheme: boolean;
    
    if (storedTheme !== null) {
      // Use stored preference
      initialTheme = storedTheme;
    } else {
      // Use system preference
      initialTheme = systemPrefersDark;
    }
    
    isDark.value = initialTheme;
    
    // Apply theme immediately to DOM
    if (isDark.value) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  });

  return {
    isDark,
    toggle,
    setTheme,
    resetToSystem
  };
}

export const useTheme = () => {
  if (!globalThemeState) {
    globalThemeState = createThemeState();
  }
  return globalThemeState;
};
