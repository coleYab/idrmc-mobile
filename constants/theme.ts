export const colors = {
  // Light / primary palette (mint/green family) chosen for strong contrast
  background: "#d8f3dc",
  foreground: "#081c15",
  card: "#b7e4c7",
  muted: "#95d5b2",
  mutedForeground: "#2d6a4f",
  primary: "#40916c",
  accent: "#52b788",
  border: "#2d6a4f",
  success: "#52b788",
  // use a clear red for destructive actions for accessibility
  destructive: "#e53e3e",
  subscription: "#95d5b2",
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  30: 120,
} as const;

export const components = {
  tabBar: {
    height: spacing[18],
    horizontalInset: spacing[5],
    radius: spacing[8],
    iconFrame: spacing[12],
    itemPaddingVertical: spacing[2],
  },
} as const;

export const theme = {
  colors,
  spacing,
  components,
} as const;
