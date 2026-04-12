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
import { auth, googleProvider, signInWithEmailAndPassword, signInWithPopup } from "@/lib/firebase";

const isWeb = Platform.OS === "web";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn() {
    const trimEmail = email.trim();
    if (!trimEmail || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, trimEmail, password);
      const user = cred.user;
      await login({
        id: user.uid,
        name: user.displayName ?? trimEmail.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        phone: user.phoneNumber ?? "",
        profilePhoto: user.photoURL ?? undefined,
      });
      router.replace("/(tabs)");
    } catch {
      setError("Sign-in failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGLoading(true);
    setError("");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      await login({
        id: user.uid,
        name: user.displayName ?? "Patient",
        phone: user.phoneNumber ?? "",
        profilePhoto: user.photoURL ?? undefined,
      });
      router.replace("/(tabs)");
    } catch {
      setError("Google sign-in failed. Try again.");
    } finally {
      setGLoading(false);
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
          contentContainerStyle={[styles.inner, { paddingTop: topPad + 24, paddingBottom: bottomPad }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
              testID="google-signin-btn"
              onPress={handleGoogle}
              disabled={gLoading}
              style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.88 }]}
            >
              {gLoading ? (
                <ActivityIndicator color="#1F2937" size="small" />
              ) : (
                <>
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconG}>G</Text>
                  </View>
                  <Text style={styles.googleBtnTxt}>Continue with Google</Text>
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerTxt}>or sign in with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Field */}
            <View style={styles.fieldWrap}>
              <View style={styles.fieldIcon}>
                <Feather name="mail" size={15} color="rgba(255,255,255,0.4)" />
              </View>
              <TextInput
                testID="email-input"
                style={styles.fieldInput}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(""); }}
                returnKeyType="next"
              />
            </View>

            {/* Password Field */}
            <View style={styles.fieldWrap}>
              <View style={styles.fieldIcon}>
                <Feather name="lock" size={15} color="rgba(255,255,255,0.4)" />
              </View>
              <TextInput
                testID="password-input"
                style={styles.fieldInput}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.25)"
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <Pressable onPress={() => setShowPwd(p => !p)} style={styles.eyeBtn}>
                <Feather name={showPwd ? "eye-off" : "eye"} size={15} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </View>

            {/* Forgot Password */}
            <Pressable style={styles.forgotRow}>
              <Text style={styles.forgotTxt}>Forgot password?</Text>
            </Pressable>

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
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.ctaText}>Sign In</Text>
                    <Feather name="chevron-right" size={16} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Security row */}
            <View style={styles.securityRow}>
              <Feather name="shield" size={11} color="rgba(255,255,255,0.2)" />
              <Text style={styles.securityTxt}>256-bit encrypted · Your data is safe</Text>
            </View>
          </View>

          {/* Create account */}
          <Text style={styles.createAccRow}>
            New to LINESETU?{" "}
            <Text style={styles.createAccLink}>Create account</Text>
          </Text>

          {/* Stats Strip */}
          <View style={styles.statsRow}>
            {([
              { v: "500+", l: "Clinics" },
              { v: "12K+", l: "Patients" },
              { v: "4.9★", l: "Rating" },
            ] as Array<{ v: string; l: string }>).map(({ v, l }, i) => (
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
  logoBox: { width: 64, height: 64, borderRadius: 19, backgroundColor: "rgba(99,102,241,0.15)", borderWidth: 1, borderColor: "rgba(99,102,241,0.35)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  brand: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, color: "#FFFFFF", marginBottom: 5 },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.38)", fontWeight: "500" },

  card: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", borderRadius: 28, padding: 24, marginBottom: 14 },
  cardTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "rgba(255,255,255,0.42)", marginBottom: 20 },

  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 52, borderRadius: 14, backgroundColor: "#FFFFFF", marginBottom: 18 },
  googleIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#4285F4", alignItems: "center", justifyContent: "center" },
  googleIconG: { fontSize: 14, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  googleBtnTxt: { fontSize: 15, fontWeight: "700", color: "#1F2937" },

  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.09)" },
  dividerTxt: { fontSize: 11, color: "rgba(255,255,255,0.28)", fontWeight: "500" },

  fieldWrap: { flexDirection: "row", alignItems: "center", height: 52, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1.5, borderColor: "rgba(99,102,241,0.35)", marginBottom: 12 },
  fieldIcon: { width: 44, alignItems: "center", justifyContent: "center" },
  fieldInput: { flex: 1, fontSize: 15, color: "#FFF", fontWeight: "500" },
  eyeBtn: { width: 44, alignItems: "center", justifyContent: "center" },

  forgotRow: { alignItems: "flex-end", marginBottom: 16, marginTop: -4 },
  forgotTxt: { fontSize: 12, color: "#6366F1", fontWeight: "700" },

  errorText: { fontSize: 12, color: "#F87171", marginBottom: 10 },

  ctaOuter: { borderRadius: 14, overflow: "hidden", marginBottom: 4 },
  ctaGrad: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#FFF", letterSpacing: 0.3 },

  securityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 16 },
  securityTxt: { fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: "500" },

  createAccRow: { textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: "500", marginBottom: 16 },
  createAccLink: { color: "#818CF8", fontWeight: "700" },

  statsRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 16, paddingVertical: 12, marginBottom: 14 },
  statDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.08)" },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.32)", fontWeight: "500" },

  terms: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", lineHeight: 18 },
  termsLink: { color: "#818CF8", fontWeight: "600" },
});
