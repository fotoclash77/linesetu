import { Tabs } from "expo-router";
import React from "react";
import { FeatherIcon as Feather } from "../../components/FeatherIcon";
import { fireSettingsReset } from "../../lib/settingsResetBridge";

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
        tabBarStyle: { display: "none" },
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
        options={{ href: null }}
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
