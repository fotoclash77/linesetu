import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useBookToken } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

const isWeb = Platform.OS === "web";

const PAYMENT_METHODS = [
  { id: "upi",     label: "UPI / QR Pay",       sub: "GPay, PhonePe, Paytm, BHIM",    icon: "smartphone" as const,   color: "#818CF8" },
  { id: "card",    label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay",       icon: "credit-card" as const,  color: "#06B6D4" },
  { id: "netbank", label: "Net Banking",         sub: "All major Indian banks",         icon: "globe" as const,        color: "#22C55E" },
];

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function fmtDate(d: number) {
  const dow = (3 + d - 1) % 7;
  return `${DAY_NAMES[dow]}, ${d} Apr 2026`;
}

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 20;

  const params = useLocalSearchParams<{
    doctorId?: string;
    doctorName?: string;
    doctorPhoto?: string;
    visitType?: string;
    date?: string;
    shift?: string;
    clinic?: string;
    clinicLoc?: string;
    time?: string;
    patientId?: string;
    patientName?: string;
    tokenType?: string;
    payableNow?: string;
    consultFee?: string;
  }>();

  const doctorName  = params.doctorName  ?? "Dr. Ananya Sharma";
  const doctorPhoto = params.doctorPhoto ?? "https://randomuser.me/api/portraits/women/44.jpg";
  const visitType   = params.visitType   ?? "First Visit";
  const date        = Number(params.date ?? "10");
  const shift       = params.shift       ?? "Morning";
  const clinic      = params.clinic      ?? "HeartCare Clinic";
  const clinicLoc   = params.clinicLoc   ?? "Andheri West, Mumbai";
  const time        = params.time        ?? "10:00 AM – 2:00 PM";
  const patientName = params.patientName ?? patient?.name ?? "Rahul Sharma";
  const tokenType   = (params.tokenType  ?? "normal") as "normal" | "emergency";
  const isEmergency = tokenType === "emergency";
  const payableNow  = Number(params.payableNow ?? "20");
  const consultFee  = Number(params.consultFee ?? "500");
  const eAppFee     = isEmergency ? 20 : 10;
  const platformFee = 10;
  const yourToken   = 43;

  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId]   = useState("");
  const [loading, setLoading] = useState(false);

  const bookToken = useBookToken();

  async function handlePay() {
    if (method === "upi" && !upiId.trim()) {
      Alert.alert("Enter UPI ID", "Please enter your UPI ID to continue.");
      return;
    }
    setLoading(true);
    try {
      await bookToken.mutateAsync({
        data: {
          doctorId: params.doctorId ?? "demo1",
          patientId: patient?.id ?? params.patientId ?? "self",
          patientName: patient?.name ?? "Patient",
          patientPhone: patient?.phone,
          date: String(date),
          shift: shift.toLowerCase(),
          type: tokenType,
        },
      });
      router.replace(`/queue/token-${Date.now()}`);
    } catch {
      Alert.alert("Payment Failed", "Unable to book token. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const btnGradient: [string, string] = isEmergency
    ? ["#DC2626", "#EF4444"]
    : ["#4F46E5", "#0EA5E9"];

  return (
    <View style={styles.container}>
      <View style={[styles.orb1, isEmergency && { backgroundColor: "rgba(239,68,68,0.2)" }]} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 6 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm & Pay</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: bottomPad + 100 }} showsVerticalScrollIndicator={false}>

        {/* Appointment Summary */}
        <View style={styles.sectionPad}>
          <View style={styles.summaryCard}>
            {/* Doctor Row */}
            <View style={styles.docRow}>
              <Image source={{ uri: doctorPhoto }} style={styles.docPhoto} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Text style={styles.docName} numberOfLines={1}>{doctorName}</Text>
                  <Feather name="check-circle" size={12} color="#4F46E5" />
                </View>
                <Text style={styles.docSpec}>Cardiologist</Text>
              </View>
              {isEmergency ? (
                <View style={styles.emergencyBadge}>
                  <Feather name="alert-triangle" size={10} color="#EF4444" />
                  <Text style={styles.emergencyBadgeTxt}>Emergency</Text>
                </View>
              ) : (
                <View style={styles.onlineBadge}>
                  <Feather name="monitor" size={10} color="#06B6D4" />
                  <Text style={styles.onlineBadgeTxt}>E-Appointment</Text>
                </View>
              )}
            </View>

            {/* 2×2 Info Grid */}
            <View style={styles.infoGrid}>
              {([
                { icon: "calendar",                        label: "Date",      val: fmtDate(date) },
                { icon: shift === "Morning" ? "sun" : "moon", label: "Shift",  val: `${shift} Shift` },
                { icon: "hash",                            label: "Token No.", val: `#${yourToken}` },
                { icon: "clock",                           label: "Time",      val: time },
              ] as Array<{ icon: React.ComponentProps<typeof Feather>["name"]; label: string; val: string }>).map(({ icon, label, val }) => (
                <View key={label} style={styles.infoCell}>
                  <View style={styles.infoCellHeader}>
                    <Feather name={icon} size={10} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.infoCellLbl}>{label}</Text>
                  </View>
                  <Text style={styles.infoCellVal}>{val}</Text>
                </View>
              ))}
            </View>

            {/* Token + Patient Row */}
            <View style={styles.tokenPatientRow}>
              <View style={[styles.tokenBox, isEmergency && { borderColor: "rgba(239,68,68,0.5)", backgroundColor: "rgba(239,68,68,0.15)" }]}>
                <Feather name="tag" size={12} color={isEmergency ? "#EF4444" : "#A5B4FC"} />
                <Text style={[styles.tokenNum, { color: isEmergency ? "#EF4444" : "#A5B4FC" }]}>#{yourToken}</Text>
              </View>
              <View style={styles.patientBox}>
                <Feather name="user" size={12} color="rgba(255,255,255,0.4)" />
                <Text style={styles.patientTxt}>{patientName}</Text>
                <View style={styles.visitTypePill}>
                  <Text style={styles.visitTypeTxt}>{visitType}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Fee Breakdown */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Fee Breakdown</Text>
          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Feather name="monitor" size={12} color="#67E8F9" />
              <Text style={styles.feeLbl}>E-Appointment Fee</Text>
              <Text style={[styles.feeVal, { color: "#67E8F9" }]}>₹{eAppFee}</Text>
            </View>
            <View style={styles.feeDivider} />
            <View style={styles.feeRow}>
              <Feather name="shield" size={12} color="#818CF8" />
              <Text style={styles.feeLbl}>LINESETU Platform Fee</Text>
              <Text style={[styles.feeVal, { color: "#818CF8" }]}>₹{platformFee}</Text>
            </View>
            <View style={styles.feeDivider} />
            <View style={styles.feeRow}>
              <Feather name="home" size={12} color="rgba(255,255,255,0.3)" />
              <Text style={styles.feeLblSub}>Consultation (at clinic)</Text>
              <Text style={styles.feeValSub}>₹{consultFee}</Text>
            </View>
            <View style={[styles.feeDivider, { borderColor: "rgba(255,255,255,0.12)" }]} />
            <View style={styles.feeTotalRow}>
              <Text style={styles.feeTotalLbl}>Pay Now</Text>
              <Text style={[styles.feeTotalVal, isEmergency && { color: "#F87171" }]}>₹{payableNow}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Payment Method</Text>
          <View style={{ gap: 8 }}>
            {PAYMENT_METHODS.map(pm => {
              const isSelected = method === pm.id;
              return (
                <Pressable
                  key={pm.id}
                  style={[styles.payMethodCard, isSelected && styles.payMethodSelected]}
                  onPress={() => setMethod(pm.id)}
                >
                  <View style={[styles.payMethodIcon, { backgroundColor: pm.color + "18" }]}>
                    <Feather name={pm.icon} size={18} color={pm.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payMethodLabel, isSelected && { color: "#FFF" }]}>{pm.label}</Text>
                    <Text style={styles.payMethodSub}>{pm.sub}</Text>
                  </View>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: pm.color }]} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* UPI ID input */}
          {method === "upi" && (
            <View style={styles.upiInputWrap}>
              <Feather name="at-sign" size={14} color="#818CF8" style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.upiInput}
                placeholder="Enter UPI ID (e.g. name@upi)"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          )}
        </View>

        {/* Security Info */}
        <View style={styles.sectionPad}>
          <View style={styles.securityCard}>
            <Feather name="lock" size={13} color="#22C55E" />
            <Text style={styles.securityTxt}>256-bit SSL encryption · PCI-DSS compliant · Payments never stored</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Pay CTA */}
      <View style={[styles.bottomCta, { paddingBottom: bottomPad }]}>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.totalLabel}>Total to pay now</Text>
          <Text style={[styles.totalAmt, isEmergency && { color: "#F87171" }]}>₹{payableNow}</Text>
        </View>
        <Pressable style={[styles.payBtn, loading && { opacity: 0.7 }]} onPress={handlePay} disabled={loading}>
          <LinearGradient colors={btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Feather name="lock" size={16} color="#FFF" />
              <Text style={styles.payBtnTxt}>Pay ₹{payableNow} & Confirm</Text>
            </>
          )}
        </Pressable>
        <View style={styles.footer}>
          <Feather name="shield" size={11} color="rgba(255,255,255,0.2)" />
          <Text style={styles.footerTxt}>Powered by LINESETU 🔒 Secure Payment</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -50, left: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.2)" },
  orb2: { position: "absolute", bottom: 160, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.14)" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingBottom: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },

  sectionPad: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },

  summaryCard: { borderRadius: 22, padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.09)", gap: 14 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  docPhoto: { width: 50, height: 50, borderRadius: 15, borderWidth: 2, borderColor: "rgba(99,102,241,0.4)" },
  docName: { fontSize: 14, fontWeight: "800", color: "#FFF" },
  docSpec: { fontSize: 11, color: "#67E8F9", fontWeight: "600", marginTop: 2 },
  onlineBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9, backgroundColor: "rgba(6,182,212,0.15)", borderWidth: 1, borderColor: "rgba(6,182,212,0.35)" },
  onlineBadgeTxt: { fontSize: 9, fontWeight: "700", color: "#67E8F9" },
  emergencyBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9, backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 1, borderColor: "rgba(239,68,68,0.35)" },
  emergencyBadgeTxt: { fontSize: 9, fontWeight: "700", color: "#EF4444" },

  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoCell: { width: "47%", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  infoCellHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 },
  infoCellLbl: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.6 },
  infoCellVal: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.8)", lineHeight: 15 },

  tokenPatientRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  tokenBox: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.18)", borderWidth: 1, borderColor: "rgba(99,102,241,0.4)" },
  tokenNum: { fontSize: 16, fontWeight: "900" },
  patientBox: { flex: 1, flexDirection: "row", alignItems: "center", gap: 7, padding: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  patientTxt: { flex: 1, fontSize: 12, fontWeight: "700", color: "#FFF" },
  visitTypePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, backgroundColor: "rgba(34,197,94,0.15)" },
  visitTypeTxt: { fontSize: 9, fontWeight: "700", color: "#4ADE80" },

  feeCard: { borderRadius: 18, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)" },
  feeRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  feeLbl: { flex: 1, fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.75)" },
  feeVal: { fontSize: 14, fontWeight: "800" },
  feeDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginHorizontal: 0 },
  feeLblSub: { flex: 1, fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: "500" },
  feeValSub: { fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: "500" },
  feeTotalRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13 },
  feeTotalLbl: { flex: 1, fontSize: 13, fontWeight: "800", color: "#FFF" },
  feeTotalVal: { fontSize: 22, fontWeight: "900", color: "#A5B4FC" },

  payMethodCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)" },
  payMethodSelected: { backgroundColor: "rgba(79,70,229,0.18)", borderColor: "rgba(99,102,241,0.5)" },
  payMethodIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payMethodLabel: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.75)" },
  payMethodSub: { fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  radioOuterSelected: { borderColor: "#4F46E5" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },

  upiInputWrap: { flexDirection: "row", alignItems: "center", marginTop: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(129,140,248,0.4)", height: 48, overflow: "hidden" },
  upiInput: { flex: 1, fontSize: 14, color: "#FFF", paddingHorizontal: 10, height: "100%" },

  securityCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 14, backgroundColor: "rgba(34,197,94,0.07)", borderWidth: 1, borderColor: "rgba(34,197,94,0.2)" },
  securityTxt: { fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 16, flex: 1 },

  bottomCta: { paddingHorizontal: 20, paddingTop: 14, backgroundColor: "rgba(10,14,26,0.98)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
  totalLabel: { fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: "700", marginBottom: 2 },
  totalAmt: { fontSize: 26, fontWeight: "900", color: "#A5B4FC", letterSpacing: -0.5 },
  payBtn: { height: 54, borderRadius: 18, overflow: "hidden", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14, shadowColor: "rgba(79,70,229,0.5)", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.7, shadowRadius: 20, elevation: 8 },
  payBtnTxt: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 4 },
  footerTxt: { fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: "500" },
});
