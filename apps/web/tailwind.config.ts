import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#13ec80',
        'background-dark': '#11221a',
        'surface-dark': '#1a332a',
        'surface-darker': '#0d1b14',
        'accent-green': '#234836',
        'border-dark': '#234836',
        'text-secondary': '#92c9ad',
        danger: '#ff5a5f',
        warning: '#ff9f1c',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
