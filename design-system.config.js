/**
 * KwachaLite Design System
 * Modern, Mobile-First, Corporate with Personality
 * 
 * Color Philosophy:
 * - Professional but not boring
 * - Subtle colors, not overwhelming
 * - Trust-building through consistency
 * - Personality through micro-interactions
 */

module.exports = {
    theme: {
        extend: {
            colors: {
                // Primary Brand Colors - Sophisticated Blue-Gray
                primary: {
                    50: '#f0f4f8',
                    100: '#d9e2ec',
                    200: '#bcccdc',
                    300: '#9fb3c8',
                    400: '#829ab1',
                    500: '#627d98',  // Main brand color
                    600: '#486581',
                    700: '#334e68',
                    800: '#243b53',
                    900: '#102a43',
                },

                // Accent - Warm Coral (for CTAs and highlights)
                accent: {
                    50: '#fff5f3',
                    100: '#ffe5e0',
                    200: '#ffc9bd',
                    300: '#ffa894',
                    400: '#ff8a75',
                    500: '#ff6b4a',  // Main accent
                    600: '#e85d3f',
                    700: '#c74d34',
                    800: '#a23f2a',
                    900: '#7d3121',
                },

                // Success - Calm Green
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',  // Main success
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },

                // Warning - Amber
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',  // Main warning
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },

                // Error - Soft Red
                error: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',  // Main error
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },

                // Neutral - Warm Gray (more personality than pure gray)
                neutral: {
                    50: '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                },

                // Background colors
                background: {
                    DEFAULT: '#ffffff',
                    secondary: '#fafaf9',
                    tertiary: '#f5f5f4',
                },

                // Text colors
                text: {
                    primary: '#1c1917',
                    secondary: '#57534e',
                    tertiary: '#a8a29e',
                    inverse: '#ffffff',
                },

                // Border colors
                border: {
                    DEFAULT: '#e7e5e4',
                    light: '#f5f5f4',
                    dark: '#d6d3d1',
                },
            },

            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
            },

            fontSize: {
                // Mobile-first typography scale
                'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
                'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
                '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
                '5xl': ['3rem', { lineHeight: '1' }],           // 48px
                '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
            },

            spacing: {
                // Consistent spacing scale
                '18': '4.5rem',   // 72px
                '88': '22rem',    // 352px
                '128': '32rem',   // 512px
            },

            borderRadius: {
                'sm': '0.25rem',   // 4px
                DEFAULT: '0.5rem', // 8px
                'md': '0.5rem',    // 8px
                'lg': '0.75rem',   // 12px
                'xl': '1rem',      // 16px
                '2xl': '1.5rem',   // 24px
                '3xl': '2rem',     // 32px
            },

            boxShadow: {
                // Subtle, professional shadows
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                'none': 'none',

                // Custom shadows for specific use cases
                'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
                'button': '0 1px 3px rgba(0, 0, 0, 0.12)',
                'button-hover': '0 2px 6px rgba(0, 0, 0, 0.16)',
            },

            animation: {
                // Smooth, professional animations
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },

            transitionDuration: {
                '0': '0ms',
                '75': '75ms',
                '100': '100ms',
                '150': '150ms',
                '200': '200ms',
                '300': '300ms',
                '500': '500ms',
                '700': '700ms',
                '1000': '1000ms',
            },
        },
    },

    // Component-specific styles
    components: {
        // Card styles
        card: {
            base: 'bg-white rounded-xl shadow-card border border-border',
            hover: 'hover:shadow-card-hover transition-shadow duration-200',
            interactive: 'cursor-pointer hover:shadow-card-hover hover:border-primary-200 transition-all duration-200',
        },

        // Button styles
        button: {
            base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
            primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-button hover:shadow-button-hover',
            secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500',
            accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500 shadow-button hover:shadow-button-hover',
            ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
            danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',

            // Sizes
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        },

        // Input styles
        input: {
            base: 'block w-full rounded-lg border border-border bg-white px-4 py-2.5 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200',
            error: 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
        },

        // Badge styles
        badge: {
            base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            primary: 'bg-primary-100 text-primary-800',
            success: 'bg-success-100 text-success-800',
            warning: 'bg-warning-100 text-warning-800',
            error: 'bg-error-100 text-error-800',
            neutral: 'bg-neutral-100 text-neutral-800',
        },
    },
};
