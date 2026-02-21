/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        g: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
          300: '#86efac', 400: '#4ade80', 500: '#22c55e',
          glow: '#00ff88',
        }
      },
      fontFamily: {
        display: ['Cinzel','Georgia','serif'],
        body: ['Nunito','system-ui','sans-serif'],
        mono: ['JetBrains Mono','monospace'],
      },
      animation: {
        'ff': 'ff 6s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'fadeUp': 'fadeUp 0.6s ease both',
        'popIn': 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      },
      keyframes: {
        ff: { '0%,100%': {opacity:'.4',transform:'translateY(0)'}, '50%': {opacity:'1',transform:'translateY(-15px)'} },
        breathe: { '0%,100%': {transform:'scale(1)',opacity:'.8'}, '50%': {transform:'scale(1.05)',opacity:'1'} },
        glow: { '0%,100%': {filter:'drop-shadow(0 0 6px #00ff88)'}, '50%': {filter:'drop-shadow(0 0 18px #00ff88) drop-shadow(0 0 35px #00ff8855)'} },
        fadeUp: { from:{opacity:'0',transform:'translateY(20px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        popIn: { from:{opacity:'0',transform:'scale(0.8) translateY(20px)'}, to:{opacity:'1',transform:'scale(1) translateY(0)'} },
      }
    },
  },
  plugins: [],
}
