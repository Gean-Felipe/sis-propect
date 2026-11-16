/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38aaf8',
          500: '#0e8ee9',
          600: '#0270c7',
          700: '#0359a1',
          800: '#074c85',
          900: '#0c3f6e',
          950: '#082849',
        },
        surface: {
          dark: '#0B0F19',
          card: '#111827',
          cardHover: '#1F2937',
          border: '#1F293D',
          borderLight: '#374151',
          muted: '#9CA3AF'
        }
      },
    },
  },
  plugins: [],
};
