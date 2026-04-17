import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0B',
        surface: '#161618',
        'surface-raised': '#1F1F23',
        border: '#2A2A2F',
        'border-accent': '#3D3D45',
        'text-primary': '#F5F5F7',
        'text-secondary': '#8E8E9A',
        orange: { DEFAULT: '#FF4713', muted: '#3D1A0A', hover: '#E63D0F' },
        teal: { DEFAULT: '#00C9A7', muted: '#003D33' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(148,163,184,0.12), 0 24px 64px -32px rgba(15,23,42,0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
