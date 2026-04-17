import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#020617',
          900: '#0d172f',
          800: '#15203f',
          700: '#24335e',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(148,163,184,0.12), 0 24px 64px -32px rgba(15,23,42,0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
