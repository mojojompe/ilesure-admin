import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand — Burnt Brown / Clay palette
        'burnt-brown':        '#6B3A1F',
        'burnt-brown-dark':   '#4E2A14',
        'burnt-brown-mid':    '#7D4525',
        'burnt-brown-light':  '#9B5B35',
        'burnt-brown-pale':   '#F5EDE6',
        'burnt-brown-xpale':  '#FAF3EE',
        // Brand — Mustard
        'mustard':            '#C97B1C',
        'mustard-light':      '#E8941E',
        'mustard-pale':       '#FFF8E6',
        'mustard-border':     '#EDD59A',
        // Neutral surfaces
        'off-white':          '#FAFAF8',
        'clay-surface':       '#FFFFFF',
        'soft-surface':       '#F5F0EB',
        // Text
        'text-primary':       '#1C0A00',
        'text-secondary':     '#6B4C3B',
        'text-tertiary':      '#A07860',
        'text-disabled':      '#C4AFA4',
        // Borders
        'clay-border':        '#E7DCD4',
        'clay-border-light':  '#F2EDE8',
        'clay-border-dark':   '#D4C5B8',
        // Status
        'status-success':     '#2E9B5A',
        'status-warning':     '#C97B1C',
        'status-error':       '#D93B3B',
        'status-info':        '#2C80C4',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        'clay':    '20px',
        'clay-sm': '12px',
        'clay-lg': '28px',
        'pill':    '9999px',
      },
      boxShadow: {
        'clay':         '0 8px 32px rgba(107,58,31,0.10), 0 2px 8px rgba(107,58,31,0.06)',
        'clay-sm':      '0 4px 16px rgba(107,58,31,0.08)',
        'clay-lg':      '0 16px 48px rgba(107,58,31,0.14), 0 4px 16px rgba(107,58,31,0.08)',
        'clay-hover':   '0 20px 52px rgba(107,58,31,0.18), 0 4px 16px rgba(107,58,31,0.10)',
        'clay-inset':   'inset 0 2px 6px rgba(107,58,31,0.08)',
        'sidebar-pill': '0 8px 40px rgba(78,42,20,0.32), 0 2px 12px rgba(78,42,20,0.16), 0 0 0 1px rgba(255,255,255,0.05)',
        'header-pill':  '0 4px 20px rgba(107,58,31,0.10), 0 1px 4px rgba(107,58,31,0.06)',
        'kpi':          '0 4px 24px rgba(107,58,31,0.08), 0 1px 4px rgba(107,58,31,0.04)',
        'kpi-hover':    '0 12px 40px rgba(107,58,31,0.14), 0 2px 8px rgba(107,58,31,0.08)',
        'card-inner':   'inset 0 1px 0 rgba(255,255,255,0.7)',
      },
      backgroundImage: {
        'sidebar-gradient':   'linear-gradient(165deg, #5C2E0F 0%, #3D1D0A 45%, #2A1206 100%)',
        'sidebar-accent':     'linear-gradient(135deg, #7D4525 0%, #4E2A14 100%)',
        'btn-primary':        'linear-gradient(135deg, #7D4525 0%, #4E2A14 100%)',
        'btn-mustard':        'linear-gradient(135deg, #E8941E 0%, #C97B1C 100%)',
        'kpi-gradient-1':     'linear-gradient(135deg, #FFF8E6 0%, #FFFFFF 60%)',
        'kpi-gradient-2':     'linear-gradient(135deg, #F5EDE6 0%, #FFFFFF 60%)',
        'kpi-gradient-3':     'linear-gradient(135deg, #F0F7FF 0%, #FFFFFF 60%)',
        'kpi-gradient-4':     'linear-gradient(135deg, #F0FFF6 0%, #FFFFFF 60%)',
        'welcome-gradient':   'linear-gradient(135deg, #5C2E0F 0%, #7D4525 40%, #9B5B35 100%)',
        'page-texture':       'radial-gradient(ellipse at 20% 20%, rgba(107,58,31,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(201,123,28,0.04) 0%, transparent 60%)',
      },
      animation: {
        'fade-in':      'fadeIn 0.25s ease-out',
        'slide-up':     'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
        'slide-right':  'slideRight 0.3s ease-out',
        'shimmer':      'shimmer 2s linear infinite',
        'bounce-in':    'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-dot':    'pulseDot 2s ease-in-out infinite',
        'glow':         'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceIn: {
          '0%':   { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.6', transform: 'scale(1.4)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232,148,30,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(232,148,30,0.6)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
