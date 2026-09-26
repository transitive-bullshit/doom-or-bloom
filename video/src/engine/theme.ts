// Doom or Bloom's Prism palette, shared with the app's map and icon.
export const C = {
  ink: '#0e0e0c',
  ink2: '#1a1a17',
  ink3: '#26261f',
  paper: '#fbfaf6',
  paper2: '#f1eee5',
  paper3: '#e6e2d6',
  muted: '#77776e',
  mutedDark: '#a3a39a',
  coral: '#ff786a',
  coralDeep: '#ff5347',
  peach: '#ffb88b',
  lime: '#e6ff80',
  mint: '#aaffbd',
  mintDeep: '#2fc766',
  violet: '#bcb1ff',
  grid: 'rgba(37, 57, 43, 0.21)',
  border: 'rgba(37, 57, 43, 0.13)'
}

export const FONT = {
  sans: '"Inter Tight"',
  serif: '"Instrument Serif"',
  mono: '"JetBrains Mono"'
}

/** Gradient stops for the Prism field (coral → peach → lime → mint). */
export const PRISM: [number, string][] = [
  [0, C.coral],
  [0.3, C.peach],
  [0.67, C.lime],
  [1, C.mint]
]
