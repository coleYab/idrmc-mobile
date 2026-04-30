export const colors = {
  background: "#c2d3cd",
  foreground: "#56494c",
  card: "#afbfc0",
  muted: "#9fa4a9",
  mutedForeground: "#847e89",
  primary: "#56494c",
  accent: "#847e89",
  border: "#9fa4a9",
  success: "#847e89",
  destructive: "#56494c",
  subscription: "#c2d3cd",
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
