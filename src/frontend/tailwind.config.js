/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './ui/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Chakra Petch"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
