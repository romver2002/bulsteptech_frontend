/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI Variable', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Replacing discord colors with a premium, vibrant dark mode palette
        discord: {
          'primary': '#080a10',
          'secondary': '#111621',
          'dark': '#06080d',
          'dark-hover': '#1a2030',
          'accent': '#826cf6',
          'accent-hover': '#9d8cff',
          'success': '#53d2a5',
          'warning': '#e8bb71',
          'error': '#ef7185',
          'text-light': '#f6f5fb',
          'text-gray': '#858b9c',
        },
        primary: '#826cf6',
        secondary: '#53d2a5',
        tertiary: '#78a6ff',
      },
      boxShadow: {
        'glow': '0 12px 32px rgba(83, 58, 190, 0.24)',
        'glow-lg': '0 20px 50px rgba(83, 58, 190, 0.3)',
        'glow-success': '0 14px 36px rgba(53, 170, 130, 0.2)',
        'glass': '0 24px 70px rgba(0, 0, 0, 0.26)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.005) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
