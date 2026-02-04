import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import { colors as customColors } from './src/lib/colors';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    // 1. Container: Good as is, but added a cleaner screen set
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // 2. Colors: Use 'extend' so you don't lose default tailwind colors (blue, red, etc.)
      colors: {
        // Your Brand Palette
        brand: {
          primary: customColors.primary,
          accent: customColors.accent,
          success: customColors.success,
          warning: customColors.warning,
          error: customColors.error,
        },
        // Shadcn/UI Semantic Tokens (Mapping to your colors.ts)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: customColors.primary[500],
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: customColors.primary[600],
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: customColors.neutral[100],
          foreground: customColors.neutral[900],
        },
        destructive: {
          DEFAULT: customColors.error,
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: customColors.neutral[100],
          foreground: customColors.neutral[500],
        },
        accent: {
          DEFAULT: customColors.accent[100],
          foreground: customColors.accent[900],
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: customColors.neutral[900],
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: customColors.neutral[900],
        },
      },
      // 3. Typography: Added tracking and optimized font stacks
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // 4. Custom Shadows: Optimized for a "SaaS" feel
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card': '0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      // 5. Animations: Added missing shadcn defaults
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;