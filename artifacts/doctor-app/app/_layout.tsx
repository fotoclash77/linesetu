import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";
import { DoctorProvider, useDoctor } from "../contexts/DoctorContext";
import { ForceUpdateScreen } from "../components/ForceUpdateScreen";
import { useForceUpdate } from "../hooks/useForceUpdate";

if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { doctor, isLoading } = useDoctor();
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
    if (!isLoading) {
      if (doctorId) {
        if (doctor?.profileCompleted) {
          router.replace("/(tabs)");
        } else {
          router.replace("/complete-profile");
        }
      } else {
        router.replace("/login");
      }
    }
  }, [doctorId, doctor?.profileCompleted, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="walkin/index" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Feather.font,
  });
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
