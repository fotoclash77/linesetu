import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeatherIcon as Feather } from "./FeatherIcon";

const isWeb = Platform.OS === "web";
export const DOCTOR_NAV_H = isWeb ? 84 : 64;

const BG = "rgba(7,11,20,0.96)";
const ACTIVE = "#2DD4BF";
const INACTIVE = "rgba(255,255,255,0.3)";

const TABS = [
  { label: "Home",     icon: "home"         as const, seg: "index"    },
  { label: "Queue",    icon: "list"          as const, seg: "queue"    },
  { label: "Earnings", icon: "trending-up"   as const, seg: "earnings" },
  { label: "Settings", icon: "settings"      as const, seg: "settings" },
] as const;

export function DoctorBottomNavBar() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const pb = isWeb ? 12 : Math.max(insets.bottom, 4);
  const totalH = DOCTOR_NAV_H + (isWeb ? 0 : insets.bottom);

  const currentSeg = segments[1] ?? "index";

  function isActive(seg: string) {
    if (seg === "index") return segments[0] === "(tabs)" && (!segments[1] || segments[1] === "index");
    return segments[0] === "(tabs)" && segments[1] === seg;
  }

  function handlePress(seg: string) {
    if (seg === "index") router.push("/(tabs)");
    else router.push(`/(tabs)/${seg}` as any);
  }

  return (
    <View style={[styles.bar, { height: totalH, paddingBottom: pb }]}>
      <View style={styles.inner}>
        {TABS.map((tab) => {
          const active = isActive(tab.seg);
          return (
            <Pressable
              key={tab.label}
              style={styles.tab}
              onPress={() => handlePress(tab.seg)}
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
    backgroundColor: "rgba(45,212,191,0.12)",
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
