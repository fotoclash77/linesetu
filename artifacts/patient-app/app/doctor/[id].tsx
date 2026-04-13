import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getGetDoctorQueryOptions, getGetLiveQueueQueryOptions } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";

const DEMO_PHOTO = require("../../assets/images/demo-doctor.jpg");

const SAMPLE_DOCTOR = {
  id: "demo1",
  name: "Dr. Ananya Sharma",
  specialization: "Cardiologist",
  clinicName: "HeartCare Clinic",
  location: "Andheri West, Mumbai",
  experience: 12,
  rating: "4.9",
  patients: "4.2K+",
  avgWait: "~25 min",
  photo: "https://randomuser.me/api/portraits/women/44.jpg",
  available: true,
  about: "Dr. Ananya Sharma is a board-certified Cardiologist with over 12 years of experience in diagnosing and treating cardiovascular conditions. She specializes in preventive cardiology, heart failure management, and non-invasive cardiac imaging. Committed to patient-centered care, she ensures every patient understands their diagnosis and treatment plan.",
  showResults: true,
  results: [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80",
  ],
};

const SCHEDULE = [
  {
    days: "Mon – Wed",
    shifts: [
      { label: "Morning", icon: "sun" as const, time: "9:00 AM – 1:00 PM",  clinic: "HeartCare Clinic",  loc: "Andheri West, Mumbai", color: "#F59E0B", maps: "https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai" },
      { label: "Evening", icon: "moon" as const, time: "5:00 PM – 9:00 PM", clinic: "City Heart Center", loc: "Bandra East, Mumbai",  color: "#818CF8", maps: "https://maps.google.com/?q=City+Heart+Center+Bandra+East+Mumbai" },
    ],
    active: true,
  },
  {
    days: "Thu – Fri",
    shifts: [
      { label: "Morning", icon: "sun" as const, time: "10:00 AM – 2:00 PM", clinic: "HeartCare Clinic", loc: "Andheri West, Mumbai", color: "#F59E0B", maps: "https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai" },
    ],
    active: true,
  },
  {
    days: "Sat",
    shifts: [
      { label: "Morning", icon: "sun" as const, time: "9:00 AM – 12:00 PM", clinic: "MedPlus Hospital", loc: "Powai, Mumbai", color: "#22C55E", maps: "https://maps.google.com/?q=MedPlus+Hospital+Powai+Mumbai", note: "Alternate Sat only" },
    ],
    active: true,
  },
  { days: "Sun", shifts: [], active: false },
];

const FEES = [
  { icon: "check-circle" as const, label: "Walk-in Token",         sub: "Come early at clinic by 9 AM to get your token",                     amount: "₹0",   color: "#4ADE80", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)"   },
  { icon: "monitor" as const,      label: "Clinic E-Appointment",  sub: "Take token online via LINESETU — skip standing in line, from home",  amount: "₹20",  color: "#67E8F9", bg: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.25)"  },
  { icon: "home" as const,         label: "Consultation at Clinic",           sub: "Pay directly at the clinic",                                        amount: "₹500",  color: "#22C55E", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)"    },
  { icon: "alert-circle" as const, label: "Emergency Consultation at Clinic", sub: "Priority access — no waiting in queue",                              amount: "₹1200", color: "#F97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)"  },
];

