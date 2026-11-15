/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Broadcast-studio palette
        night: '#120E1C',
        studio: '#1B1530',
        'studio-2': '#241C3D',
        line: '#332A4D',
        paper: '#F4EBDD',
        'paper-2': '#E4D6BE',
        onair: '#FF3D3D',
        reference: '#5B8CFF',
        mystery: '#FF2D55',
        kick: '#53FC18',
        ink: '#F6F2EA',
        'ink-muted': '#A79FB8',

        // Legacy aliases kept so older components still resolve.
        canvas: '#120E1C',
        stage: '#1B1530',
        action: '#FF3D3D',
      },
      fontFamily: {
        display: ['Alexandria', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Readex Pro', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.82)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-120%)' },
          '100%': { transform: 'translateY(620%)' },
        },
        'ticker-x': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'draw-line': {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
        scanline: 'scanline 3.6s linear infinite',
        'ticker-x': 'ticker-x 26s linear infinite',
        'draw-line': 'draw-line 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        orbit: 'orbit 28s linear infinite',
        'orbit-slow': 'orbit 48s linear infinite',
        drift: 'drift 5.5s ease-in-out infinite',
        shimmer: 'shimmer 4.5s linear infinite',
      },
    },
  },
  plugins: [],
};
