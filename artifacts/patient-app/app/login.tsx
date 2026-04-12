import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { registerPatient } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "name">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    const trimPhone = phone.trim().replace(/\s/g, "");
    if (trimPhone.length < 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (step === "phone") {
      setStep("name");
      setError("");
      return;
    }
    const trimName = name.trim();
    if (!trimName) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const patient = await registerPatient({ phone: `+91${trimPhone}`, name: trimName });
      await login({ id: patient.id, name: patient.name, phone: patient.phone });
      router.replace("/(tabs)");
    } catch (e: any) {
      setError("Could not connect. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={styles.container}>
      {/* Glow orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.inner, { paddingTop: topPad + 24, paddingBottom: isWeb ? 34 : insets.bottom + 16 }]}>

          {/* Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <Feather name="activity" size={26} color="#818CF8" />
            </View>
            <Text style={styles.brand}>LINESETU</Text>
            <Text style={styles.tagline}>Smart Queue · Zero Wait Anxiety</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {step === "phone" ? "Welcome" : "What's your name?"}
            </Text>
            <Text style={styles.cardSub}>
              {step === "phone"
                ? "Enter your mobile number to continue"
                : "This is how doctors will see you"}
            </Text>

            {step === "phone" ? (
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  testID="phone-input"
                  style={styles.phoneInput}
                  placeholder="98765 43210"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(t) => { setPhone(t); setError(""); }}
                  autoFocus
                />
              </View>
            ) : (
              <TextInput
                testID="name-input"
                style={styles.nameInput}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={name}
                onChangeText={(t) => { setName(t); setError(""); }}
                autoFocus
                autoCapitalize="words"
              />
            )}

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              testID="continue-btn"
              onPress={handleContinue}
              disabled={loading}
              style={({ pressed }) => [styles.ctaOuter, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={["#4F46E5", "#6366F1", "#0EA5E9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGrad}
              >
                {loading
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={styles.ctaText}>{step === "phone" ? "Continue →" : "Get Started"}</Text>}
              </LinearGradient>
            </Pressable>

            {step === "name" && (
              <Pressable onPress={() => { setStep("phone"); setError(""); }} style={styles.backBtn}>
                <Text style={styles.backText}>← Change number</Text>
              </Pressable>
            )}

            {/* Security note */}
            <View style={styles.securityRow}>
              <Feather name="shield" size={11} color="rgba(255,255,255,0.2)" />
              <Text style={styles.securityTxt}>256-bit encrypted · Your data is safe</Text>
            </View>
          </View>

          {/* New here note */}
          <Text style={styles.newHere}>
            New here?{" "}
            <Text style={styles.newHereHighlight}>You'll be registered automatically</Text>
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { v: "500+", l: "Clinics" },
              { v: "12K+", l: "Patients" },
              { v: "4.9★", l: "Rating" },
            ].map(({ v, l }, i) => (
              <React.Fragment key={l}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{v}</Text>
                  <Text style={styles.statLabel}>{l}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <Text style={styles.terms}>
            By continuing, you agree to our{" "}
            <Text style={styles.termsLink}>Terms</Text>
            {" & "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: {
    position: "absolute", top: -80, left: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(99,102,241,0.28)",
  },
  orb2: {
    position: "absolute", bottom: 40, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(6,182,212,0.16)",
  },
  inner: { flex: 1, paddingHorizontal: 20 },
  brandSection: { alignItems: "center", marginBottom: 32 },
  logoBox: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: "rgba(99,102,241,0.15)",
    borderWidth: 1, borderColor: "rgba(99,102,241,0.35)",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  brand: {
    fontSize: 30, fontWeight: "800", letterSpacing: -0.5,
    color: "#FFFFFF", marginBottom: 5,
  },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.38)", fontWeight: "500" },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 28, padding: 24, marginBottom: 14,
  },
  cardTitle: { fontSize: 21, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "rgba(255,255,255,0.42)", marginBottom: 20 },
  phoneRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  countryCode: {
    height: 52, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  countryText: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  phoneInput: {
    flex: 1, height: 52, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1.5, borderColor: "rgba(99,102,241,0.5)",
    paddingHorizontal: 16, fontSize: 18, fontWeight: "600",
    color: "#FFF", letterSpacing: 1,
  },
  nameInput: {
    height: 52, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1.5, borderColor: "rgba(99,102,241,0.5)",
    paddingHorizontal: 16, fontSize: 16, fontWeight: "600",
    color: "#FFF", marginBottom: 14,
  },
  errorText: { fontSize: 12, color: "#F87171", marginBottom: 10, marginTop: -6 },
  ctaOuter: {
    borderRadius: 14, overflow: "hidden", marginTop: 2,
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 20,
  },
  ctaGrad: {
    height: 52, alignItems: "center", justifyContent: "center",
  },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#FFF", letterSpacing: 0.3 },
  backBtn: { alignItems: "center", marginTop: 14 },
  backText: { fontSize: 13, color: "#818CF8", fontWeight: "600" },
  securityRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, marginTop: 18,
  },
  securityTxt: { fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: "500" },
  newHere: {
    textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)",
    fontWeight: "500", marginBottom: 14,
  },
  newHereHighlight: { color: "#818CF8", fontWeight: "700" },
  statsRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 16, paddingVertical: 12, marginBottom: 14,
  },
  statDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.08)" },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.32)", fontWeight: "500" },
  terms: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", lineHeight: 18 },
  termsLink: { color: "#818CF8", fontWeight: "600" },
});
