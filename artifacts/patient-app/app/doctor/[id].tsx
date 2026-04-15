import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getGetLiveQueueQueryOptions } from "@workspace/api-client-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const isWeb = Platform.OS === "web";

export default function DoctorDetailScreen() {
  const insets = useSafeAreaInsets();
  const {
    id,
    hint_name,
    hint_photo,
    hint_spec,
    hint_clinic,
  } = useLocalSearchParams<{
    id: string;
    hint_name?: string;
    hint_photo?: string;
    hint_spec?: string;
    hint_clinic?: string;
  }>();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 20 + 64;

  // Real-time Firebase listener + REST API polling fallback
  const [doctorData, setDoctorData] = useState<any>(null);
  const firestoreActive = useRef(false);

  const fetchDoctorRest = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${BASE_URL}/api/doctors/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDoctorData(data);
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Firebase real-time listener
    const ref = doc(db, "doctors", id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          firestoreActive.current = true;
          setDoctorData({ id: snap.id, ...snap.data() });
        }
      },
      () => {
        // Firebase failed — fall through to REST polling
        firestoreActive.current = false;
        fetchDoctorRest();
      }
    );

    // REST polling fallback every 15s — kicks in if Firestore socket drops
    fetchDoctorRest();
    const poll = setInterval(() => {
      if (!firestoreActive.current) fetchDoctorRest();
    }, 15_000);

    return () => { unsub(); clearInterval(poll); };
  }, [id, fetchDoctorRest]);

  const { data: queueData } = useQuery(getGetLiveQueueQueryOptions(id ?? ""));

  const doctor = doctorData ? {
    id: doctorData.id ?? id,
    name: doctorData.name ?? hint_name ?? "Doctor",
    specialization: doctorData.specialization ?? hint_spec ?? "",
    clinicName: doctorData.clinicName ?? hint_clinic ?? "",
    location: doctorData.location ?? "",
    available: doctorData.isAvailable !== false,
    experience: doctorData.experience ?? 0,
    about: doctorData.bio || doctorData.about || "",
    patients: doctorData.totalPatients || "",
    qualifications: doctorData.qualifications || "",
    photo: doctorData.profilePhoto ?? hint_photo ?? "",
    consultFee: doctorData.consultFee,
    emergencyFee: doctorData.emergencyFee,
    walkinFee: doctorData.walkinFee,
    clinicConsultFee: doctorData.clinicConsultFee,
    clinicEmergencyFee: doctorData.clinicEmergencyFee,
    onlineBooking: doctorData.onlineBooking !== false,
    results: Array.isArray(doctorData.results) ? doctorData.results : [],
    showResults: doctorData.showResults !== false,
  } : null;

  const isAvailable = doctor?.available ?? false;

  const currentToken = queueData?.currentToken ?? 0;
  const queueCount = queueData?.totalBooked ?? 0;

  // Only show spinner if no hints were passed AND Firebase hasn't responded yet
  // (e.g. direct URL navigation without list context)
  if (!id || (!doctorData && !hint_name)) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0E1A", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#67E8F9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Top nav */}
      <View style={[styles.topNav, { paddingTop: topPad + 4 }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={20} color="rgba(255,255,255,0.9)" />
        </Pressable>
        <Text style={styles.navTitle}>Doctor Profile</Text>
        <Pressable style={styles.navBtn}>
          <Feather name="share-2" size={16} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: bottomPad + 80 }} showsVerticalScrollIndicator={false}>
        {/* Hero Photo */}
        <View style={[styles.heroWrap, { marginTop: 12 }]}>
          <Image source={{ uri: doctor?.photo || hint_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(hint_name ?? "Doctor")}&background=4F46E5&color=fff` }} style={styles.heroImg} contentFit="cover" contentPosition="top" />
          <LinearGradient colors={["transparent", "rgba(10,14,26,0.95)"]} style={styles.heroGrad} />

          {/* Verified badge */}
          <View style={styles.verifiedBadge}>
            <Feather name="check-circle" size={13} color="#4F46E5" />
            <Text style={styles.verifiedTxt}>Verified</Text>
          </View>

          {/* Available badge */}
          <View style={[styles.availBadge, isAvailable ? styles.availBadgeGreen : styles.availBadgeRed]}>
            <View style={[styles.availDot, !isAvailable && { backgroundColor: "#EF4444", shadowColor: "#EF4444" }]} />
            <Text style={[styles.availTxt, !isAvailable && { color: "#F87171" }]}>
              {isAvailable ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>

        {/* Identity Card */}
        <View style={styles.identityCard}>
          <Text style={styles.docName}>{doctor?.name || hint_name || "Doctor"}</Text>
          <View style={styles.identityRow}>
            <View style={styles.specBadge}>
              <Text style={styles.specBadgeTxt}>{doctor?.specialization || hint_spec || ""}</Text>
            </View>
            <View style={styles.expBadge}>
              <Text style={styles.expBadgeTxt}>{doctor?.experience ?? 0} yrs exp</Text>
            </View>
          </View>
          {!!doctor?.qualifications && (
            <Text style={styles.qualTxt}>{doctor.qualifications}</Text>
          )}

        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {([
            { label: "Patients",   val: (() => {
              const raw = String(doctor?.totalPatients ?? doctor?.patients ?? "");
              return raw ? `${raw.replace(/\+$/, "")}+` : "—";
            })(), color: "#818CF8", icon: "users"    },
            { label: "Experience", val: `${doctor?.experience ?? 0} yrs`, color: "#06B6D4", icon: "activity" },
            { label: "Avg Wait",   val: "—",  color: "#22C55E", icon: "clock"    },
          ] as Array<{ label: string; val: string; color: string; icon: React.ComponentProps<typeof Feather>["name"] }>).map(({ label, val, color, icon }) => (
            <View key={label} style={styles.statTile}>
              <View style={[styles.statIcon, { backgroundColor: color + "18" }]}>
                <Feather name={icon} size={15} color={color} />
              </View>
              <Text style={[styles.statVal, { color }]}>{val}</Text>
              <Text style={styles.statLbl}>{label}</Text>
            </View>
          ))}
        </View>

        {/* About Me */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={15} color="#818CF8" />
            <Text style={styles.sectionTitle}>About Me</Text>
          </View>
          <Text style={styles.aboutTxt}>{doctor?.about ?? "No bio available."}</Text>
        </View>

        {/* My Results */}
        {doctor?.showResults && doctor.results?.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Feather name="image" size={15} color="#06B6D4" />
              <Text style={styles.sectionTitle}>My Results</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
              {doctor.results.map((uri: string, i: number) => (
                <View key={i} style={styles.resultImgWrap}>
                  <Image source={{ uri }} style={styles.resultImg} contentFit="cover" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Fee Breakdown — always shown when doctor data is loaded */}
        {!!doctorData && (<View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.rupee}>₹</Text>
            <Text style={styles.sectionTitle}>Fee Structure</Text>
          </View>
          <View style={{ gap: 8 }}>
            {[
              {
                icon: "monitor" as const,
                label: "Normal E-Token Fee",
                sub: "Book online via LINESETU — skip the queue",
                amount: `₹${doctor?.consultFee ?? 0}`,
                color: "#67E8F9", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)",
              },
              {
                icon: "alert-circle" as const,
                label: "Emergency E-Token Fee",
                sub: "Priority online token via LINESETU — no waiting in queue",
                amount: `₹${doctor?.emergencyFee ?? 0}`,
                color: "#FBBF24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.28)",
              },
              {
                icon: "check-circle" as const,
                label: "Walk-In Fee",
                sub: "Come early at clinic to collect your token",
                amount: `₹${doctor?.walkinFee ?? 0}`,
                color: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.28)",
              },
              {
                icon: "home" as const,
                label: "Consultation at Clinic",
                sub: "Pay directly at the clinic during your visit",
                amount: `₹${doctor?.clinicConsultFee ?? 0}`,
                color: "#34D399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)",
              },
              {
                icon: "zap" as const,
                label: "Emergency Consultation at Clinic",
                sub: "Urgent in-clinic visit — priority access",
                amount: `₹${doctor?.clinicEmergencyFee ?? 0}`,
                color: "#FB7185", bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.25)",
              },
            ].map(({ icon, label, sub, amount, color, bg, border }) => (
              <View key={label} style={[styles.feeRow, { backgroundColor: bg, borderColor: border }]}>
                <View style={[styles.feeIcon, { backgroundColor: color + "22" }]}>
                  <Feather name={icon} size={15} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feeLbl}>{label}</Text>
                  <Text style={styles.feeSub}>{sub}</Text>
                </View>
                <Text style={[styles.feeAmount, { color }]}>{amount}</Text>
              </View>
            ))}
          </View>
        </View>)}

      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: bottomPad }]}>
        {isAvailable && doctor?.onlineBooking !== false ? (
          <Pressable
            style={styles.bookBtn}
            onPress={() => router.push({
              pathname: `/booking/${id}` as any,
              params: { hint_name: doctor?.name ?? "", hint_photo: doctor?.photo ?? "", hint_spec: doctor?.specialization ?? "", hint_clinic: doctor?.clinicName ?? "" },
            })}
          >
            <LinearGradient colors={["#4F46E5", "#6366F1", "#0EA5E9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            <Feather name="calendar" size={18} color="#FFF" />
            <Text style={styles.bookBtnTxt}>Book Your Token</Text>
          </Pressable>
        ) : (
          <View style={styles.bookBtnDisabled}>
            <Feather name="slash" size={18} color="rgba(255,255,255,0.3)" />
            <Text style={styles.bookBtnDisabledTxt}>
              {!isAvailable ? "E-Token Booking Unavailable" : "Online Booking Disabled"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -40, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(239,68,68,0.2)" },
  orb2: { position: "absolute", top: 180, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(99,102,241,0.16)" },

  topNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingBottom: 10 },
  navBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(10,14,26,0.7)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },

  heroWrap: { position: "relative", width: 340, height: 340, borderRadius: 22, overflow: "hidden", alignSelf: "center" },
  heroImg: { width: "100%", height: "100%" },
  heroGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: 90 },
  verifiedBadge: { position: "absolute", top: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12, backgroundColor: "rgba(10,14,26,0.75)", borderWidth: 1, borderColor: "rgba(79,70,229,0.4)" },
  verifiedTxt: { fontSize: 10, fontWeight: "700", color: "#A5B4FC" },
  availBadge: { position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12, backgroundColor: "rgba(10,14,26,0.75)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
  availBadgeGreen: { borderColor: "rgba(34,197,94,0.4)" },
  availBadgeRed: { borderColor: "rgba(239,68,68,0.5)" },
  availDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#22C55E", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 4 },
  availTxt: { fontSize: 10, fontWeight: "700", color: "#4ADE80" },

  identityCard: { marginHorizontal: 18, marginTop: 14, padding: 14, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 24 },
  docName: { fontSize: 20, fontWeight: "900", color: "#FFF", letterSpacing: -0.3, marginBottom: 5 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 6 },
  specBadge: { backgroundColor: "rgba(239,68,68,0.15)", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  specBadgeTxt: { fontSize: 11, fontWeight: "600", color: "#EF4444" },
  expBadge: { backgroundColor: "rgba(255,255,255,0.07)", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  expBadgeTxt: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.45)" },
  qualTxt: { fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: "500", marginTop: 4, marginBottom: 2 },

  clinicRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  clinicTxt: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  clinicDot: { color: "rgba(255,255,255,0.2)" },

  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 18, marginBottom: 14 },
  statTile: { flex: 1, borderRadius: 16, padding: 12, alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 7 },
  statVal: { fontSize: 13, fontWeight: "900", lineHeight: 16 },
  statLbl: { fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3 },

  sectionCard: { marginHorizontal: 18, marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  rupee: { fontSize: 14, fontWeight: "700", color: "#F59E0B" },

  aboutTxt: { fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,0.65)" },

  resultImgWrap: { width: 160, height: 120, borderRadius: 14, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  resultImg: { width: "100%", height: "100%" },

  feeRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  feeIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  feeLbl: { fontSize: 12, fontWeight: "700", color: "#FFF", marginBottom: 1 },
  feeSub: { fontSize: 10, color: "rgba(255,255,255,0.38)" },
  feeAmount: { fontSize: 16, fontWeight: "900" },

  dayTab: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  dayTabActive: { backgroundColor: "rgba(99,102,241,0.3)", borderColor: "rgba(99,102,241,0.6)" },
  dayTabOff: { opacity: 0.5 },
  dayTabTxt: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.45)" },
  dayTabTxtActive: { color: "#A5B4FC" },

  shiftCard: { borderRadius: 14, padding: 12, borderWidth: 1, gap: 8 },
  shiftCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  shiftIcon: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  shiftLbl: { fontSize: 12, fontWeight: "700" },
  shiftTime: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.65)" },
  shiftCardBottom: { flexDirection: "row", alignItems: "center", gap: 6 },
  shiftClinicTxt: { fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: "600" },
  shiftDot: { color: "rgba(255,255,255,0.2)" },
  shiftLocTxt: { fontSize: 11, color: "rgba(255,255,255,0.4)", flex: 1 },
  mapsBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(66,133,244,0.18)", borderWidth: 1, borderColor: "rgba(66,133,244,0.35)" },
  mapsBtnTxt: { fontSize: 10, fontWeight: "700", color: "#4285F4" },
  shiftNote: { fontSize: 10, color: "#F59E0B", fontWeight: "600" },
  offDay: { alignItems: "center", paddingVertical: 18 },
  offDayTxt: { fontSize: 13, color: "rgba(255,255,255,0.25)" },

  liveQueueCard: { marginHorizontal: 18, marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: "rgba(79,70,229,0.14)", borderWidth: 1, borderColor: "rgba(99,102,241,0.3)" },
  liveQueueHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  liveQueueDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#22C55E", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 4 },
  liveQueueLbl: { fontSize: 11, fontWeight: "700", color: "#4ADE80", textTransform: "uppercase", letterSpacing: 0.8 },
  liveQueueChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 },
  liveQueueChipTxt: { fontSize: 9, fontWeight: "600", color: "#818CF8" },
  liveQueueGrid: { flexDirection: "row", gap: 10 },
  liveQueueTile: { flex: 1, borderRadius: 14, padding: 10, alignItems: "center", borderWidth: 1 },
  liveQueueTileLbl: { fontSize: 8, fontWeight: "600", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  liveQueueTileVal: { fontSize: 22, fontWeight: "900", lineHeight: 24 },

  bottomCta: { paddingHorizontal: 18, paddingTop: 12, backgroundColor: "rgba(10,14,26,0.95)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
  bookBtn: { height: 52, borderRadius: 16, overflow: "hidden", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "rgba(79,70,229,0.45)", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 8 },
  bookBtnTxt: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  bookBtnDisabled: { height: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" },
  bookBtnDisabledTxt: { fontSize: 15, fontWeight: "700", color: "rgba(255,255,255,0.28)" },
});

const pStyles = StyleSheet.create({
  calSub:         { fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: "500", marginBottom: 10, lineHeight: 15 },
  calDowRow:      { flexDirection: "row", marginBottom: 4 },
  calDow:         { flex: 1, textAlign: "center", fontSize: 9, fontWeight: "800", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" },
  calMonthLabel:  { fontSize: 10, fontWeight: "800", color: "#2DD4BF", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 6, marginBottom: 2 },
  calRow:         { flexDirection: "row", marginBottom: 3 },
  calCell:        { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, margin: 1.5 },
  calDate:        { fontSize: 13, fontWeight: "700", lineHeight: 16, color: "rgba(255,255,255,0.7)" },
  calLegend:      { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  calLegendItem:  { flexDirection: "row", alignItems: "center", gap: 5 },
  calLegendDot:   { width: 8, height: 8, borderRadius: 4 },
  calLegendTxt:   { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.4)" },

  // Day-detail modal
  modalOverlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  modalSheet:      { backgroundColor: "#0D1321", borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 40, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  modalHandle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: 18 },
  modalTitle:      { fontSize: 18, fontWeight: "900", color: "#FFF", marginBottom: 2 },
  modalDoc:        { fontSize: 12, color: "#2DD4BF", fontWeight: "700", marginBottom: 16 },
  shiftBlock:      { borderRadius: 16, borderWidth: 1, borderColor: "rgba(45,212,191,0.25)", backgroundColor: "rgba(13,148,136,0.1)", padding: 14 },
  shiftBlockHeader:{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  shiftBadge:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  shiftBadgeTxt:   { fontSize: 12, fontWeight: "800" },
  shiftTime:       { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  shiftClinic:     { fontSize: 12, color: "#FFF", fontWeight: "600", marginBottom: 4 },
  shiftAddr:       { fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: "500", marginBottom: 6 },
  mapsRow:         { marginBottom: 10 },
  mapsLink:        { fontSize: 12, color: "#4285F4", fontWeight: "700", textDecorationLine: "underline" },
  bookShiftBtn:    { height: 44, borderRadius: 12, backgroundColor: "rgba(13,148,136,0.25)", borderWidth: 1.5, borderColor: "rgba(45,212,191,0.5)", alignItems: "center", justifyContent: "center" },
  bookShiftBtnTxt: { fontSize: 13, fontWeight: "800", color: "#2DD4BF" },
});
