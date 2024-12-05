/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'status': {
          'applied': {
            'bg': 'rgba(234, 179, 8, 0.2)',
            'text': '#fcd34d'
          },
          'interview': {
            'bg': 'rgba(59, 130, 246, 0.2)',
            'text': '#93c5fd'
          },
          'offer': {
            'bg': 'rgba(34, 197, 94, 0.2)',
            'text': '#86efac'
          },
          'rejected': {
            'bg': 'rgba(239, 68, 68, 0.2)',
            'text': '#fca5a5'
          }
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { 
            transform: 'translateY(-10px)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.5',
          },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'width': 'width',
        'size': 'width, height',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'status': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      minHeight: {
        'modal': '200px',
      },
      zIndex: {
        'modal': '1000',
        'modal-backdrop': '999',
        'tooltip': '1100',
        'popover': '1050',
      },
      opacity: {
        '15': '0.15',
        '85': '0.85',
      },
      cursor: {
        'not-allowed': 'not-allowed',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#f8fafc', // slate-50
            a: {
              color: '#3b82f6', // blue-500
              '&:hover': {
                color: '#2563eb', // blue-600
              },
            },
            strong: {
              color: '#f1f5f9', // slate-100
            },
            h1: {
              color: '#f1f5f9', // slate-100
            },
            h2: {
              color: '#f1f5f9', // slate-100
            },
            h3: {
              color: '#f1f5f9', // slate-100
            },
            h4: {
              color: '#f1f5f9', // slate-100
            },
            code: {
              color: '#e2e8f0', // slate-200
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            hr: {
              borderColor: '#334155', // slate-700
            },
            'ul > li::before': {
              backgroundColor: '#64748b', // slate-500
            },
            'ol > li::before': {
              color: '#64748b', // slate-500
            },
            blockquote: {
              color: '#cbd5e1', // slate-300
              borderLeftColor: '#334155', // slate-700
            },
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      borderColor: ['active', 'disabled'],
    },
  },
}