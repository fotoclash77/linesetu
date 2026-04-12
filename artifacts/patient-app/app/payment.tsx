import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useBookToken } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const isWeb = Platform.OS === "web";

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const params = useLocalSearchParams<{
    doctorId: string;
    date: string;
    shift: string;
    tokenType: string;
    platformFee: string;
    consultFee: string;
    patientName: string;
    patientId: string;
    patientPhone: string;
  }>();

  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [paid, setPaid] = useState(false);

  const { mutateAsync: bookToken, isPending } = useBookToken();

  const platformFee = parseInt(params.platformFee ?? "20", 10);
  const consultFee  = parseInt(params.consultFee  ?? "500", 10);

  const handlePay = async () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPaid(true);

    try {
      const payId = `pay_${Date.now().toString(36)}`;
      const token = await bookToken({
        data: {
          doctorId:    params.doctorId ?? "",
          patientId:   params.patientId ?? "",
          patientName: params.patientName ?? "Patient",
          patientPhone: params.patientPhone ?? "",
          type:        params.tokenType ?? "normal",
          date:        params.date ?? "",
          shift:       (params.shift as "morning" | "evening") ?? "morning",
          paymentId:   payId,
        },
      });
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/queue/${token.id}`);
    } catch (e) {
      setPaid(false);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const paymentMethods = [
    { id: "upi",  label: "UPI / QR Pay",   sub: "PhonePe, GPay, Paytm",     icon: "smartphone" as const },
    { id: "card", label: "Debit / Credit",  sub: "Visa, Mastercard, RuPay",   icon: "credit-card" as const },
    { id: "nb",   label: "Net Banking",     sub: "All major Indian banks",     icon: "globe" as const },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} disabled={isPending}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <Text style={styles.navTitle}>Confirm & Pay</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 100 }}>

        {/* Booking summary */}
        <View style={styles.sectionPad}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Feather name="check-circle" size={16} color="#4ADE80" />
              <Text style={styles.summaryHeaderTxt}>Booking Summary</Text>
            </View>

            {[
              { label: "Patient",  val: params.patientName ?? "—" },
              { label: "Date",     val: params.date ?? "—" },
              { label: "Shift",    val: params.shift === "morning" ? "Morning (9AM–1PM)" : "Evening (5PM–9PM)" },
              { label: "Token",    val: params.tokenType === "emergency" ? "⚡ Emergency" : "Normal" },
            ].map(({ label, val }) => (
              <View key={label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryVal}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fee breakdown */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Fee Breakdown</Text>
          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Platform Booking Fee</Text>
              <Text style={styles.feeVal}>₹{platformFee}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>
                Doctor Earnings{params.tokenType === "emergency" ? " (Emergency)" : ""}
              </Text>
              <Text style={styles.feeVal}>₹{params.tokenType === "emergency" ? 20 : 10}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Platform Service Fee</Text>
              <Text style={styles.feeVal}>₹10</Text>
            </View>
            <View style={styles.feeDivider} />
            <View style={styles.feeRow}>
              <Text style={styles.feeTotalLabel}>Total to Pay Now</Text>
              <Text style={styles.feeTotalVal}>₹{platformFee}</Text>
            </View>
            <View style={[styles.feeRow, { marginTop: 4 }]}>
              <Text style={styles.feeNoteTxt}>Consultation fee ₹{consultFee} payable at clinic</Text>
            </View>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={{ gap: 8 }}>
            {paymentMethods.map((m) => (
              <Pressable
                key={m.id}
                style={[styles.methodCard, selectedMethod === m.id && styles.methodCardActive]}
                onPress={() => setSelectedMethod(m.id)}
              >
                <View style={[styles.methodIcon, { backgroundColor: selectedMethod === m.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.07)" }]}>
                  <Feather name={m.icon} size={16} color={selectedMethod === m.id ? "#818CF8" : "rgba(255,255,255,0.4)"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.methodLabel, selectedMethod === m.id && { color: "#FFF" }]}>{m.label}</Text>
                  <Text style={styles.methodSub}>{m.sub}</Text>
                </View>
                <View style={[styles.radioOuter, selectedMethod === m.id && { borderColor: "#4F46E5" }]}>
                  {selectedMethod === m.id && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Security note */}
        <View style={styles.sectionPad}>
          <View style={styles.secNote}>
            <Feather name="shield" size={13} color="rgba(255,255,255,0.35)" />
            <Text style={styles.secNoteTxt}>256-bit encrypted payment · Your data is safe</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay CTA */}
      <View style={[styles.ctaBar, { paddingBottom: bottomPad + 8 }]}>
        <Pressable style={styles.ctaBtn} onPress={handlePay} disabled={isPending || paid}>
          <LinearGradient
            colors={["#4F46E5", "#6366F1", "#0EA5E9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGrad}
          >
            {isPending || paid
              ? <ActivityIndicator color="#FFF" />
              : (
                <>
                  <Feather name="lock" size={16} color="#FFF" />
                  <Text style={styles.ctaBtnTxt}>Pay ₹{platformFee} Securely</Text>
                </>
              )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(99,102,241,0.2)" },
  orb2: { position: "absolute", bottom: 40, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.14)" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  sectionPad: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#FFF", marginBottom: 10 },
  summaryCard: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 18, padding: 16, gap: 4 },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  summaryHeaderTxt: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  summaryLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
  summaryVal: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.85)" },
  feeCard: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 18, padding: 16 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  feeLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  feeVal: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  feeDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginVertical: 6 },
  feeTotalLabel: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  feeTotalVal: { fontSize: 18, fontWeight: "900", color: "#818CF8" },
  feeNoteTxt: { fontSize: 10, color: "rgba(255,255,255,0.3)", fontStyle: "italic" },
  methodCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 14 },
  methodCardActive: { borderColor: "rgba(99,102,241,0.55)", backgroundColor: "rgba(99,102,241,0.1)" },
  methodIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  methodLabel: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  methodSub: { fontSize: 10, color: "rgba(255,255,255,0.35)" },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4F46E5" },
  secNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  secNoteTxt: { fontSize: 11, color: "rgba(255,255,255,0.3)" },
  ctaBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, backgroundColor: "rgba(10,14,26,0.97)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
  ctaBtn: { borderRadius: 16, overflow: "hidden" },
  ctaGrad: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  ctaBtnTxt: { fontSize: 16, fontWeight: "800", color: "#FFF" },
});
