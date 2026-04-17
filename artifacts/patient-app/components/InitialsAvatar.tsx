import React from "react";
import { View, Text } from "react-native";

function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.?\s*/i, "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface Props {
  name: string;
  size: number;
  color: string;
}

export function InitialsAvatar({ name, size, color }: Props) {
  const fontSize = Math.round(size * 0.35);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        backgroundColor: color + "18",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize,
          fontWeight: "700",
          color,
          letterSpacing: 0.5,
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}
