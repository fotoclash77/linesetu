import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { TEAL_LT } from "../../constants/theme";
import { FeatherIcon as Feather } from "../../components/FeatherIcon";
import { fireSettingsReset } from "./_settingsResetBridge";

const INACTIVE = "rgba(255,255,255,0.3)";
const isWeb = Platform.OS === "web";

function HomeIcon({ color }: { color: string }) {
  return <Feather name="home" size={22} color={color} />;
}
function QueueIcon({ color }: { color: string }) {
  return <Feather name="list" size={22} color={color} />;
}
function EarningsIcon({ color }: { color: string }) {
  return <Feather name="trending-up" size={22} color={color} />;
}
function SettingsIcon({ color }: { color: string }) {
  return <Feather name="settings" size={22} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TEAL_LT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "rgba(7,11,20,0.96)",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.07)",
          height: isWeb ? 72 : 64,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(7,11,20,0.96)" }]} />
        ),
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
          letterSpacing: 0.3,
          marginBottom: isWeb ? 8 : 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        sceneContainerStyle: { backgroundColor: "#070B14" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: "Queue",
          tabBarIcon: ({ color }) => <QueueIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color }) => <EarningsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
        listeners={{
          tabPress: () => fireSettingsReset(),
        }}
      />
    </Tabs>
  );
}
