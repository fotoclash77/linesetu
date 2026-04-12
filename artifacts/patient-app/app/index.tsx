import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { patient, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0A0E1A" }}>
        <ActivityIndicator color="#818CF8" />
      </View>
    );
  }

  if (!patient) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
