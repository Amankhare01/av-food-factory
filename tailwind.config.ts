import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        nawab: {
          emerald: '#0f766e',
          emeraldDeep: '#0b5a54',
          ivory: '#f8f7f3',
          gold: '#c28f2c',
          ink: '#0a0f0d'
        }
      },
      fontFamily: {
        heading: ['var(--font-marcellus)'],
        body: ['var(--font-inter)']
      },
      dropShadow: {
        glow: '0 8px 24px rgba(194,143,44,0.25)'
      }
    }
  },
  plugins: []
} satisfies Config;
