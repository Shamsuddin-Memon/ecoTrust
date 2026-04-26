/**
 * EcoTrust Theme Configuration
 * ─────────────────────────────────────────────────────────
 * Central theme reference for all modules.
 * Import this file in any component to access brand tokens.
 * When adding new modules, use these values to stay consistent.
 */

const theme = {
  // ─── Brand Information ──────────────────────────────
  brand: {
    name: 'EcoTrust',
    tagline: 'Building trust for the environment',
    emoji: '🌿',
  },

  // ─── Color Palette ─────────────────────────────────
  colors: {
    primary: {
      lightest: '#dcfce7', // eco-100
      light: '#4ade80',    // eco-400
      main: '#22c55e',     // eco-500
      dark: '#15803d',     // eco-700
      darkest: '#052e16',  // eco-950
    },
    secondary: {
      lightest: '#ccfbf1', // forest-100
      light: '#2dd4bf',    // forest-400
      main: '#14b8a6',     // forest-500
      dark: '#0f766e',     // forest-700
      darkest: '#042f2e',  // forest-950
    },
    earth: {
      light: '#e0d5c5',   // earth-200
      main: '#a88264',    // earth-500
      dark: '#574036',    // earth-900
    },
    background: {
      primary: '#131316',  // dark-950
      card: '#1e1f23',     // dark-900
      elevated: '#36383e', // dark-800
      border: '#3f4249',   // dark-700
    },
    text: {
      primary: '#ffffff',
      secondary: '#c4c6cb', // dark-200
      muted: '#7b7f89',     // dark-400
      inverse: '#131316',   // dark-950
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },

  // ─── Typography ────────────────────────────────────
  fonts: {
    heading: "'Outfit', 'Inter', sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // ─── Spacing Scale ────────────────────────────────
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  // ─── Border Radius ────────────────────────────────
  radii: {
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.5rem',   // 24px
    full: '9999px',
  },

  // ─── Shadows ──────────────────────────────────────
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.2)',
    md: '0 4px 14px rgba(0, 0, 0, 0.25)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.3)',
    eco: '0 4px 14px rgba(34, 197, 94, 0.15)',
    glow: '0 0 20px rgba(34, 197, 94, 0.3)',
  },

  // ─── Gradients ────────────────────────────────────
  gradients: {
    eco: 'linear-gradient(135deg, #065f46 0%, #10b981 50%, #34d399 100%)',
    forest: 'linear-gradient(135deg, #134e4a 0%, #14b8a6 100%)',
    dark: 'linear-gradient(135deg, #1e1f23 0%, #36383e 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
  },

  // ─── Transitions ──────────────────────────────────
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },

  // ─── Breakpoints ──────────────────────────────────
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ─── Role Labels ──────────────────────────────────
  roles: {
    admin: { label: 'Administrator', color: '#ef4444', icon: '🛡️' },
    ngo:   { label: 'NGO Partner',   color: '#22c55e', icon: '🌱' },
    donor: { label: 'Donor',         color: '#3b82f6', icon: '💎' },
  },
};

export default theme;
