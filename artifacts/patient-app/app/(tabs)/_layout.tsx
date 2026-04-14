import { Feather } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";

const BG = "#0A0E1A";
const ACTIVE = "#818CF8";
const INACTIVE = "rgba(255,255,255,0.3)";
const isWeb = Platform.OS === "web";

export default function TabLayout() {
  const { patient, isLoading } = useAuth();

  if (!isLoading && !patient) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "My Bookings",
          tabBarIcon: ({ color }) => <Feather name="calendar" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
