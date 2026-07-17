/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#050303',
        'bg-secondary': '#0a0808',
        'bg-terminal': '#0a0a0f',
        'text-primary': '#e8ddd0',
        'text-secondary': '#a89b8c',
        'accent-red': '#cc1100',
        'accent-red-glow': '#ff2200',
        'accent-red-dark': '#550000',
        'accent-green': '#00ff41',
        'accent-green-dim': '#00aa2a',
        'border': '#2a1a1a',
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
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 3s infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
      },
    },
  },
  plugins: [],
}