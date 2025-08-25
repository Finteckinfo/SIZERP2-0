# Theme System Documentation

This theme system provides a comprehensive solution for managing light and dark themes in your SIZ ERP application. It includes automatic theme switching, system preference detection, and persistent user preferences.

## 🎨 Available Themes

### Light Theme (`PurpleTheme`)
- **Primary**: Green (#39B84C)
- **Secondary**: Dark Blue (#02124C)
- **Background**: White (#ffffff)
- **Text**: Dark (#212121)

### Dark Theme (`DarkPurpleTheme`)
- **Primary**: Darker Green (#2d8a3a)
- **Secondary**: Very Dark Blue (#010d2e)
- **Background**: Dark (#121212)
- **Text**: White (#ffffff)

## 🚀 Quick Start

### 1. Import the Theme Hook

```tsx
import { useTheme } from '@/theme/useTheme';

function MyComponent() {
  const { isDark, toggle, theme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme.name}</p>
      <button onClick={toggle}>
        Switch to {isDark ? 'Light' : 'Dark'} mode
      </button>
    </div>
  );
}
```

### 2. Use the Theme Toggle Component

```tsx
import ThemeToggle from '@/components/ThemeToggle';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle size="medium" showLabel={true} />
    </header>
  );
}
```

### 3. Import CSS Variables

Add this to your main CSS file or component:

```tsx
import '@/theme/theme.css';
```

## 🎯 Usage Examples

### Basic Theme Switching

```tsx
import { useTheme } from '@/theme/useTheme';

function App() {
  const { isDark, toggle, themeName } = useTheme();
  
  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <h1>Welcome to SIZ ERP</h1>
      <p>Current theme: {themeName}</p>
      <button onClick={toggle}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Conditional Styling

```tsx
import { useTheme } from '@/theme/useTheme';

function Card({ children }) {
  const { isDark } = useTheme();
  
  return (
    <div 
      className={`
        card p-4 rounded-lg shadow-md
        ${isDark 
          ? 'bg-gray-800 text-white border-gray-600' 
          : 'bg-white text-gray-900 border-gray-200'
        }
      `}
    >
      {children}
    </div>
  );
}
```

### Using CSS Custom Properties

```css
.my-component {
  background-color: var(--color-surface);
  color: var(--color-darkText);
  border: 1px solid var(--color-borderLight);
}

.my-button {
  background-color: var(--color-primary);
  color: var(--color-on-surface-variant);
  box-shadow: var(--shadow-md);
}

.my-button:hover {
  background-color: var(--color-darkprimary);
  box-shadow: var(--shadow-lg);
}
```

## 🔧 Advanced Usage

### Manual Theme Control

```tsx
import { useTheme } from '@/theme/useTheme';

function ThemeSelector() {
  const { setTheme, resetToSystem } = useTheme();
  
  return (
    <div>
      <button onClick={() => setTheme('PurpleTheme')}>
        Light Theme
      </button>
      <button onClick={() => setTheme('DarkPurpleTheme')}>
        Dark Theme
      </button>
      <button onClick={resetToSystem}>
        System Default
      </button>
    </div>
  );
}
```

### Theme-Aware Components

```tsx
import { useTheme } from '@/theme/useTheme';

function ThemedButton({ variant = 'primary', children, ...props }) {
  const { theme } = useTheme();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          color: theme.colors['on-surface-variant']
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          color: theme.colors['on-surface-variant']
        };
      default:
        return {};
    }
  };
  
  return (
    <button 
      style={getVariantStyles()}
      className="px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90"
      {...props}
    >
      {children}
    </button>
  );
}
```

### Custom Theme Creation

```tsx
import { ThemeTypes } from '@/types/themeTypes/ThemeType';

const CustomTheme: ThemeTypes = {
  name: 'CustomTheme',
  dark: true,
  variables: {
    'border-color': '#ff6b6b',
    'carousel-control-size': 12
  },
  colors: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    // ... other colors
  }
};
```

## 🎨 Color Palette Reference

### Primary Colors
- `primary`: Main brand color
- `primary200`: Lighter variant of primary
- `darkprimary`: Darker variant of primary

### Secondary Colors
- `secondary`: Secondary brand color
- `secondary200`: Lighter variant of secondary
- `darksecondary`: Darker variant of secondary

### Status Colors
- `success`: Success states
- `warning`: Warning states
- `error`: Error states
- `info`: Information states
- `accent`: Accent/highlight color

### Background Colors
- `surface`: Main surface color
- `containerBg`: Container background
- `background`: Page background

### Text Colors
- `darkText`: Primary text color
- `lightText`: Secondary text color

### Border Colors
- `borderLight`: Light borders
- `inputBorder`: Input field borders

## 🔄 Theme Persistence

The theme system automatically:
- Saves user preferences to localStorage
- Detects system color scheme preferences
- Provides smooth transitions between themes
- Maintains theme state across page reloads

## 🎭 CSS Classes

The system automatically applies theme classes to the body element:
- `.theme-purpletheme` for light theme
- `.theme-darkpurpletheme` for dark theme

## 🚨 Best Practices

1. **Use CSS Custom Properties**: Always use `var(--color-*)` instead of hardcoded colors
2. **Test Both Themes**: Ensure your components look good in both light and dark modes
3. **Smooth Transitions**: The system provides automatic transitions, but you can customize them
4. **Accessibility**: Ensure sufficient contrast ratios in both themes
5. **Consistent Naming**: Use semantic color names like `--color-surface` instead of `--color-white`

## 🐛 Troubleshooting

### Theme Not Switching
- Check if the CSS file is imported
- Verify the `useTheme` hook is used in a component
- Check browser console for errors

### Colors Not Updating
- Ensure you're using CSS custom properties
- Check if the theme class is applied to the body
- Verify the color names match the theme structure

### Performance Issues
- The theme system is optimized for performance
- CSS transitions are hardware-accelerated
- Theme switching happens instantly with smooth animations

## 📚 Additional Resources

- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Dark Mode Best Practices](https://web.dev/prefers-color-scheme/)
- [Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
