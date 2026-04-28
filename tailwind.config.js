window.tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#0066FF', // Electric Blue
          dark: '#0052CC',
          light: '#3387FF'
        },
        secondary: {
          DEFAULT: '#7C3AED', // Deep Purple
          dark: '#6328BE'
        },
        accent: {
          DEFAULT: '#06B6D4', // Cyber Cyan
        },
        dark: {
          bg: '#0A0A0A',
          surface: '#1A1A1A',
          border: '#2A2A2A'
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0066FF 0%, #06B6D4 100%)',
        'premium-gradient': 'linear-gradient(135deg, #0066FF 0%, #7C3AED 50%, #06B6D4 100%)',
        'glass': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 102, 255, 0)' },
          '50%': { boxShadow: '0 0 20px 8px rgba(0, 102, 255, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        }
      }
    }
  }
}