export default function DoctorDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 20;

  const [activeDay, setActiveDay] = useState(0);

  const isDemoId = !id || id.startsWith("demo");
  const { data: doctorData } = useQuery({
    ...getGetDoctorQueryOptions(id ?? ""),
    enabled: !isDemoId,
  });
  const { data: queueData } = useQuery(getGetLiveQueueQueryOptions(id ?? ""));

  const doctor = isDemoId ? SAMPLE_DOCTOR : (doctorData ? {
    ...SAMPLE_DOCTOR,
    name: doctorData.name ?? SAMPLE_DOCTOR.name,
    specialization: doctorData.specialization ?? SAMPLE_DOCTOR.specialization,
    clinicName: doctorData.clinicName ?? SAMPLE_DOCTOR.clinicName,
    location: SAMPLE_DOCTOR.location,
  } : SAMPLE_DOCTOR);

  const currentToken = queueData?.currentToken ?? 47;
  const queueCount = queueData?.totalBooked ?? 14;

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
          <Image source={doctor.id === "demo1" ? DEMO_PHOTO : { uri: doctor.photo }} style={styles.heroImg} contentFit="cover" contentPosition="top" />
          <LinearGradient colors={["transparent", "rgba(10,14,26,0.95)"]} style={styles.heroGrad} />

          {/* Verified badge */}
          <View style={styles.verifiedBadge}>
            <Feather name="check-circle" size={13} color="#4F46E5" />
            <Text style={styles.verifiedTxt}>Verified</Text>
          </View>

          {/* Available badge */}
          <View style={[styles.availBadge, doctor.available && styles.availBadgeGreen]}>
            <View style={styles.availDot} />
            <Text style={styles.availTxt}>{doctor.available ? "Available" : "Unavailable"}</Text>
          </View>
        </View>

        {/* Identity Card */}
        <View style={styles.identityCard}>
          <Text style={styles.docName}>{doctor.name}</Text>
          <View style={styles.identityRow}>
            <View style={styles.specBadge}>
              <Text style={styles.specBadgeTxt}>{doctor.specialization}</Text>
            </View>
            <View style={styles.expBadge}>
              <Text style={styles.expBadgeTxt}>{doctor.experience} yrs exp</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {([
            { label: "Patients",   val: doctor.patients, color: "#818CF8", icon: "users"    },
            { label: "Experience", val: `${doctor.experience} yrs`, color: "#06B6D4", icon: "activity" },
            { label: "Avg Wait",   val: doctor.avgWait,  color: "#22C55E", icon: "clock"    },
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
          <Text style={styles.aboutTxt}>{(doctor as any).about ?? "No bio available."}</Text>
        </View>

        {/* My Results */}
        {(doctor as any).showResults && (doctor as any).results?.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Feather name="image" size={15} color="#06B6D4" />
              <Text style={styles.sectionTitle}>My Results</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
              {((doctor as any).results as string[]).map((uri: string, i: number) => (
                <View key={i} style={styles.resultImgWrap}>
                  <Image source={{ uri }} style={styles.resultImg} contentFit="cover" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Fee Breakdown */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.rupee}>₹</Text>
            <Text style={styles.sectionTitle}>Fee Structure</Text>
          </View>
          <View style={{ gap: 8 }}>
            {FEES.map(({ icon, label, sub, amount, color, bg, border }) => (
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
        </View>

        {/* Weekly Schedule */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="calendar" size={13} color="#06B6D4" />
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {SCHEDULE.map((s, i) => (
                <Pressable
                  key={s.days}
                  style={[styles.dayTab, activeDay === i && styles.dayTabActive, !s.active && styles.dayTabOff]}
                  onPress={() => setActiveDay(i)}
                >
                  <Text style={[styles.dayTabTxt, activeDay === i && styles.dayTabTxtActive, !s.active && { color: "rgba(255,255,255,0.2)" }]}>
                    {s.days}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {SCHEDULE[activeDay].active ? (
            <View style={{ gap: 8 }}>
              {SCHEDULE[activeDay].shifts.map(shift => (
                <View key={shift.label} style={[styles.shiftCard, { backgroundColor: shift.color + "10", borderColor: shift.color + "28" }]}>
                  <View style={styles.shiftCardTop}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <View style={[styles.shiftIcon, { backgroundColor: shift.color + "22" }]}>
                        <Feather name={shift.icon} size={13} color={shift.color} />
                      </View>
                      <Text style={[styles.shiftLbl, { color: shift.color }]}>{shift.label} Shift</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Feather name="clock" size={10} color="rgba(255,255,255,0.35)" />
                      <Text style={styles.shiftTime}>{shift.time}</Text>
                    </View>
                  </View>
                  <View style={styles.shiftCardBottom}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}>
                      <Feather name="home" size={10} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.shiftClinicTxt} numberOfLines={1}>{shift.clinic}</Text>
                      <Text style={styles.shiftDot}>·</Text>
                      <Feather name="map-pin" size={9} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.shiftLocTxt} numberOfLines={1}>{shift.loc}</Text>
                    </View>
                    <Pressable
                      style={styles.mapsBtn}
                      onPress={() => Linking.openURL(shift.maps)}
                    >
                      <Feather name="navigation" size={10} color="#4285F4" />
                      <Text style={styles.mapsBtnTxt}>Maps</Text>
                    </Pressable>
                  </View>
                  {"note" in shift && shift.note && (
                    <Text style={styles.shiftNote}>⚠ {shift.note}</Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.offDay}>
              <Text style={styles.offDayTxt}>Not available on Sunday</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: bottomPad }]}>
        <Pressable
          style={styles.bookBtn}
          onPress={() => router.push(`/booking/${id ?? "demo1"}`)}
        >
          <LinearGradient colors={["#4F46E5", "#6366F1", "#0EA5E9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          <Feather name="calendar" size={18} color="#FFF" />
          <Text style={styles.bookBtnTxt}>Book Your Token</Text>
        </Pressable>
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
  availDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#22C55E", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 4 },
  availTxt: { fontSize: 10, fontWeight: "700", color: "#4ADE80" },

  identityCard: { marginHorizontal: 18, marginTop: 14, padding: 14, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 24 },
  docName: { fontSize: 20, fontWeight: "900", color: "#FFF", letterSpacing: -0.3, marginBottom: 5 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  specBadge: { backgroundColor: "rgba(239,68,68,0.15)", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  specBadgeTxt: { fontSize: 11, fontWeight: "600", color: "#EF4444" },
  expBadge: { backgroundColor: "rgba(255,255,255,0.07)", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  expBadgeTxt: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.45)" },
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
});
