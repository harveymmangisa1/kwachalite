import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],

  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#ffffff',
      
      // Grayscale palette
      gray: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a',
      },
      
      // Simplified semantic colors using grayscale
      border: 'hsl(0, 0%, 89%)',
      input: 'hsl(0, 0%, 89%)',
      ring: 'hsl(0, 0%, 63%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(0, 0%, 9%)',
      
      primary: {
        DEFAULT: 'hsl(0, 0%, 9%)',
        foreground: 'hsl(0, 0%, 98%)',
      },
      secondary: {
        DEFAULT: 'hsl(0, 0%, 96%)',
        foreground: 'hsl(0, 0%, 9%)',
      },
      muted: {
        DEFAULT: 'hsl(0, 0%, 96%)',
        foreground: 'hsl(0, 0%, 45%)',
      },
      accent: {
        DEFAULT: 'hsl(0, 0%, 96%)',
        foreground: 'hsl(0, 0%, 9%)',
      },
      card: {
        DEFAULT: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(0, 0%, 9%)',
      },
    },
    extend: {
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
  ],
} satisfies Config;

export default config;