import React from "react";
import { Platform, Pressable, Text, View } from "react-native";

export function WebAppSwitcher() {
  if (Platform.OS !== "web") return null;
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute" as any,
        top: 12,
        right: 12,
        zIndex: 9999,
      }}
    >
      <Pressable
        onPress={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/patient-app/";
          }
        }}
        style={{
          backgroundColor: "rgba(13, 148, 136, 0.9)",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "600" }}>
          Switch to Patient App →
        </Text>
      </Pressable>
    </View>
  );
}
