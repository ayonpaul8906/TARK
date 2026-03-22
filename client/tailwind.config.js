/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0B0F19',
          cyan: '#00F5D4',
          purple: '#7B61FF',
          alert: '#FF4D4D',
          dark: '#060912',
          card: '#111827',
          border: '#1E2D45',
        },
      },
      fontFamily: {
        orbitron: ['Rajdhani', 'sans-serif'],
        inter: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-cyan': 'pulseCyan 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typing': 'typing 3.5s steps(40) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'glitch': 'glitch 0.5s ease infinite alternate',
      },
      keyframes: {
        pulseCyan: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glow: {
          from: { textShadow: '0 0 10px #00F5D4, 0 0 20px #00F5D4' },
          to: { textShadow: '0 0 20px #00F5D4, 0 0 40px #00F5D4, 0 0 60px #00F5D4' },
        },
        glitch: {
          '0%': { clipPath: 'inset(0 0 90% 0)', transform: 'translate(-2px, 0)' },
          '25%': { clipPath: 'inset(30% 0 50% 0)', transform: 'translate(2px, 0)' },
          '50%': { clipPath: 'inset(60% 0 20% 0)', transform: 'translate(-1px, 0)' },
          '75%': { clipPath: 'inset(80% 0 5% 0)', transform: 'translate(1px, 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)', transform: 'translate(0, 0)' },
        },
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(rgba(0,245,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.05) 1px, transparent 1px)",
        'radial-cyan': 'radial-gradient(ellipse at center, rgba(0,245,212,0.15) 0%, transparent 70%)',
        'radial-purple': 'radial-gradient(ellipse at center, rgba(123,97,255,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      boxShadow: {
        'cyber': '0 0 30px rgba(0,245,212,0.3)',
        'cyber-lg': '0 0 60px rgba(0,245,212,0.4)',
        'purple': '0 0 30px rgba(123,97,255,0.3)',
        'alert': '0 0 30px rgba(255,77,77,0.3)',
        'neo': '4px 4px 0px #00F5D4',
        'neo-purple': '4px 4px 0px #7B61FF',
        'glass': '0 8px 32px rgba(0,0,0,0.37)',
        'inset-glow': 'inset 0 0 20px rgba(0,245,212,0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderColor: {
        'cyber': '#00F5D4',
        'purple': '#7B61FF',
      },
    },
  },
  plugins: [],
}
