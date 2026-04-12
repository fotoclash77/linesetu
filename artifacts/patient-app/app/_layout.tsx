import { Stack } from "expo-router";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0E1A" },
});
