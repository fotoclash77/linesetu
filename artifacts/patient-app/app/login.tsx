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
import { registerPatient } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";

const BG = "#0A0E1A";

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
    <View style={[styles.container, { backgroundColor: BG }]}>
      {/* Glow orbs */}
      <View style={[styles.orb1]} />
      <View style={[styles.orb2]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.inner, { paddingTop: topPad + 24, paddingBottom: isWeb ? 34 : insets.bottom + 16 }]}>

          {/* Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>🩺</Text>
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
          </View>

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
  container: { flex: 1 },
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
  brandSection: { alignItems: "center", marginBottom: 36 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: "rgba(99,102,241,0.15)",
    borderWidth: 1, borderColor: "rgba(99,102,241,0.35)",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  logoIcon: { fontSize: 30 },
  brand: {
    fontSize: 32, fontWeight: "800", letterSpacing: -1,
    color: "#FFFFFF", marginBottom: 6,
  },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.38)", fontWeight: "500" },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 28, padding: 24, marginBottom: 24,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "rgba(255,255,255,0.42)", marginBottom: 22 },
  phoneRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
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
    borderWidth: 1, borderColor: "rgba(99,102,241,0.5)",
    paddingHorizontal: 16, fontSize: 18, fontWeight: "600",
    color: "#FFF", letterSpacing: 1,
  },
  nameInput: {
    height: 52, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(99,102,241,0.5)",
    paddingHorizontal: 16, fontSize: 16, fontWeight: "600",
    color: "#FFF", marginBottom: 16,
  },
  errorText: { fontSize: 12, color: "#F87171", marginBottom: 12, marginTop: -8 },
  ctaOuter: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  ctaGrad: {
    height: 52, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 8,
  },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  backBtn: { alignItems: "center", marginTop: 14 },
  backText: { fontSize: 13, color: "#818CF8", fontWeight: "600" },
  statsRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 16, paddingVertical: 12, marginBottom: 16,
  },
  statDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.08)" },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.32)", fontWeight: "500" },
  terms: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", lineHeight: 18 },
  termsLink: { color: "#818CF8", fontWeight: "600" },
});
