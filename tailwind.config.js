const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Add ./app if using App Router in the future
  ],
  theme: {
    extend: {
      fontFamily: {
        // Add Inter to the sans-serif stack
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      // Add custom primary color based on logo
      colors: {
        primary: {
          DEFAULT: '#F97316', // orange-500
          '50': '#FFF7ED',
          '100': '#FFEDD5',
          '200': '#FED7AA',
          '300': '#FDBA74',
          '400': '#FB923C',
          '500': '#F97316',
          '600': '#EA580C',
          '700': '#C2410C',
          '800': '#9A3412',
          '900': '#7C2D12',
          '950': '#431407'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Ensure typography plugin is included
    require('@tailwindcss/forms'), // Might be needed for form styling
    // Ensure Aspect Ratio plugin is included if you use aspect-* classes
    require('@tailwindcss/aspect-ratio'), 
  ],
} 