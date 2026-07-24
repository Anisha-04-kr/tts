/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36b0fa',
          500: '#0c94eb',
          600: '#0F4C81', // Medical Deep Blue
          700: '#093a65',
          800: '#0c3253',
          900: '#102b46',
          950: '#0a1b2d',
        },
        medical: {
          blue: '#0F4C81',
          lightBlue: '#36b0fa',
          bgLight: '#f4f7fb',
          bgDark: '#080c14',
          cardLight: '#ffffff',
          cardDark: '#0f172a',
          accent: '#10b981',
        },
        slate: {
          950: '#090d16',
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(15, 76, 129, 0.05)',
        'healthcare': '0 10px 30px -5px rgba(15, 76, 129, 0.08)',
        'healthcare-dark': '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(12, 148, 235, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s infinite ease-in-out',
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        }
      }
    },
  },
  plugins: [],
}

