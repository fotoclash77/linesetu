import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setBaseUrl } from "@workspace/api-client-react";
import { DoctorProvider, useDoctor } from "../contexts/DoctorContext";
import { ForceUpdateScreen } from "../components/ForceUpdateScreen";
import { useForceUpdate } from "../hooks/useForceUpdate";
import { DoctorBottomNavBar } from "../components/DoctorBottomNavBar";
import { WebAppSwitcher } from "../components/WebAppSwitcher";

if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { doctor, isLoading } = useDoctor();
  const segments = useSegments();
  const qc = useQueryClient();
  const prevDoctorIdRef = useRef<string | null | undefined>(undefined);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  const doctorId = doctor?.id ?? null;

  useEffect(() => {
    AsyncStorage.getItem("hasSeenOnboarding_doctor").then((val) => {
      setHasSeenOnboarding(val === "true");
    });
  }, []);

  // Clear the entire query cache whenever the logged-in doctor account changes
  useEffect(() => {
    if (prevDoctorIdRef.current !== undefined && prevDoctorIdRef.current !== doctorId) {
      qc.clear();
    }
    prevDoctorIdRef.current = doctorId;
  }, [doctorId]);

  useEffect(() => {
    if (!isLoading && hasSeenOnboarding !== null) {
      if (doctorId) {
        if (doctor?.profileCompleted) {
          router.replace("/(tabs)");
        } else {
          router.replace("/complete-profile");
        }
      } else {
        if (!hasSeenOnboarding) {
          router.replace("/onboarding");
        } else {
          router.replace("/login");
        }
      }
    }
  }, [doctorId, doctor?.profileCompleted, isLoading, hasSeenOnboarding]);

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
      <WebAppSwitcher />
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

  useEffect(() => {
    if (Platform.OS !== "web") {
      SplashScreen.preventAutoHideAsync().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#060E12" }} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <DoctorProvider>
            <RootLayoutNav />
            {forceUpdate.required && Platform.OS !== "web" && (
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
