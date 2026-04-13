import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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

const isWeb = Platform.OS === "web";

function getApiBase() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "http://localhost:8080";
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  async function handleSendOtp() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    const fullPhone = `${countryCode}${digits}`;
    setLoading(true);
    setError("");
    setDevOtp(null);
    try {
      const resp = await fetch(`${getApiBase()}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? "Failed to send OTP");
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep("otp");
    } catch (e: any) {
      setError(e?.message ?? "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    const fullPhone = `${countryCode}${phone.replace(/\D/g, "")}`;
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`${getApiBase()}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, otp: code }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? "Verification failed");
      await login({
        id: data.id,
        name: data.name ?? "Patient",
        phone: data.phone ?? fullPhone,
        profilePhoto: data.profilePhoto ?? undefined,
      });
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message ?? "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(text: string, index: number) {
    const char = text.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setError("");
    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyPress(key: string, index: number) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      otpRefs.current[index - 1]?.focus();
    }
  }

  function goBack() {
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setDevOtp(null);
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
            {step === "phone" ? (
              <>
                <Text style={styles.cardTitle}>Welcome</Text>
                <Text style={styles.cardSub}>Sign in or create your account</Text>

                {/* Phone field */}
                <View style={styles.fieldWrap}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeTxt}>{countryCode}</Text>
                    <Feather name="chevron-down" size={12} color="rgba(255,255,255,0.35)" />
                  </View>
                  <View style={styles.fieldDivider} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Enter phone number"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(t) => { setPhone(t); setError(""); }}
                    maxLength={10}
                    returnKeyType="done"
                    onSubmitEditing={handleSendOtp}
                  />
                </View>

                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <Pressable
                  onPress={handleSendOtp}
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
                        <Text style={styles.ctaText}>Send OTP</Text>
                        <Feather name="arrow-right" size={16} color="#FFF" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.backRow} onPress={goBack}>
                  <Feather name="arrow-left" size={15} color="#818CF8" />
                  <Text style={styles.backTxt}>Change number</Text>
                </Pressable>

                <Text style={styles.cardTitle}>Enter OTP</Text>
                <Text style={styles.cardSub}>
                  6-digit code sent to {countryCode} {phone}
                </Text>

                {/* Dev OTP hint */}
                {!!devOtp && (
                  <View style={styles.devHint}>
                    <Feather name="info" size={12} color="#06B6D4" />
                    <Text style={styles.devHintTxt}>Dev OTP: <Text style={styles.devHintCode}>{devOtp}</Text></Text>
                  </View>
                )}

                {/* OTP boxes */}
                <View style={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(r) => { otpRefs.current[i] = r; }}
                      style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
                      value={digit}
                      onChangeText={(t) => handleOtpChange(t, i)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      selectionColor="#4F46E5"
                    />
                  ))}
                </View>

                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <Pressable
                  onPress={handleVerifyOtp}
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
                        <Text style={styles.ctaText}>Verify & Continue</Text>
                        <Feather name="check" size={16} color="#FFF" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                <Pressable style={styles.resendRow} onPress={handleSendOtp} disabled={loading}>
                  <Text style={styles.resendTxt}>
                    Didn't receive OTP?{" "}
                    <Text style={styles.resendLink}>Resend</Text>
                  </Text>
                </Pressable>
              </>
            )}

            <View style={styles.securityRow}>
              <Feather name="shield" size={11} color="rgba(255,255,255,0.2)" />
              <Text style={styles.securityTxt}>256-bit encrypted · Your data is safe</Text>
            </View>
          </View>

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

  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  backTxt: { fontSize: 13, color: "#818CF8", fontWeight: "600" },

  fieldWrap: { flexDirection: "row", alignItems: "center", height: 54, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1.5, borderColor: "rgba(99,102,241,0.35)", marginBottom: 16 },
  countryCode: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14 },
  countryCodeTxt: { fontSize: 15, color: "#FFF", fontWeight: "600" },
  fieldDivider: { width: 1, height: 26, backgroundColor: "rgba(255,255,255,0.12)" },
  fieldInput: { flex: 1, fontSize: 15, color: "#FFF", fontWeight: "500", paddingHorizontal: 14 },

  devHint: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(6,182,212,0.1)", borderWidth: 1, borderColor: "rgba(6,182,212,0.25)", borderRadius: 10, padding: 10, marginBottom: 16 },
  devHintTxt: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: "500" },
  devHintCode: { color: "#06B6D4", fontWeight: "800", letterSpacing: 2 },

  otpRow: { flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 20 },
  otpBox: { width: 44, height: 54, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1.5, borderColor: "rgba(99,102,241,0.35)", fontSize: 22, fontWeight: "700", color: "#FFF" },
  otpBoxFilled: { borderColor: "#4F46E5", backgroundColor: "rgba(79,70,229,0.18)" },

  errorText: { fontSize: 12, color: "#F87171", marginBottom: 10 },

  ctaOuter: { borderRadius: 14, overflow: "hidden", marginBottom: 16 },
  ctaGrad: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#FFF", letterSpacing: 0.3 },

  resendRow: { alignItems: "center", marginBottom: 4 },
  resendTxt: { fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: "500" },
  resendLink: { color: "#818CF8", fontWeight: "700" },

  securityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 4 },
  securityTxt: { fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: "500" },

  statsRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 16, paddingVertical: 12, marginBottom: 14 },
  statDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.08)" },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.32)", fontWeight: "500" },

  terms: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", lineHeight: 18 },
  termsLink: { color: "#818CF8", fontWeight: "600" },
});
