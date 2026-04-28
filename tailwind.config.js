/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FAFAF9',
        'bg-secondary': '#F5F5F4',
        'text-primary': '#1C1917',
        'text-secondary': '#78716C',
        'accent': '#E2A3AD',
        'accent-hover': '#A4697B',
        'border': '#E7E5E4',
      },
      fontFamily: {
        'serif': ['Noto Serif SC', 'Georgia', 'serif'],
        'sans': ['Source Sans 3', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        'content': '1920px',
        'page': '1920px',
      },
    },
  },
  plugins: [],
}