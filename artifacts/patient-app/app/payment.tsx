import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { EventSourcePolyfill } from "event-source-polyfill";
import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
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

const RNEventSource = typeof EventSource !== "undefined" ? EventSource : EventSourcePolyfill;

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
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 20 + 64;

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
  const time        = params.time        ?? "";
  const patientName = params.patientName ?? patient?.name ?? "";
  const tokenType   = (params.tokenType  ?? "normal") as "normal" | "emergency";
  const isEmergency = tokenType === "emergency";
  const paramPayableNow = Number(params.payableNow ?? "20");
  const paramConsultFee = Number(params.consultFee ?? "0");

  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [rzpVisible, setRzpVisible] = useState(false);
  const [rzpOrder, setRzpOrder] = useState<{ id: string; amount: number; currency: string } | null>(null);
  const [bookedTokenNum, setBookedTokenNum] = useState<number | null>(null);

  // Live Firebase data — 0-second delay via onSnapshot
  const [liveClinic, setLiveClinic] = useState(clinic);
  const [liveTime, setLiveTime] = useState(time);
  const [livePhone, setLivePhone] = useState("");
  const [liveNormalFee, setLiveNormalFee] = useState<number | null>(null);
  const [liveEmergencyFee, setLiveEmergencyFee] = useState<number | null>(null);
  const [liveClinicConsultFee, setLiveClinicConsultFee] = useState<number | null>(null);
  const [liveClinicEmergencyFee, setLiveClinicEmergencyFee] = useState<number | null>(null);
  const [livePlatformFee, setLivePlatformFee] = useState<number | null>(null);

  const eAppFee = isEmergency
    ? (liveEmergencyFee ?? paramPayableNow - 10)
    : (liveNormalFee ?? paramPayableNow - 10);
  const platformFee = livePlatformFee ?? 10;
  const consultFee = isEmergency
    ? (liveClinicEmergencyFee ?? paramConsultFee)
    : (liveClinicConsultFee ?? paramConsultFee);
  const payableNow = eAppFee + platformFee;

  // Real-time next token via SSE
  const [nextToken, setNextToken] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [isFull, setIsFull] = useState(false);
  const nextTokenRef = useRef<number | null>(null);

  // Result modal state
  const [resultModal, setResultModal] = useState<{
    visible: boolean;
    type: "success" | "adjusted" | "full" | "duplicate";
    message: string;
    tokenNumber?: number;
    tokenId?: string;
  }>({ visible: false, type: "success", message: "" });

  // Fetch Razorpay public key from the API server (avoids needing EXPO_PUBLIC_RAZORPAY_KEY_ID)
  useEffect(() => {
    const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
    fetch(`${BASE}/api/razorpay/config`)
      .then(r => r.json())
      .then(d => { if (d.keyId) setRazorpayKeyId(d.keyId); })
      .catch(() => {});
  }, []);

  const [liveDoctorPhoto, setLiveDoctorPhoto] = useState("");
  const [feeLabels, setFeeLabels] = useState({ normal: "Normal E-Token Fee", emergency: "Emergency E-Token Fee", platform: "Platform Fee" });

  useEffect(() => {
    if (!params.doctorId) return;
    const ref = doc(db, "doctors", params.doctorId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      if (data.profilePhoto || data.photo) setLiveDoctorPhoto(data.profilePhoto || data.photo);
      setFeeLabels({
        normal: data.consultFeeLabel || "Normal E-Token Fee",
        emergency: data.emergencyFeeLabel || "Emergency E-Token Fee",
        platform: data.platformFeeLabel || "Platform Fee",
      });
      if (data.consultFee != null) setLiveNormalFee(Number(data.consultFee));
      if (data.emergencyFee != null) setLiveEmergencyFee(Number(data.emergencyFee));
      if (data.clinicConsultFee != null) setLiveClinicConsultFee(Number(data.clinicConsultFee));
      if (data.clinicEmergencyFee != null) setLiveClinicEmergencyFee(Number(data.clinicEmergencyFee));
      if (data.platformFee != null) setLivePlatformFee(Number(data.platformFee));
      const calEntry = data.calendar?.[date];
      const shiftCfg = calEntry?.[shift];
      let resolvedClinicName = shiftCfg?.clinicName ?? "";
      if (shiftCfg) {
        if (resolvedClinicName) setLiveClinic(resolvedClinicName);
        if (shiftCfg.startTime && shiftCfg.endTime)
          setLiveTime(`${shiftCfg.startTime} – ${shiftCfg.endTime}`);
      }
      const clinicsArr = Array.isArray(data.clinics) ? data.clinics : [];
      const matchedClinic = clinicsArr.find((c: any) => c.name === resolvedClinicName && c.active !== false);
      if (matchedClinic?.phone) {
        setLivePhone(matchedClinic.phone);
      } else if (shiftCfg?.clinicPhone) {
        setLivePhone(shiftCfg.clinicPhone);
      }
    }, () => {});
    return () => unsub();
  }, [params.doctorId, date, shift]);

  // SSE: subscribe to next-token stream (polyfill works on both web + React Native)
  useEffect(() => {
    if (!params.doctorId) return;
    const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
    const url = `${BASE}/api/queues/${params.doctorId}/next-token/stream?date=${date}&shift=${shift}`;

    const es = new RNEventSource(url);
    es.onmessage = (ev: MessageEvent) => {
      try {
        const d = JSON.parse(ev.data);
        setNextToken(d.nextTokenNumber ?? null);
        setRemaining(d.remaining ?? null);
        setMaxTokens(d.maxTokens ?? null);
        setIsFull(d.isFull === true);
        nextTokenRef.current = d.nextTokenNumber ?? null;
      } catch (_) {}
    };
    es.onerror = () => {
      // SSE error — will auto-reconnect via polyfill
    };
    return () => es.close();
  }, [params.doctorId, date, shift]);

  // Polling fallback for environments where SSE cannot connect
  useEffect(() => {
    if (!params.doctorId) return;
    const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`${BASE}/api/queues/${params.doctorId}?date=${date}&shift=${shift}`);
        const data = await res.json();
        if (active) {
          const nt = (data.nextTokenNumber ?? 0) + 1;
          setNextToken(nt);
          nextTokenRef.current = nt;
          // Use server-computed remaining/isFull (includes active reservations, not just totalBooked)
          setRemaining(data.remaining ?? (data.maxTokens != null ? Math.max(0, data.maxTokens - (data.totalBooked ?? 0)) : null));
          setMaxTokens(data.maxTokens ?? null);
          setIsFull(data.isFull ?? (data.maxTokens != null && (data.totalBooked ?? 0) >= data.maxTokens));
        }
      } catch (_) {}
    };
    poll();
    const iv = setInterval(poll, 5_000);
    return () => { active = false; clearInterval(iv); };
  }, [params.doctorId, date, shift]);

  const apiBase = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

  async function handlePay() {
    if (isFull) return;
    // If the key isn't loaded yet, attempt a quick re-fetch before failing
    let activeKeyId = razorpayKeyId;
    if (!activeKeyId) {
      try {
        const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
        const cfgRes = await fetch(`${BASE}/api/razorpay/config`);
        const cfgData = await cfgRes.json();
        if (cfgData.keyId) { setRazorpayKeyId(cfgData.keyId); activeKeyId = cfgData.keyId; }
      } catch (_) {}
    }
    if (!activeKeyId) {
      setResultModal({ visible: true, type: "full", message: "Payment gateway not ready. Please check your connection and try again." });
      return;
    }
    setLoading(true);
    try {
      // Step 1: soft-lock a token number before touching payment
      // forMemberId = selectedMember.id from booking screen ("self" or "member_0" etc.)
      const forMemberId = params.patientId ?? "self";
      if (patient?.id && params.doctorId) {
        const resRes = await fetch(`${apiBase}/tokens/reserve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: params.doctorId,
            patientId: patient.id,
            date,
            shift,
            forMemberId,
          }),
        });
        const resData = await resRes.json();
        if (resData.duplicateBooking) {
          setResultModal({ visible: true, type: "duplicate", message: "You already have an active token for this slot. Check My Bookings to view it." });
          return;
        }
        if (resRes.status === 409 || resData.capacityFull) {
          setIsFull(true);
          setResultModal({ visible: true, type: "full", message: "No slots available. All tokens are booked." });
          return;
        }
        if (resData.tokenNumber) {
          nextTokenRef.current = resData.tokenNumber;
          setNextToken(resData.tokenNumber);
        }
      }

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
        openRazorpayWeb(order, activeKeyId);
      } else {
        setRzpVisible(true);
      }
    } catch (err: any) {
      setResultModal({
        visible: true, type: "full",
        message: err.message ?? "Could not initiate payment.",
      });
    } finally {
      setLoading(false);
    }
  }

  function openRazorpayWeb(order: any, keyId: string) {
    if (Platform.OS !== "web") return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const rzp = new (window as any).Razorpay({
        key: keyId,
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
      const verifyRes = await fetch(`${apiBase}/razorpay/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setResultModal({
          visible: true, type: "full",
          message: "Payment verification failed. Please contact support if money was deducted.",
        });
        return;
      }

      const expectedToken = nextTokenRef.current;

      const bookRes = await fetch(`${apiBase}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: params.doctorId!,
          patientId: patient?.id ?? undefined,
          patientName: patientName,
          patientPhone: patient?.phone,
          date,
          shift,
          type: tokenType,
          visitType,
          forMemberId: params.patientId ?? "self",
          paymentId,
          orderId,
          expectedTokenNumber: expectedToken,
        }),
      });

      if (bookRes.status === 409) {
        const errData = await bookRes.json().catch(() => ({}));
        if (errData.duplicateBooking) {
          // Payment was already taken — attempt refund before showing modal
          let dupRefundInitiated = false;
          let dupRefundId: string | null = null;
          if (paymentId && orderId && signature) {
            try {
              const rfRes = await fetch(`${apiBase}/razorpay/refund`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, orderId, razorpay_signature: signature }),
              });
              const rfData = await rfRes.json().catch(() => ({}));
              if (rfData.success) { dupRefundInitiated = true; dupRefundId = rfData.refundId ?? null; }
            } catch (_) {}
          }
          const dupMsg = dupRefundInitiated
            ? dupRefundId
              ? `You already have an active token for this slot. Your payment has been refunded (Ref: ${dupRefundId}).`
              : "You already have an active token for this slot. Your payment has been refunded automatically."
            : "You already have an active token for this slot. If payment was deducted, please contact support.";
          setResultModal({ visible: true, type: "duplicate", message: dupMsg });
          return;
        }
        // Server auto-refunds on CAPACITY_FULL and writes a failedBookings record.
        // Read the auto-refund result first; call the refund endpoint as a retry/fallback
        // (the endpoint is idempotent and requires the server-written failedBookings record).
        let refundInitiated: boolean = errData.refundInitiated === true;
        let refundId: string | null  = errData.refundId ?? null;

        if (!refundInitiated && paymentId && orderId && signature) {
          try {
            const rfRes  = await fetch(`${apiBase}/razorpay/refund`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, orderId, razorpay_signature: signature }),
            });
            const rfData = await rfRes.json().catch(() => ({}));
            if (rfData.success) { refundInitiated = true; refundId = rfData.refundId ?? null; }
          } catch (_) {}
        }

        const refundMsg = refundInitiated
          ? refundId
            ? `Slots are full. Your payment has been refunded (Ref: ${refundId}).`
            : "Slots are full. Your payment has been refunded automatically."
          : errData.message ?? "Slots are full. Please contact support for a refund.";
        setResultModal({ visible: true, type: "full", message: refundMsg });
        return;
      }

      if (!bookRes.ok) {
        throw new Error("Booking failed unexpectedly. Please contact support if payment was deducted.");
      }

      const booked = await bookRes.json();
      const tokenNum = booked.tokenNumber;
      setBookedTokenNum(tokenNum);

      if (booked.autoAdjusted) {
        setResultModal({
          visible: true,
          type: "adjusted",
          message: booked.message || `Selected token unavailable. Assigned next available token: ${isEmergency ? `#E${tokenNum}` : `#${tokenNum}`}.`,
          tokenNumber: tokenNum,
          tokenId: booked.id,
        });
      } else {
        setResultModal({
          visible: true,
          type: "success",
          message: booked.message || `Token booked successfully. Your token number is ${isEmergency ? `#E${tokenNum}` : `#${tokenNum}`}.`,
          tokenNumber: tokenNum,
          tokenId: booked.id,
        });
      }
    } catch (err: any) {
      setResultModal({
        visible: true, type: "full",
        message: err.message ?? "Booking failed. Please contact support if payment was deducted.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleModalDismiss() {
    const { type, tokenId } = resultModal;
    setResultModal({ ...resultModal, visible: false });
    if ((type === "success" || type === "adjusted") && tokenId) {
      router.replace(`/queue/${tokenId}` as any);
    }
  }

  const btnGradient: [string, string] = isEmergency
    ? ["#DC2626", "#EF4444"]
    : ["#4F46E5", "#0EA5E9"];

  const fmtToken = (n: number) => isEmergency ? `#E${n}` : `#${n}`;
  const displayTokenNum = bookedTokenNum
    ? fmtToken(bookedTokenNum)
    : nextToken
      ? fmtToken(nextToken)
      : "…";

  const tokenLabel = bookedTokenNum
    ? "Token No."
    : "Next Available";

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
              <Image source={{ uri: liveDoctorPhoto || doctorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName || "Doctor")}&background=4F46E5&color=fff` }} style={styles.docPhoto} contentFit="cover" />
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

            {/* Info Grid — real-time from Firebase + SSE */}
            <View style={styles.infoGrid}>
              {([
                { icon: "calendar",                          label: "Date",         val: fmtDate(date) },
                { icon: shift === "morning" ? "sun" : "moon", label: "Shift",       val: `${shift.charAt(0).toUpperCase() + shift.slice(1)} Shift` },
                { icon: "clock",                             label: "Time",         val: liveTime || "—" },
                { icon: "hash",                              label: tokenLabel,     val: displayTokenNum },
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

            {/* Slots remaining indicator — only show when some tokens are booked or queue is full */}
            {remaining !== null && maxTokens !== null && (remaining < maxTokens || isFull) && (
              <View style={[styles.slotsBar, isFull && { borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.1)" }]}>
                <View style={styles.slotsBarTrack}>
                  <View style={[styles.slotsBarFill, {
                    width: `${Math.min(100, Math.round(((maxTokens - remaining) / maxTokens) * 100))}%`,
                    backgroundColor: isFull ? "#EF4444" : remaining <= 3 ? "#F59E0B" : "#22C55E",
                  }]} />
                </View>
                <Text style={[styles.slotsText, isFull && { color: "#F87171" }]}>
                  {isFull ? "All slots booked" : `${remaining} of ${maxTokens} slots remaining`}
                </Text>
              </View>
            )}

            {/* Token + Patient Row */}
            <View style={styles.tokenPatientRow}>
              <View style={[styles.tokenBox, isEmergency ? { borderColor: "rgba(239,68,68,0.5)", backgroundColor: "rgba(239,68,68,0.15)" } : { borderColor: "rgba(245,158,11,0.4)", backgroundColor: "rgba(245,158,11,0.12)" }]}>
                <Feather name="tag" size={12} color={isEmergency ? "#EF4444" : "#F59E0B"} />
                <Text style={[styles.tokenNum, { color: isEmergency ? "#EF4444" : "#F59E0B" }]}>{displayTokenNum}</Text>
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
              <Feather name="monitor" size={12} color={isEmergency ? "#EF4444" : "#67E8F9"} />
              <Text style={styles.feeLbl}>{isEmergency ? feeLabels.emergency : feeLabels.normal}</Text>
              <Text style={[styles.feeVal, { color: isEmergency ? "#EF4444" : "#67E8F9" }]}>₹{eAppFee}</Text>
            </View>
            <View style={styles.feeDivider} />
            <View style={styles.feeRow}>
              <Feather name="shield" size={12} color="#818CF8" />
              <Text style={styles.feeLbl}>{feeLabels.platform}</Text>
              <Text style={[styles.feeVal, { color: "#818CF8" }]}>₹{platformFee}</Text>
            </View>
            <View style={styles.feeDivider} />
            <View style={styles.feeRow}>
              <Feather name="home" size={12} color="rgba(255,255,255,0.3)" />
              <Text style={styles.feeLblSub}>{isEmergency ? "Emergency Consult (at clinic)" : "Consultation (at clinic)"}</Text>
              <Text style={[styles.feeValSub, isEmergency && { color: "#FCA5A5" }]}>₹{consultFee}</Text>
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
        <Pressable
          style={[styles.payBtn, (loading || isFull) && { opacity: 0.7 }]}
          onPress={handlePay}
          disabled={loading || isFull}
        >
          <LinearGradient
            colors={isFull ? ["#6B7280", "#4B5563"] : btnGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : isFull ? (
            <>
              <Feather name="x-circle" size={16} color="#FFF" />
              <Text style={styles.payBtnTxt}>Slots Full</Text>
            </>
          ) : (
            <>
              <Feather name="lock" size={16} color="#FFF" />
              <Text style={styles.payBtnTxt}>Pay ₹{payableNow} & Confirm</Text>
            </>
          )}
        </Pressable>
        <View style={styles.footer}>
          <Feather name="shield" size={11} color="rgba(255,255,255,0.2)" />
          <Text style={styles.footerTxt}>Powered by LINESETU · Secure Payment</Text>
        </View>
      </View>

      {rzpOrder && !isWeb && (
        <RazorpayCheckout
          visible={rzpVisible}
          options={{
            keyId: razorpayKeyId,
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
            setResultModal({ visible: true, type: "full", message: err });
          }}
          onDismiss={() => setRzpVisible(false)}
        />
      )}

      {/* Result Modal */}
      <Modal visible={resultModal.visible} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <View style={[modalStyles.iconCircle, {
              backgroundColor:
                resultModal.type === "full"      ? "rgba(239,68,68,0.15)"   :
                resultModal.type === "duplicate" ? "rgba(245,158,11,0.15)"  :
                resultModal.type === "adjusted"  ? "rgba(245,158,11,0.15)"  :
                                                   "rgba(34,197,94,0.15)",
            }]}>
              <Feather
                name={
                  resultModal.type === "full"      ? "x-circle"     :
                  resultModal.type === "duplicate" ? "alert-circle"  :
                  resultModal.type === "adjusted"  ? "alert-circle"  :
                                                     "check-circle"
                }
                size={36}
                color={
                  resultModal.type === "full"      ? "#EF4444" :
                  resultModal.type === "duplicate" ? "#F59E0B" :
                  resultModal.type === "adjusted"  ? "#F59E0B" :
                                                     "#22C55E"
                }
              />
            </View>
            <Text style={modalStyles.title}>
              {resultModal.type === "full"      ? "Booking Failed"    :
               resultModal.type === "duplicate" ? "Already Booked"    :
               resultModal.type === "adjusted"  ? "Token Adjusted"    :
                                                  "Booking Confirmed!"}
            </Text>
            {resultModal.tokenNumber && resultModal.type !== "full" && resultModal.type !== "duplicate" && (
              <Text style={[modalStyles.tokenNum, { color: isEmergency ? "#EF4444" : "#F59E0B" }]}>{isEmergency ? `#E${resultModal.tokenNumber}` : `#${resultModal.tokenNumber}`}</Text>
            )}
            <Text style={modalStyles.message}>{resultModal.message}</Text>
            <Pressable style={[modalStyles.btn, {
              backgroundColor: resultModal.type === "full" ? "#EF4444" : resultModal.type === "duplicate" ? "#F59E0B" : "#4F46E5",
            }]} onPress={handleModalDismiss}>
              <Text style={modalStyles.btnTxt}>
                {resultModal.type === "full" ? "Go Back" : resultModal.type === "duplicate" ? "Go Back" : "View Queue"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 30 },
  card: { width: "100%", maxWidth: 340, backgroundColor: "#111827", borderRadius: 24, padding: 28, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "800", color: "#FFF", marginBottom: 8, textAlign: "center" },
  tokenNum: { fontSize: 40, fontWeight: "900", color: "#A5B4FC", marginBottom: 8 },
  message: { fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 19, marginBottom: 24 },
  btn: { width: "100%", height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  btnTxt: { fontSize: 14, fontWeight: "800", color: "#FFF" },
});

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

  slotsBar: { borderRadius: 12, padding: 10, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  slotsBarTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 6 },
  slotsBarFill: { height: "100%", borderRadius: 3 },
  slotsText: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.5)", textAlign: "center" },

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
