import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

const isWeb = Platform.OS === "web";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDow(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function BookingScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const now = new Date();
  const [year]  = useState(now.getFullYear());
  const [month] = useState(now.getMonth());
  const today   = now.getDate();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedShift, setSelectedShift] = useState<"morning" | "evening">("morning");
  const [tokenType, setTokenType] = useState<"normal" | "emergency">("normal");
  const [bookingFor, setBookingFor] = useState("self");

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDow     = getFirstDow(year, month);
  const monthLabel   = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const isEmergency  = tokenType === "emergency";
  const platformFee  = isEmergency ? 30 : 20;
  const consultFee   = isEmergency ? 700 : 500;

  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;

  const handleConfirm = () => {
    router.push({
      pathname: "/payment",
      params: {
        doctorId,
        date: dateStr,
        shift: selectedShift,
        tokenType,
        platformFee: String(platformFee),
        consultFee: String(consultFee),
        patientName: patient?.name ?? "Patient",
        patientId: patient?.id ?? "",
        patientPhone: patient?.phone ?? "",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />

      {/* Header */}
      <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <Text style={styles.navTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 90 }}>

        {/* Visit type */}
        <View style={[styles.sectionPad, { paddingBottom: 0 }]}>
          <View style={styles.toggleRow}>
            {(["normal", "emergency"] as const).map((t) => (
              <Pressable key={t} style={[styles.toggleItem, tokenType === t && (t === "emergency" ? styles.toggleActiveRed : styles.toggleActiveBlue)]}
                onPress={() => setTokenType(t)}>
                <Feather name={t === "emergency" ? "alert-triangle" : "clipboard"} size={14} color={tokenType === t ? "#FFF" : "rgba(255,255,255,0.35)"} />
                <View>
                  <Text style={[styles.toggleLabel, tokenType === t && { color: "#FFF" }]}>
                    {t === "emergency" ? "Emergency" : "Normal"}
                  </Text>
                  <Text style={styles.toggleSub}>
                    {t === "emergency" ? "Priority · ₹30" : "Regular · ₹20"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.calCard}>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <View style={styles.dowRow}>
              {DOW.map((d) => (
                <Text key={d} style={[styles.dowTxt, d === "Su" && { color: "rgba(239,68,68,0.6)" }]}>{d}</Text>
              ))}
            </View>
            <View style={styles.datesGrid}>
              {Array.from({ length: firstDow }).map((_, i) => <View key={`e${i}`} style={styles.dateCell} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const dow = (firstDow + d - 1) % 7;
                const isPast = d < today;
                const isSun = dow === 0;
                const isSel = d === selectedDate;

                return (
                  <Pressable
                    key={d}
                    style={[
                      styles.dateCell,
                      isSel && styles.dateCellSelected,
                      d === today && !isSel && styles.dateCellToday,
                    ]}
                    onPress={() => !isPast && !isSun && setSelectedDate(d)}
                    disabled={isPast || isSun}
                  >
                    <Text style={[
                      styles.dateTxt,
                      isSel && { color: "#FFF", fontWeight: "800" as const },
                      isPast && { color: "rgba(255,255,255,0.18)" },
                      isSun && !isPast && { color: "rgba(239,68,68,0.45)" },
                    ]}>{d}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Shift */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Select Shift</Text>
          <View style={{ gap: 10 }}>
            {(["morning", "evening"] as const).map((s) => (
              <Pressable
                key={s}
                style={[styles.shiftCard, selectedShift === s && styles.shiftCardActive]}
                onPress={() => setSelectedShift(s)}
              >
                <View style={[styles.shiftIcon, { backgroundColor: s === "morning" ? "rgba(245,158,11,0.15)" : "rgba(129,140,248,0.15)" }]}>
                  <Feather name={s === "morning" ? "sun" : "moon"} size={16} color={s === "morning" ? "#F59E0B" : "#818CF8"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shiftLabel}>{s === "morning" ? "Morning" : "Evening"}</Text>
                  <Text style={styles.shiftTime}>{s === "morning" ? "9:00 AM – 1:00 PM" : "5:00 PM – 9:00 PM"}</Text>
                </View>
                {selectedShift === s && <Feather name="check-circle" size={18} color="#4F46E5" />}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Booking for */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Booking For</Text>
          <View style={{ gap: 8 }}>
            {[
              { id: "self", label: patient?.name ?? "Self", sub: "Myself", icon: "user" as const },
              { id: "family", label: "Family Member", sub: "Add family members in Profile", icon: "users" as const },
            ].map((m) => (
              <Pressable
                key={m.id}
                style={[styles.memberCard, bookingFor === m.id && styles.memberCardActive]}
                onPress={() => setBookingFor(m.id)}
              >
                <View style={styles.memberAvatar}>
                  <Feather name={m.icon} size={18} color="#818CF8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.label}</Text>
                  <Text style={styles.memberSub}>{m.sub}</Text>
                </View>
                {bookingFor === m.id && (
                  <View style={styles.memberCheck}>
                    <Feather name="check" size={10} color="#FFF" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Fee summary */}
        <View style={styles.sectionPad}>
          <View style={styles.feeSummary}>
            <Text style={styles.feeSummaryTitle}>Payment Summary</Text>
            {[
              { label: isEmergency ? "Emergency Slot Fee" : "Platform Booking Fee", val: `₹${platformFee}` },
              { label: "Consultation Fee", val: `₹${consultFee} (at clinic)` },
            ].map(({ label, val }) => (
              <View key={label} style={styles.feeRow}>
                <Text style={styles.feeLabel}>{label}</Text>
                <Text style={styles.feeVal}>{val}</Text>
              </View>
            ))}
            <View style={styles.feeDivider} />
            <View style={styles.feeRow}>
              <Text style={styles.feeTotalLabel}>Pay Now</Text>
              <Text style={styles.feeTotalVal}>₹{platformFee}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm CTA */}
      <View style={[styles.ctaBar, { paddingBottom: bottomPad + 8 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaLabel}>Token #{(Date.now() % 100) + 1} · {selectedShift === "morning" ? "Morning" : "Evening"}</Text>
          <Text style={styles.ctaSub}>{dateStr}</Text>
        </View>
        <Pressable style={styles.ctaBtn} onPress={handleConfirm}>
          <LinearGradient colors={["#4F46E5", "#06B6D4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGrad}>
            <Text style={styles.ctaBtnTxt}>Confirm & Pay ₹{platformFee}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(99,102,241,0.2)" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  sectionPad: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#FFF", marginBottom: 10 },
  toggleRow: { flexDirection: "row", gap: 10, padding: 5, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 16 },
  toggleItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 13 },
  toggleActiveBlue: { backgroundColor: "rgba(79,70,229,0.55)" },
  toggleActiveRed: { backgroundColor: "rgba(239,68,68,0.55)" },
  toggleLabel: { fontSize: 12, fontWeight: "800", color: "rgba(255,255,255,0.4)", lineHeight: 16 },
  toggleSub: { fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 },
  calCard: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 20, padding: 14 },
  monthLabel: { fontSize: 14, fontWeight: "700", color: "#FFF", textAlign: "center", marginBottom: 12 },
  dowRow: { flexDirection: "row", marginBottom: 6 },
  dowTxt: { flex: 1, textAlign: "center", fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.3)", paddingBottom: 6 },
  datesGrid: { flexDirection: "row", flexWrap: "wrap" },
  dateCell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 999, marginBottom: 2 },
  dateCellSelected: { backgroundColor: "#4F46E5" },
  dateCellToday: { borderWidth: 1.5, borderColor: "rgba(99,102,241,0.6)" },
  dateTxt: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  shiftCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 14 },
  shiftCardActive: { borderColor: "rgba(99,102,241,0.55)", backgroundColor: "rgba(99,102,241,0.12)" },
  shiftIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  shiftLabel: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  shiftTime: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  memberCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 12 },
  memberCardActive: { borderColor: "rgba(99,102,241,0.55)", backgroundColor: "rgba(99,102,241,0.14)" },
  memberAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.15)", alignItems: "center", justifyContent: "center" },
  memberName: { fontSize: 13, fontWeight: "800", color: "#FFF" },
  memberSub: { fontSize: 10, color: "rgba(255,255,255,0.4)" },
  memberCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#4F46E5", alignItems: "center", justifyContent: "center" },
  feeSummary: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 18, padding: 16 },
  feeSummaryTitle: { fontSize: 13, fontWeight: "700", color: "#FFF", marginBottom: 12 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  feeLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  feeVal: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  feeDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginVertical: 8 },
  feeTotalLabel: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  feeTotalVal: { fontSize: 16, fontWeight: "900", color: "#818CF8" },
  ctaBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 14, backgroundColor: "rgba(10,14,26,0.97)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
  ctaLabel: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  ctaSub: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  ctaBtn: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 14 },
  ctaBtnTxt: { fontSize: 13, fontWeight: "700", color: "#FFF" },
});
