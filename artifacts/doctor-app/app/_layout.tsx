import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";
import { DoctorProvider, useDoctor } from "../contexts/DoctorContext";
import { ForceUpdateScreen } from "../components/ForceUpdateScreen";
import { useForceUpdate } from "../hooks/useForceUpdate";
import { DoctorBottomNavBar } from "../components/DoctorBottomNavBar";

if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { doctor, isLoading } = useDoctor();
  const segments = useSegments();
  const qc = useQueryClient();
  const prevDoctorIdRef = useRef<string | null | undefined>(undefined);

  const doctorId = doctor?.id ?? null;

  // Clear the entire query cache whenever the logged-in doctor account changes
  useEffect(() => {
    if (prevDoctorIdRef.current !== undefined && prevDoctorIdRef.current !== doctorId) {
      qc.clear();
    }
    prevDoctorIdRef.current = doctorId;
  }, [doctorId]);

  useEffect(() => {
    if (isLoading) return;
    if (doctorId) {
      if (doctor?.profileCompleted) {
        router.replace("/(tabs)");
      } else {
        router.replace("/complete-profile");
      }
    } else {
      router.replace("/login");
    }
  }, [doctorId, doctor?.profileCompleted, isLoading]);

  const hideNav = isLoading || !doctor ||
    segments[0] === "login" ||
    segments[0] === "onboarding" ||
    segments[0] === "complete-profile" ||
    segments[0] === "walkin";

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: "#070B14" } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="complete-profile" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="walkin/index" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="patients/index" />
        <Stack.Screen name="patients/[id]" />
      </Stack>
      {!hideNav && <DoctorBottomNavBar />}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const forceUpdate = useForceUpdate();

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#060E12" }} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <DoctorProvider>
            <RootLayoutNav />
            {forceUpdate.required && (
              <ForceUpdateScreen
                message={forceUpdate.message}
                storeUrl={forceUpdate.storeUrl}
              />
            )}
          </DoctorProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
