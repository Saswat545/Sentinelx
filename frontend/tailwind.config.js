/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SentinelX Dark Mode (Guardian Theme)
        brand: {
          'deep': '#080614',      // Ultra-dark midnight background
          'surface': '#181533',   // Deep indigo for cards/containers
          'cobalt': '#4E55FF',    // Electric cobalt primary
          'indigo': '#2E2475',    // Deep majestic indigo (light mode)
          'danger': '#FF3B6B',    // Neon warning red
          'danger-light': '#D91E4E', // Deep crimson (light mode)
        },
        // Semantic colors
        dark: {
          'bg': '#080614',
          'surface': '#181533',
          'card': '#1E1B3A',
          'border': '#2A2650',
          'text': '#F8FAFC',
          'muted': '#94A3B8',
        },
        light: {
          'bg': '#F4F5FA',
          'surface': '#FFFFFF',
          'card': '#F8F9FC',
          'border': '#E2E8F0',
          'text': '#0F172A',
          'muted': '#64748B',
        },
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Exo 2', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(78, 85, 255, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(78, 85, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
