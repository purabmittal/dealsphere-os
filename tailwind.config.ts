import type { Config } from 'tailwindcss';

// DealSphere OS design tokens.
// Main app: navy/light corporate palette with a restrained warm-gold accent.
// Careers module: violet/purple identity, scoped only to /careers routes via the `careers` variant.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Main OS palette
        surface: '#FAFBFC',
        'surface-raised': '#FFFFFF',
        border: '#E4E9F0',
        ink: {
          900: '#0B1E3D', // deep navy - primary text / brand
          700: '#1E3A5F',
          500: '#4A6485',
          300: '#8A9BB3',
        },
        accent: {
          DEFAULT: '#1E5FA8', // lighter blue accent
          hover: '#174B87',
          soft: '#EAF2FB',
        },
        gold: {
          DEFAULT: '#B08D4A', // subtle warm-gold highlight, used sparingly
          soft: '#F7F1E4',
        },
        // Careers module palette (purple identity) - only used under /careers
        careers: {
          DEFAULT: '#5B21B6', // royal purple
          deep: '#3B0F70', // deep violet
          electric: '#8B5CF6', // electric purple accent
          lavender: '#EDE7FA',
        },
        success: '#1E7A4C',
        warning: '#B7791F',
        danger: '#B3261E',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
