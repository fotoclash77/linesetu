import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useBookToken } from "@workspace/api-client-react";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import RazorpayCheckout from "@/components/RazorpayCheckout";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? "";

const isWeb = Platform.OS === "web";


function fmtDate(iso: string) {
  if (!iso) return "—";
  const [yr, mo, d] = iso.split("-").map(Number);
  if (!yr || !mo || !d) return iso;
  const dt = new Date(yr, mo - 1, d);
  return dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
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
    doctorSpec?: string;
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

  const doctorName  = params.doctorName  ?? "Doctor";
  const doctorPhoto = params.doctorPhoto ?? "";
  const doctorSpec  = params.doctorSpec  ?? "";
  const visitType   = params.visitType   ?? "first-visit";
  const date        = params.date        ?? "";
  const shift       = (params.shift      ?? "morning").toLowerCase();
  const clinic      = params.clinic      ?? "Clinic";
  const clinicLoc   = params.clinicLoc   ?? "";
  const time        = params.time        ?? "";
  const patientName = params.patientName ?? patient?.name ?? "Patient";
  const tokenType   = (params.tokenType  ?? "normal") as "normal" | "emergency";
  const isEmergency = tokenType === "emergency";
  const payableNow  = Number(params.payableNow ?? "20");
  const consultFee  = Number(params.consultFee ?? "0");
  const eAppFee     = isEmergency ? 20 : 10;
  const platformFee = 10;

  const [loading, setLoading] = useState(false);
  const [rzpVisible, setRzpVisible] = useState(false);
  const [rzpOrder, setRzpOrder] = useState<{ id: string; amount: number; currency: string } | null>(null);
  const [bookedTokenNum, setBookedTokenNum] = useState<number | null>(null);

  // Live Firebase data — 0-second delay via onSnapshot
  const [liveClinic, setLiveClinic] = useState(clinic);
  const [liveTime, setLiveTime] = useState(time);
  const [livePhone, setLivePhone] = useState("");

  useEffect(() => {
    if (!params.doctorId) return;
    const ref = doc(db, "doctors", params.doctorId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      // Doctor-level phone (clinic contact)
      if (data.phone) setLivePhone(data.phone);
      // Shift-specific data from calendar
      const calEntry = data.calendar?.[date];
      const shiftCfg = calEntry?.[shift];
      if (shiftCfg) {
        if (shiftCfg.clinicName) setLiveClinic(shiftCfg.clinicName);
        if (shiftCfg.startTime && shiftCfg.endTime)
          setLiveTime(`${shiftCfg.startTime} – ${shiftCfg.endTime}`);
        // clinicPhone at shift level overrides doctor-level
        if (shiftCfg.clinicPhone) setLivePhone(shiftCfg.clinicPhone);
      }
    }, () => {/* ignore errors — fallback to param values already set */});
    return () => unsub();
  }, [params.doctorId, date, shift]);

  const bookToken = useBookToken();

  const apiBase = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

  async function handlePay() {
    setLoading(true);
    try {
      const amountPaise = payableNow * 100;
      const res = await fetch(`${apiBase}/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: `rcpt_${patient?.id ?? "guest"}_${Date.now()}`,
          notes: { doctorId: params.doctorId, patientId: patient?.id },
        }),
      });
      if (!res.ok) throw new Error("Order creation failed");
      const order = await res.json();
      setRzpOrder(order);
      if (isWeb) {
        openRazorpayWeb(order);
      } else {
        setRzpVisible(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not initiate payment.");
    } finally {
      setLoading(false);
    }
  }

  function openRazorpayWeb(order: any) {
    if (typeof window === "undefined") return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "LINESETU",
        description: `Token booking for ${doctorName}`,
        prefill: { name: patientName, contact: patient?.phone ?? "" },
        theme: { color: "#4F46E5" },
        handler: (response: any) => {
          handlePaymentSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
        },
      });
      rzp.open();
    };
    document.body.appendChild(script);
  }

  async function handlePaymentSuccess(paymentId: string, orderId: string, signature: string) {
    setRzpVisible(false);
    setLoading(true);
    try {
      await fetch(`${apiBase}/razorpay/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature }),
      });
      const booked = await bookToken.mutateAsync({
        data: {
          doctorId: params.doctorId!,
          patientId: patient?.id ?? params.patientId ?? undefined,
          patientName: patientName,
          patientPhone: patient?.phone,
          date,
          shift,
          type: tokenType,
          paymentId,
        } as any,
      });
      if (booked?.tokenNumber) setBookedTokenNum(booked.tokenNumber);
      router.replace(`/queue/${booked.id}` as any);
    } catch {
      Alert.alert("Booking Failed", "Payment received but booking failed. Contact support.");
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
                <Text style={styles.docSpec}>{doctorSpec || "Doctor"}</Text>
              </View>
              {isEmergency ? (
                <View style={styles.emergencyBadge}>
                  <Feather name="alert-triangle" size={10} color="#EF4444" />
                  <Text style={styles.emergencyBadgeTxt}>Emergency</Text>
                </View>
              ) : (
                <View style={styles.onlineBadge}>
                  <Feather name="monitor" size={10} color="#06B6D4" />
                  <Text style={styles.onlineBadgeTxt}>E-Token</Text>
                </View>
              )}
            </View>

            {/* Info Grid — real-time from Firebase */}
            <View style={styles.infoGrid}>
              {([
                { icon: "calendar",                          label: "Date",         val: fmtDate(date) },
                { icon: shift === "morning" ? "sun" : "moon", label: "Shift",       val: `${shift.charAt(0).toUpperCase() + shift.slice(1)} Shift` },
                { icon: "clock",                             label: "Time",         val: liveTime || "—" },
                { icon: "hash",                              label: "Token No.",    val: bookedTokenNum ? `#${bookedTokenNum}` : "—" },
                { icon: "home",                              label: "Clinic",       val: liveClinic || "—" },
                { icon: "phone",                             label: "Clinic Phone", val: livePhone || "—" },
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
                <Text style={[styles.tokenNum, { color: isEmergency ? "#EF4444" : "#A5B4FC" }]}>{bookedTokenNum ? `#${bookedTokenNum}` : "—"}</Text>
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
              <Text style={styles.feeLbl}>E-Token Fee</Text>
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

      {rzpOrder && !isWeb && (
        <RazorpayCheckout
          visible={rzpVisible}
          options={{
            keyId: RAZORPAY_KEY_ID,
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: "LINESETU",
            description: `Token booking — ${doctorName}`,
            prefillName: patientName,
            prefillContact: patient?.phone ?? "",
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={(err) => {
            setRzpVisible(false);
            Alert.alert("Payment Failed", err);
          }}
          onDismiss={() => setRzpVisible(false)}
        />
      )}
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
