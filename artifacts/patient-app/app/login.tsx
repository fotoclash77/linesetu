import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  async function handleSignIn() {
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !trimEmail.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const name = trimEmail.split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      await login({ id: trimEmail, name, phone: "" });
      router.replace("/(tabs)");
    } catch {
      setError("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      await login({ id: "google-user", name: "Aryan Mehta", phone: "" });
      router.replace("/(tabs)");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.inner, { paddingTop: topPad + 24, paddingBottom: isWeb ? 34 : insets.bottom + 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <Feather name="activity" size={26} color="#818CF8" />
            </View>
            <Text style={styles.brand}>LINESETU</Text>
            <Text style={styles.tagline}>Smart Queue · Zero Wait Anxiety</Text>
          </View>

          {/* Glass Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to your account</Text>

            {/* Google Button */}
            <Pressable
              testID="google-btn"
              style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
              onPress={handleGoogle}
              disabled={loading}
            >
              <View style={styles.googleIcon}>
                {/* Google G SVG */}
                <View style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#4285F4" }}>G</Text>
                </View>
              </View>
              <Text style={styles.googleTxt}>Continue with Google</Text>
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerTxt}>or sign in with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Field */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputRow}>
                <Feather name="mail" size={16} color="rgba(255,255,255,0.3)" />
                <TextInput
                  testID="email-input"
                  style={styles.input}
                  placeholder="aryan.mehta@gmail.com"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(""); }}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={[styles.fieldWrap, { marginBottom: 8 }]}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={[styles.inputRow, styles.inputRowFocused]}>
                <Feather name="lock" size={16} color="#818CF8" />
                <TextInput
                  testID="password-input"
                  style={[styles.input, { letterSpacing: password ? 3 : 0 }]}
                  placeholder="••••••••••"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(""); }}
                  onSubmitEditing={handleSignIn}
                />
                <Pressable onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                  <Feather name={showPass ? "eye-off" : "eye"} size={16} color="rgba(255,255,255,0.3)" />
                </Pressable>
              </View>
            </View>

            {/* Forgot Password */}
            <View style={styles.forgotRow}>
              <Pressable>
                <Text style={styles.forgotTxt}>Forgot password?</Text>
              </Pressable>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            {/* Sign In CTA */}
            <Pressable
              testID="signin-btn"
              onPress={handleSignIn}
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
                  : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                      <Text style={styles.ctaText}>Sign In</Text>
                      <Feather name="chevron-right" size={18} color="#FFF" />
                    </View>
                  )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <Text style={styles.newHere}>
            New to LINESETU?{" "}
            <Text style={styles.newHereLink}>Create account</Text>
          </Text>

          {/* Security Note */}
          <View style={styles.securityRow}>
            <Feather name="shield" size={12} color="rgba(255,255,255,0.2)" />
            <Text style={styles.securityTxt}>256-bit encrypted · Your data is safe</Text>
          </View>

          {/* Stats Strip */}
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

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our{" "}
            <Text style={styles.termsLink}>Terms</Text>
            {" & "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(99,102,241,0.28)" },
  orb2: { position: "absolute", bottom: 40, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(6,182,212,0.16)" },
  inner: { paddingHorizontal: 20 },

  brandSection: { alignItems: "center", marginBottom: 24 },
  logoBox: { width: 60, height: 60, borderRadius: 18, backgroundColor: "rgba(99,102,241,0.15)", borderWidth: 1, borderColor: "rgba(99,102,241,0.35)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  brand: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, color: "#FFFFFF", marginBottom: 4 },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.38)", fontWeight: "500" },

  card: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", borderRadius: 28, padding: 26, paddingHorizontal: 22, marginBottom: 18 },
  cardTitle: { fontSize: 21, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "rgba(255,255,255,0.42)", marginBottom: 22 },

  googleBtn: { height: 52, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.97)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8 },
  googleIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  googleTxt: { fontSize: 14, fontWeight: "600", color: "#1F1F1F", letterSpacing: 0.01 },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  dividerTxt: { fontSize: 12, color: "rgba(255,255,255,0.28)", fontWeight: "500" },

  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.07 * 11, color: "rgba(255,255,255,0.32)", textTransform: "uppercase", marginBottom: 7 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingHorizontal: 14, height: 50 },
  inputRowFocused: { borderWidth: 1.5, borderColor: "rgba(99,102,241,0.5)" },
  input: { flex: 1, height: 50, fontSize: 14, fontWeight: "500", color: "#FFF" },
  eyeBtn: { padding: 4 },

  forgotRow: { alignItems: "flex-end", marginBottom: 22 },
  forgotTxt: { fontSize: 12, fontWeight: "600", color: "#818CF8" },

  errorText: { fontSize: 12, color: "#F87171", marginBottom: 10, marginTop: -10 },
  ctaOuter: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: { height: 52, alignItems: "center", justifyContent: "center", shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16 },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#FFF", letterSpacing: 0.01 },

  newHere: { textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: "500", marginBottom: 14 },
  newHereLink: { color: "#818CF8", fontWeight: "700" },

  securityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 14 },
  securityTxt: { fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: "500" },

  statsRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 16, paddingVertical: 12, marginBottom: 14 },
  statDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.08)" },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.32)", fontWeight: "500" },

  terms: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", lineHeight: 18 },
  termsLink: { color: "#818CF8", fontWeight: "600" },
});
