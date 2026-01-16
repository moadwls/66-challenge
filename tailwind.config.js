/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF4D00',
          'orange-dark': '#CC3D00',
          black: '#0a0a0a',
        },
        dark: {
          bg: '#1a1a1a',
          surface: '#2a2a2a',
          border: '#3a3a3a',
          text: '#e5e5e5',
          muted: '#999999',
        },
      },
      fontFamily: {
        'geist-mono': ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
