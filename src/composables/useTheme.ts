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

export const useTheme = () => {
  const isDark = ref<boolean>(false);

  // Toggle theme
  const toggle = () => {
    isDark.value = !isDark.value;
    storeTheme(isDark.value);
    
    // Apply theme immediately to DOM
    if (isDark.value) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
      document.documentElement.style.setProperty('--page-background', '#101828');
      document.documentElement.style.setProperty('--text-color', '#ffffff');
      document.body.style.backgroundColor = '#101828';
      document.documentElement.style.backgroundColor = '#101828';
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.style.removeProperty('--page-background');
      document.documentElement.style.removeProperty('--text-color');
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    }
    
    // Force a reflow to ensure CSS changes are applied immediately
    document.body.offsetHeight;
  };

  // Set specific theme
  const setTheme = (darkMode: boolean) => {
    isDark.value = darkMode;
    storeTheme(isDark.value);
    
    // Apply theme immediately to DOM
    if (isDark.value) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
      document.documentElement.style.setProperty('--page-background', '#101828');
      document.documentElement.style.setProperty('--text-color', '#ffffff');
      document.body.style.backgroundColor = '#101828';
      document.documentElement.style.backgroundColor = '#101828';
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.style.removeProperty('--page-background');
      document.documentElement.style.removeProperty('--text-color');
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    }
    
    // Force a reflow to ensure CSS changes are applied immediately
    document.body.offsetHeight;
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
      document.documentElement.style.setProperty('--page-background', '#101828');
      document.documentElement.style.setProperty('--text-color', '#ffffff');
      document.body.style.backgroundColor = '#101828';
      document.documentElement.style.backgroundColor = '#101828';
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.style.removeProperty('--page-background');
      document.documentElement.style.removeProperty('--text-color');
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    }
  });

  return {
    isDark,
    toggle,
    setTheme,
    resetToSystem
  };
};
