import { Feather } from "@expo/vector-icons";
import { router, useSegments } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";
export const NAV_BAR_H = isWeb ? 84 : 64;

const BG = "rgba(10,14,26,0.97)";
const ACTIVE = "#818CF8";
const INACTIVE = "rgba(255,255,255,0.28)";

const TABS = [
  { label: "Home",       icon: "home"     as const, href: "/(tabs)"          as any, seg1: undefined },
  { label: "Bookings",   icon: "calendar" as const, href: "/(tabs)/bookings" as any, seg1: "bookings" },
  { label: "Profile",    icon: "user"     as const, href: "/(tabs)/profile"  as any, seg1: "profile" },
] as const;

export function BottomNavBar() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const pb = isWeb ? 12 : Math.max(insets.bottom, 4);
  const totalH = NAV_BAR_H + (isWeb ? 0 : insets.bottom);

  function isActive(tab: (typeof TABS)[number]) {
    if (segments[0] !== "(tabs)") return false;
    if (tab.seg1 === undefined) {
      return !segments[1] || segments[1] === "index";
    }
    return segments[1] === tab.seg1;
  }

  return (
    <View style={[styles.bar, { height: totalH, paddingBottom: pb }]}>
      <View style={styles.inner}>
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <Pressable
              key={tab.label}
              style={styles.tab}
              onPress={() => router.push(tab.href)}
            >
              <View style={[styles.iconWrap, active && styles.iconActive]}>
                <Feather name={tab.icon} size={21} color={active ? ACTIVE : INACTIVE} />
              </View>
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    zIndex: 200,
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    gap: 3,
  },
  iconWrap: {
    width: 40,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  iconActive: {
    backgroundColor: "rgba(129,140,248,0.12)",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: INACTIVE,
  },
  labelActive: {
    color: ACTIVE,
  },
});
