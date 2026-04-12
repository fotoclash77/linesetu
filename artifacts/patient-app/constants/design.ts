import type { DimensionValue, ViewStyle } from "react-native";

export const C = {
  BG:       "#0A0E1A",
  PRIMARY:  "#4F46E5",
  LABEL:    "#818CF8",
  CYAN:     "#06B6D4",
  SUCCESS:  "#22C55E",
  ERROR:    "#EF4444",
  WARNING:  "#F59E0B",
  WHITE:    "#FFFFFF",
} as const;

export const glass = (extra?: ViewStyle): ViewStyle => ({
  backgroundColor: "rgba(30,35,60,0.7)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  borderRadius: 18,
  ...extra,
});

export const glassCard = (extra?: ViewStyle): ViewStyle => ({
  backgroundColor: "rgba(255,255,255,0.05)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.09)",
  borderRadius: 20,
  ...extra,
});

export function pct(n: number): DimensionValue {
  return `${n}%` as DimensionValue;
}
