/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6fc',
          100: '#e1eef9',
          200: '#c7e0f4',
          300: '#9ec9eb',
          400: '#6eaedc',
          500: '#5c8db8', // Main steel blue
          600: '#3e76a6',
          700: '#315f87',
          800: '#2c4f6f',
          900: '#29435d',
          primary: '#5c8db8',
          hover: '#4a7ea8',
          lightBg: '#eef5fc',
          border: '#d2e3f3'
        }
      }
    },
  },
  plugins: [],
}
