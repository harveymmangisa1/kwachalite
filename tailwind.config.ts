import type { Config } from 'tailwindcss';

const config = {
  // --- Dark Mode & Content: Keep as is, they are standard and good practice.
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],

  // --- Safelist: Removed the generic/potentially slow regex for better alternatives.
  // safelist: [
  //   {
  //     pattern: /grid-cols-./, // Removed: Better to list specific values if possible, or use the JIT engine.
  //   },
  // ],
  
  prefix: '',
  theme: {
    // --- Container: Keep as is, a standard responsive setup.
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // 🎨 Colors: Added an optional 'muted' version for the primary color.
      colors: {
        // Standard UI Colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          muted: 'hsl(var(--primary-muted))',
          light: 'hsl(var(--primary-light))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // ... (Destructive, Muted, Accent, Popover, Card are kept as is) ...
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Status Colors: Improved foreground names for consistency.
        success: {
          DEFAULT: 'hsl(var(--success))',
          // 💡 IMPROVED: Renamed to standard 'foreground' for consistency with other colors.
          foreground: 'hsl(var(--success-foreground))', 
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          // 💡 IMPROVED: Renamed to standard 'foreground'.
          foreground: 'hsl(var(--error-foreground))', 
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          // 💡 IMPROVED: Renamed to standard 'foreground'.
          foreground: 'hsl(var(--warning-foreground))', 
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          // 💡 IMPROVED: Renamed to standard 'foreground'.
          foreground: 'hsl(var(--info-foreground))', 
        },
        
        // Chart Colors: Kept as is, useful for data visualization.
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      
      // 📐 Border Radius: Good standard setup.
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // 🖼️ Keyframes & Animations: Added a useful 'pulse-once' animation.
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-from-right-5': {
          from: { transform: 'translateX(5%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        // ✨ NEW: Utility keyframe for highlighting updates (e.g., a new item in a list)
        'pulse-once': { 
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        // ✨ NEW: Shimmer animation for loading states
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-in-from-right-5': 'slide-in-from-right-5 0.3s ease-in-out',
        // ✨ NEW: Animation mapping for the new keyframe
        'pulse-once': 'pulse-once 0.5s ease-in-out 1',
        'shimmer': 'shimmer 2s infinite', 
      },
      
      // 💡 NEW: Added custom spacing for more flexible layouts
      spacing: {
        '18': '4.5rem', // Adds a size between 4rem (16) and 5rem (20)
        '128': '32rem', // Large spacing utility
        '144': '36rem', // Extra large spacing utility
      },
      
      // 💡 NEW: Added a custom font family for better typography control
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'], // Assumes you've defined a CSS var for your primary font
        heading: ['var(--font-heading)', 'sans-serif'], // For a distinct font for headings
      },
      
      // ✨ NEW: Enhanced animation utilities
      animationDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      
      // ✨ NEW: Custom spacing for responsive design
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
} satisfies Config;

export default config;