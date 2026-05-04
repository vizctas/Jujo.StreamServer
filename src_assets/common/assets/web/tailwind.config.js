const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // Limit scanning to source files; avoid node_modules for performance
  content: [
    './index.html',
    './*.{vue,js,ts,html}',
    './components/**/*.{vue,js,ts}',
    './views/**/*.{vue,js,ts}',
    './configs/**/*.{vue,js,ts}',
    './stores/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      // Single source of truth for semantic colors (light/dark).
      // These values drive CSS variables that both Tailwind utilities and Naive UI consume.
      semanticColors: {
        light: {
          // Neutral-cool palette — no warm undertone, consistent with dark mode hue
          primary: '46 91 186',
          secondary: '91 112 140',
          success: '46 125 82',
          warning: '176 111 34',
          danger: '184 63 63',
          info: '52 112 154',
          light: '242 245 250',      // cool neutral (was warm 247 245 241)
          dark: '31 35 42',
          surface: '248 250 254',    // near-white cool (was warm 255 253 249)
          accent: '79 125 111',
          onPrimary: '255 255 255',
          onSecondary: '255 255 255',
          onAccent: '255 255 255',
          onLight: '31 35 42',
          onDark: '255 255 255',
          brand: '46 91 186',
        },
        dark: {
          // 🌙 Lunar (cosmic blues + purples), tuned for contrast on deep navy
          dark: '14 17 22',
          surface: '24 29 37',
          light: '234 238 244',

          // Core actions/brand (cool spectrum)
          primary: '107 145 214',
          secondary: '117 131 151',
          accent: '105 150 134',
          info: '116 164 199',

          // Status with lunar tilt (cool-leaning where possible)
          success: '84 166 122',
          warning: '205 145 73',
          danger: '218 95 95',

          // Text-on-color (picked to pass AA on typical sizes)
          onDark: '241 244 248',
          onSurface: '241 244 248',
          onLight: '14 17 22',
          onPrimary: '10 14 20',
          onSecondary: '10 14 20',
          onAccent: '10 14 20',
          onInfo: '10 14 20',

          // Brand tint (cool lavender for logos/illustrations)
          brand: '132 166 224',
        },
      },
      colors: {
        // Semantic tokens resolved via CSS variables (light defaults, dark overrides via .dark)
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        light: 'rgb(var(--color-light) / <alpha-value>)',
        dark: 'rgb(var(--color-dark) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        onPrimary: 'rgb(var(--color-on-primary) / <alpha-value>)',
        onSecondary: 'rgb(var(--color-on-secondary) / <alpha-value>)',
        onAccent: 'rgb(var(--color-on-accent) / <alpha-value>)',
        onLight: 'rgb(var(--color-on-light) / <alpha-value>)',
        onDark: 'rgb(var(--color-on-dark) / <alpha-value>)',
        // Optional brand token for places that previously mixed solar-secondary + lunar-onSecondary
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
      },
    },
  },
  // Enable Tailwind preflight now that Bootstrap is removed. Keep visibility disabled if not needed.
  corePlugins: {
    preflight: true,
    visibility: false,
  },
  plugins: [
    // Emit CSS variables for semantic tokens from theme.semanticColors
    plugin(function ({ addBase, theme }) {
      const light = theme('semanticColors.light') || {};
      const dark = theme('semanticColors.dark') || {};
      const toVars = (src) => ({
        '--color-primary': src.primary,
        '--color-secondary': src.secondary,
        '--color-success': src.success,
        '--color-warning': src.warning,
        '--color-danger': src.danger,
        '--color-info': src.info,
        '--color-light': src.light,
        '--color-dark': src.dark,
        '--color-surface': src.surface,
        '--color-accent': src.accent,
        '--color-on-primary': src.onPrimary,
        '--color-on-secondary': src.onSecondary,
        '--color-on-accent': src.onAccent,
        '--color-on-light': src.onLight,
        '--color-on-dark': src.onDark,
        '--color-brand': src.brand,
      });
      addBase({
        ':root': toVars(light),
        '.dark': toVars(dark),
      });
    }),
  ],
};
