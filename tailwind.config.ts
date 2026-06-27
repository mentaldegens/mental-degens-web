import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          green:  '#AAFF00',
          pink:   '#FF2D78',
          cyan:   '#00F5FF',
          purple: '#B400FF',
        },
        degen: {
          black:  '#050505',
          dark:   '#0A0A0A',
          card:   '#111111',
          border: '#1E1E1E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body:    ['var(--font-body)',    'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
