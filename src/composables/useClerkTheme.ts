import { computed } from 'vue';
import { useTheme } from './useTheme';
import { shadcn, dark } from '@clerk/themes';

export const useClerkTheme = () => {
  const { isDark } = useTheme();

  const clerkAppearance = computed(() => {
    if (isDark.value) {
      return {
        baseTheme: dark,
        variables: {
          colorPrimary: '#5BC85B',
          colorBackground: 'transparent',
          colorInputBackground: 'transparent',
          colorText: '#ffffff',
          colorTextSecondary: '#b0b0b0',
          colorCardBackground: 'transparent',
          colorInputBorder: 'rgba(255, 255, 255, 0.2)',
          fontSize: '14px',
        },
        elements: {
          formFieldLabelRow: {
            fontSize: '14px',
            fontWeight: '500',
          },
          formFieldOptionalLabel: {
            fontSize: '10px',
            opacity: '0.5',
          },
        },
      };
    } else {
      return {
        baseTheme: dark,
        variables: {
          colorPrimary: '#5BC85B',
          colorBackground: 'transparent',
          colorInputBackground: 'transparent',
          colorText: '#212121',
          colorTextSecondary: '#616161',
          colorCardBackground: 'transparent',
          colorInputBorder: 'rgba(0, 0, 0, 0.2)',
          fontSize: '14px',
        },
        elements: {
          formFieldLabelRow: {
            fontSize: '14px',
            fontWeight: '500',
          },
          formFieldOptionalLabel: {
            fontSize: '10px',
            opacity: '0.5',
          },
        },
      };
    }
  });

  return {
    clerkAppearance,
  };
};
