import { ref, onMounted, nextTick } from 'vue';

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

export const useTheme = () => {
  const isDark = ref<boolean>(false);

  // Apply theme to DOM
  const applyTheme = (darkMode: boolean) => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Force a reflow to ensure CSS changes are applied immediately
    document.body.offsetHeight;
    
    // Trigger a custom event for components to listen to
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { isDark: darkMode } 
    }));
  };

  // Toggle theme
  const toggle = async () => {
    isDark.value = !isDark.value;
    storeTheme(isDark.value);
    
    // Apply theme immediately to DOM
    applyTheme(isDark.value);
    
    // Force Vue to update
    await nextTick();
  };

  // Set specific theme
  const setTheme = async (darkMode: boolean) => {
    isDark.value = darkMode;
    storeTheme(isDark.value);
    
    // Apply theme immediately to DOM
    applyTheme(isDark.value);
    
    // Force Vue to update
    await nextTick();
  };

  // Reset to system preference
  const resetToSystem = async () => {
    const systemPrefersDark = getSystemPreference();
    await setTheme(systemPrefersDark);
    localStorage.removeItem(THEME_STORAGE_KEY);
  };

  // Initialize theme
  onMounted(async () => {
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
    applyTheme(isDark.value);
    
    // Force Vue to update
    await nextTick();
  });

  return {
    isDark,
    toggle,
    setTheme,
    resetToSystem
  };
};
