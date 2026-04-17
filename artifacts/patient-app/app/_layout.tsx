import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomNavBar } from "@/components/BottomNavBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PatientNotifsProvider } from "@/contexts/PatientNotifsContext";
import { ForceUpdateScreen } from "@/components/ForceUpdateScreen";
import { useForceUpdate } from "@/hooks/useForceUpdate";

if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

function RootLayoutNav() {
  const { patient, isLoading } = useAuth();
  const segments = useSegments();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("hasSeenOnboarding_patient").then((val) => {
      setHasSeenOnboarding(val === "true");
    });
  }, []);

  useEffect(() => {
    if (!isLoading && hasSeenOnboarding !== null) {
      if (patient) {
        if (patient.profileCompleted) {
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
  }, [patient?.id, patient?.profileCompleted, isLoading, hasSeenOnboarding]);

  const hideNav = isLoading || !patient ||
    segments[0] === "login" ||
    segments[0] === "onboarding" ||
    segments[0] === "complete-profile";

  if (isLoading || hasSeenOnboarding === null) {
    return <View style={{ flex: 1, backgroundColor: "#0A0E1A" }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: "#0A0E1A" } }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="complete-profile" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="find-doctors" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="preferences" />
        <Stack.Screen name="help-faq" />
        <Stack.Screen name="contact-support" />
        <Stack.Screen name="doctor/[id]" />
        <Stack.Screen name="scan-qr" />
        <Stack.Screen name="booking/[doctorId]" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="queue/[tokenId]" />
      </Stack>
      {!hideNav && <BottomNavBar />}
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
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#0A0E1A" }} />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <PatientNotifsProvider>
                <RootLayoutNav />
                {forceUpdate.required && Platform.OS !== "web" && (
                  <ForceUpdateScreen
                    message={forceUpdate.message}
                    storeUrl={forceUpdate.storeUrl}
                  />
                )}
              </PatientNotifsProvider>
            </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
