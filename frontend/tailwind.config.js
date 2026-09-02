/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: 'oklch(14% 0.008 40)',
          1: 'oklch(18% 0.010 40)',
          2: 'oklch(22% 0.010 40)',
          3: 'oklch(26% 0.010 40)',
        },
        border: {
          DEFAULT: 'oklch(28% 0.008 40)',
          light: 'oklch(35% 0.006 40)',
        },
        accent: {
          DEFAULT: '#6366f1',
          soft: 'oklch(65% 0.15 265)',
        },
        muted: 'oklch(72% 0.006 40)',
        ink: 'oklch(94% 0.006 80)',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Geist"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        glass: '0 2px 10px oklch(0% 0 0 / 0.3), 0 0 0 1px oklch(0% 0 0 / 0.5) inset, 0 0 0 3px oklch(100% 0 0 / 0.02) inset',
        card: '0 1px 3px oklch(0% 0 0 / 0.2)',
        'card-hover': '0 4px 12px oklch(0% 0 0 / 0.25)',
        glow: '0 0 0 3px oklch(65% 0.15 265 / 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(.16,1,.3,1) forwards',
        'slide-up': 'slide-up 0.5s cubic-bezier(.16,1,.3,1) forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(.16,1,.3,1) forwards',
      },
    },
  },
  plugins: [],
}
