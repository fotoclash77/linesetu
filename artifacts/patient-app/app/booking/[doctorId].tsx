import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getGetDoctorQueryOptions } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  Alert,
  Linking,
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

const FAMILY: Array<{ id: string; name: string; relation: string; age: number; blood: string; gender: string; phone: string; avatar: string; color: string }> = [
  { id: "self",   name: "Rahul Sharma",  relation: "Self",   age: 32, blood: "B+",  gender: "Male",   phone: "+91 98765 43210", avatar: "https://randomuser.me/api/portraits/men/32.jpg",    color: "#6366F1" },
  { id: "wife",   name: "Priya Sharma",  relation: "Wife",   age: 29, blood: "O+",  gender: "Female", phone: "+91 98765 12345", avatar: "https://randomuser.me/api/portraits/women/26.jpg",  color: "#EC4899" },
  { id: "mother", name: "Sunita Sharma", relation: "Mother", age: 58, blood: "A+",  gender: "Female", phone: "+91 99887 65432", avatar: "https://randomuser.me/api/portraits/women/55.jpg",  color: "#F59E0B" },
  { id: "father", name: "Ramesh Sharma", relation: "Father", age: 62, blood: "AB+", gender: "Male",   phone: "+91 99887 12345", avatar: "https://randomuser.me/api/portraits/men/58.jpg",    color: "#10B981" },
];

const LIVE_QUEUE_PREVIEW = [
  { id: "4", name: "Kiran Patil",  type: "walkin",    status: "in-progress" as const },
  { id: "5", name: "Deepa Shah",   type: "online",    status: "waiting"     as const },
  { id: "6", name: "Sanjay Gupte", type: "walkin",    status: "waiting"     as const },
  { id: "7", name: "Meena Rao",    type: "online",    status: "waiting"     as const },
];

const TYPE_COLOR: Record<string, string> = {
  emergency: "#F87171",
  online: "#67E8F9",
  walkin: "#4ADE80",
};

interface Shift {
  id: string;
  label: string;
  icon: "sun" | "moon";
  time: string;
  clinic: string;
  loc: string;
  color: string;
  maps: string;
  max: number;
  booked: number;
}

const SHIFTS_PER_DOW: Record<number, Shift[]> = {
  1: [
    { id: "s1", label: "Morning", icon: "sun",  time: "9:00 AM – 1:00 PM",  clinic: "HeartCare Clinic",  loc: "Andheri West",  color: "#F59E0B", maps: "https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai", max: 60, booked: 42 },
    { id: "s2", label: "Evening", icon: "moon", time: "5:00 PM – 9:00 PM",  clinic: "City Heart Center", loc: "Bandra East",   color: "#818CF8", maps: "https://maps.google.com/?q=City+Heart+Center+Bandra+East+Mumbai",  max: 50, booked: 28 },
  ],
  2: [
    { id: "s1", label: "Morning", icon: "sun",  time: "9:00 AM – 1:00 PM",  clinic: "HeartCare Clinic",  loc: "Andheri West",  color: "#F59E0B", maps: "https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai", max: 60, booked: 38 },
    { id: "s2", label: "Evening", icon: "moon", time: "5:00 PM – 9:00 PM",  clinic: "City Heart Center", loc: "Bandra East",   color: "#818CF8", maps: "https://maps.google.com/?q=City+Heart+Center+Bandra+East+Mumbai",  max: 50, booked: 21 },
  ],
  3: [
    { id: "s1", label: "Morning", icon: "sun",  time: "9:00 AM – 1:00 PM",  clinic: "HeartCare Clinic",  loc: "Andheri West",  color: "#F59E0B", maps: "https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai", max: 60, booked: 45 },
    { id: "s2", label: "Evening", icon: "moon", time: "5:00 PM – 9:00 PM",  clinic: "City Heart Center", loc: "Bandra East",   color: "#818CF8", maps: "https://maps.google.com/?q=City+Heart+Center+Bandra+East+Mumbai",  max: 50, booked: 31 },
  ],
  4: [
    { id: "s1", label: "Morning", icon: "sun",  time: "10:00 AM – 2:00 PM", clinic: "HeartCare Clinic",  loc: "Andheri West",  color: "#F59E0B", maps: "https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai", max: 55, booked: 42 },
  ],
  5: [
    { id: "s1", label: "Morning", icon: "sun",  time: "10:00 AM – 2:00 PM", clinic: "HeartCare Clinic",  loc: "Andheri West",  color: "#F59E0B", maps: "https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai", max: 55, booked: 33 },
  ],
  6: [
    { id: "s1", label: "Morning", icon: "sun",  time: "9:00 AM – 12:00 PM", clinic: "MedPlus Hospital",  loc: "Powai",         color: "#22C55E", maps: "https://maps.google.com/?q=MedPlus+Hospital+Powai+Mumbai",         max: 30, booked: 14 },
  ],
  0: [],
};

function buildCalendar() {
  const firstDow = 3; // April 1, 2026 = Wednesday
  const days = [];
  for (let d = 1; d <= 30; d++) {
    const dow = (firstDow + d - 1) % 7;
    const altSat = dow === 6 && (d === 11 || d === 25);
    const off = dow === 0 || (dow === 6 && !altSat);
    days.push({ d, dow, off });
  }
  return days;
}

const CAL = buildCalendar();
const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 20;

  const today = 12; // April 12 2026
  const [visitType, setVisitType] = useState<"First Visit" | "Follow-up">("First Visit");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedMember, setSelectedMember] = useState(FAMILY[0]);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const isDemoId = !doctorId || doctorId.startsWith("demo");
  const { data: doctorData } = useQuery({
    ...getGetDoctorQueryOptions(doctorId ?? ""),
    enabled: !isDemoId,
  });
  const docName = isDemoId ? "Dr. Ananya Sharma" : (doctorData?.doctor?.name ?? "Dr. Ananya Sharma");
  const docSpec = isDemoId ? "Cardiologist" : (doctorData?.doctor?.specialization ?? "Cardiologist");
  const docPhoto = `https://randomuser.me/api/portraits/women/44.jpg`;

  const selectedDow = CAL.find(c => c.d === selectedDate)?.dow ?? 1;
  const shifts = (SHIFTS_PER_DOW[selectedDow] ?? []).filter(s => {
    if (selectedDow === 6) return s.id === "s1";
    return true;
  });

  const isEmergency = false; // Always online booking in app
  const payableNow = isEmergency ? 30 : 20;
  const consultFee = 500;

  const canBook = selectedShift !== null;

  function handleBook() {
    if (!canBook) {
      Alert.alert("Select a shift", "Please select a date and shift to continue.");
      return;
    }
    router.push({
      pathname: "/payment",
      params: {
        doctorId: doctorId ?? "demo1",
        doctorName: docName,
        doctorPhoto,
        visitType,
        date: `${selectedDate}`,
        shift: selectedShift!.label,
        clinic: selectedShift!.clinic,
        clinicLoc: selectedShift!.loc,
        time: selectedShift!.time,
        patientId: selectedMember.id,
        patientName: selectedMember.name,
        tokenType: "normal",
        payableNow: `${payableNow}`,
        consultFee: `${consultFee}`,
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 6 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <Text style={styles.headerTitle}>Book Token</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: bottomPad + 90 }} showsVerticalScrollIndicator={false}>

        {/* Doctor Mini-Card */}
        <View style={styles.sectionPad}>
          <View style={styles.docMiniCard}>
            <Image source={{ uri: docPhoto }} style={styles.docMiniPhoto} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={styles.docMiniName}>{docName}</Text>
                <Feather name="check-circle" size={12} color="#4F46E5" />
              </View>
              <Text style={styles.docMiniSpec}>{docSpec}</Text>
              <View style={styles.docMiniRow}>
                <Feather name="home" size={10} color="rgba(255,255,255,0.3)" />
                <Text style={styles.docMiniLoc}>HeartCare Clinic, Andheri West</Text>
              </View>
            </View>
            <View style={styles.availPip}>
              <View style={styles.availPipDot} />
              <Text style={styles.availPipTxt}>Available</Text>
            </View>
          </View>
        </View>

        {/* Visit Type Toggle */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Visit Type</Text>
          <View style={styles.toggleRow}>
            {(["First Visit", "Follow-up"] as const).map(t => (
              <Pressable
                key={t}
                style={[styles.toggleBtn, visitType === t && styles.toggleBtnActive]}
                onPress={() => setVisitType(t)}
              >
                <Feather
                  name={t === "First Visit" ? "user-plus" : "refresh-cw"}
                  size={14}
                  color={visitType === t ? "#FFF" : "rgba(255,255,255,0.4)"}
                />
                <Text style={[styles.toggleTxt, visitType === t && styles.toggleTxtActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Select Date — April 2026</Text>
          <View style={styles.calHeader}>
            {DOW.map(d => (
              <Text key={d} style={styles.calDow}>{d}</Text>
            ))}
          </View>
          <View style={styles.calGrid}>
            {/* Offset */}
            {Array.from({ length: 3 }).map((_, i) => <View key={`empty-${i}`} style={styles.calCell} />)}
            {CAL.map(({ d, off }) => {
              const isPast = d < today;
              const isSelected = d === selectedDate;
              return (
                <Pressable
                  key={d}
                  style={[
                    styles.calCell,
                    isSelected && styles.calCellSelected,
                    off && styles.calCellOff,
                    isPast && !isSelected && styles.calCellPast,
                    d === today && !isSelected && styles.calCellToday,
                  ]}
                  onPress={() => { if (!off && !isPast) { setSelectedDate(d); setSelectedShift(null); } }}
                  disabled={off || isPast}
                >
                  <Text style={[
                    styles.calCellTxt,
                    isSelected && styles.calCellTxtSelected,
                    off && styles.calCellTxtOff,
                    isPast && styles.calCellTxtPast,
                  ]}>{d}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Shift Cards */}
        {shifts.length > 0 && (
          <View style={styles.sectionPad}>
            <Text style={styles.sectionLabel}>Available Shifts</Text>
            <View style={{ gap: 10 }}>
              {shifts.map(shift => {
                const pct = Math.round((shift.booked / shift.max) * 100);
                const isSelected = selectedShift?.id === shift.id;
                const isFull = pct >= 100;
                const fillColor = pct >= 80 ? "#EF4444" : pct >= 60 ? "#F59E0B" : "#22C55E";
                return (
                  <Pressable
                    key={shift.id}
                    style={[styles.shiftCard, isSelected && styles.shiftCardSelected, isFull && styles.shiftCardFull]}
                    onPress={() => !isFull && setSelectedShift(shift)}
                    disabled={isFull}
                  >
                    <View style={styles.shiftCardTop}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={[styles.shiftIcon, { backgroundColor: shift.color + "22" }]}>
                          <Feather name={shift.icon} size={14} color={shift.color} />
                        </View>
                        <View>
                          <Text style={[styles.shiftLabel, { color: shift.color }]}>{shift.label} Shift</Text>
                          <Text style={styles.shiftTime}>{shift.time}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 4 }}>
                        {isSelected && <Feather name="check-circle" size={18} color="#4F46E5" />}
                        {isFull && <Text style={styles.fullTag}>Full</Text>}
                        {!isSelected && !isFull && <View style={styles.radioEmpty} />}
                      </View>
                    </View>

                    {/* Fill Bar */}
                    <View style={{ gap: 4 }}>
                      <View style={styles.fillBarTrack}>
                        <View style={[styles.fillBarFill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: fillColor }]} />
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.fillBarLbl}>{shift.booked}/{shift.max} booked</Text>
                        <Text style={[styles.fillBarPct, { color: fillColor }]}>{pct}% full</Text>
                      </View>
                    </View>

                    <View style={styles.shiftMeta}>
                      <Feather name="home" size={10} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.shiftMetaTxt}>{shift.clinic} · {shift.loc}</Text>
                      <Pressable style={styles.mapsBtn} onPress={() => Linking.openURL(shift.maps)}>
                        <Feather name="navigation" size={10} color="#4285F4" />
                        <Text style={styles.mapsBtnTxt}>Maps</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Family Member */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Booking For</Text>
          <View style={{ gap: 8 }}>
            {FAMILY.map(m => {
              const isSelected = selectedMember.id === m.id;
              const isExpanded = expandedMember === m.id;
              return (
                <Pressable
                  key={m.id}
                  style={[styles.memberCard, isSelected && styles.memberCardSelected]}
                  onPress={() => { setSelectedMember(m); setExpandedMember(isExpanded ? null : m.id); }}
                >
                  <View style={styles.memberCardTop}>
                    <Image source={{ uri: m.avatar }} style={[styles.memberAvatar, { borderColor: m.color + "55" }]} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={styles.memberName}>{m.name}</Text>
                        <View style={[styles.memberRelBadge, { backgroundColor: m.color + "18" }]}>
                          <Text style={[styles.memberRelTxt, { color: m.color }]}>{m.relation}</Text>
                        </View>
                      </View>
                      <Text style={styles.memberSub}>{m.age} yrs · {m.blood} · {m.gender}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {isSelected && <Feather name="check-circle" size={17} color="#4F46E5" />}
                      <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color="rgba(255,255,255,0.3)" />
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.memberExpanded}>
                      {[
                        { icon: "phone" as const, label: "Phone", val: m.phone },
                        { icon: "droplet" as const, label: "Blood Group", val: m.blood },
                        { icon: "user" as const, label: "Gender", val: m.gender },
                        { icon: "calendar" as const, label: "Age", val: `${m.age} years` },
                      ].map(row => (
                        <View key={row.label} style={styles.memberExpandedRow}>
                          <Feather name={row.icon} size={11} color="rgba(255,255,255,0.3)" />
                          <Text style={styles.memberExpandedLbl}>{row.label}</Text>
                          <Text style={styles.memberExpandedVal}>{row.val}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Queue Preview */}
        <View style={styles.sectionPad}>
          <View style={styles.queuePreviewCard}>
            <View style={styles.queuePreviewHeader}>
              <View style={styles.livePip} />
              <Text style={styles.queuePreviewTitle}>Live Queue Preview</Text>
              <Text style={styles.queuePreviewSub}>~42 in queue now</Text>
            </View>
            {LIVE_QUEUE_PREVIEW.map(q => (
              <View key={q.id} style={styles.queueRow}>
                <Text style={styles.queueRowNum}>#{q.id}</Text>
                <Text style={styles.queueRowName} numberOfLines={1}>{q.name}</Text>
                <View style={[styles.queueTypeBadge, { backgroundColor: TYPE_COLOR[q.type] + "18", borderColor: TYPE_COLOR[q.type] + "35" }]}>
                  <Text style={[styles.queueTypeTxt, { color: TYPE_COLOR[q.type] }]}>{q.type}</Text>
                </View>
                <Text style={[styles.queueStatus, q.status === "in-progress" ? { color: "#4ADE80" } : { color: "rgba(255,255,255,0.3)" }]}>
                  {q.status === "in-progress" ? "Active" : "Waiting"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bottomPriceLbl}>Pay Now</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={styles.bottomPrice}>₹{payableNow}</Text>
            <Text style={styles.bottomPriceSub}>+ ₹{consultFee} at clinic</Text>
          </View>
        </View>
        <Pressable style={[styles.continueBtn, !canBook && { opacity: 0.5 }]} onPress={handleBook}>
          <LinearGradient colors={["#4F46E5", "#0EA5E9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          <Text style={styles.continueBtnTxt}>Continue →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(99,102,241,0.18)" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingBottom: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },

  sectionPad: { paddingHorizontal: 20, marginBottom: 22 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },

  docMiniCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1.5, borderColor: "rgba(99,102,241,0.3)" },
  docMiniPhoto: { width: 52, height: 52, borderRadius: 15, borderWidth: 2, borderColor: "rgba(99,102,241,0.4)" },
  docMiniName: { fontSize: 14, fontWeight: "800", color: "#FFF", marginBottom: 1 },
  docMiniSpec: { fontSize: 11, color: "#67E8F9", fontWeight: "600" },
  docMiniRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  docMiniLoc: { fontSize: 10, color: "rgba(255,255,255,0.4)" },
  availPip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(34,197,94,0.15)", borderWidth: 1, borderColor: "rgba(34,197,94,0.35)" },
  availPipDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#22C55E" },
  availPipTxt: { fontSize: 9, fontWeight: "700", color: "#4ADE80" },

  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)" },
  toggleBtnActive: { backgroundColor: "rgba(79,70,229,0.3)", borderColor: "rgba(99,102,241,0.6)" },
  toggleTxt: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.4)" },
  toggleTxtActive: { color: "#FFF" },

  calHeader: { flexDirection: "row", marginBottom: 4 },
  calDow: { flex: 1, textAlign: "center", fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  calCellSelected: { backgroundColor: "#4F46E5", borderRadius: 12 },
  calCellToday: { backgroundColor: "rgba(79,70,229,0.2)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(99,102,241,0.4)" },
  calCellOff: { opacity: 0.3 },
  calCellPast: { opacity: 0.3 },
  calCellTxt: { fontSize: 13, fontWeight: "600", color: "#FFF" },
  calCellTxtSelected: { fontWeight: "800" },
  calCellTxtOff: { color: "rgba(255,255,255,0.2)" },
  calCellTxtPast: { color: "rgba(255,255,255,0.25)" },

  shiftCard: { borderRadius: 18, padding: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)", gap: 10 },
  shiftCardSelected: { backgroundColor: "rgba(99,102,241,0.18)", borderColor: "rgba(99,102,241,0.55)" },
  shiftCardFull: { opacity: 0.5 },
  shiftCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  shiftIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  shiftLabel: { fontSize: 13, fontWeight: "800" },
  shiftTime: { fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 1 },
  radioEmpty: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "rgba(255,255,255,0.25)" },
  fullTag: { fontSize: 10, fontWeight: "700", color: "#EF4444", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 1, borderColor: "rgba(239,68,68,0.35)" },
  fillBarTrack: { height: 5, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  fillBarFill: { height: "100%", borderRadius: 99 },
  fillBarLbl: { fontSize: 10, color: "rgba(255,255,255,0.35)" },
  fillBarPct: { fontSize: 10, fontWeight: "700" },
  shiftMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  shiftMetaTxt: { fontSize: 10, color: "rgba(255,255,255,0.4)", flex: 1 },
  mapsBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, backgroundColor: "rgba(66,133,244,0.18)", borderWidth: 1, borderColor: "rgba(66,133,244,0.35)" },
  mapsBtnTxt: { fontSize: 9, fontWeight: "700", color: "#4285F4" },

  memberCard: { borderRadius: 18, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.09)", overflow: "hidden" },
  memberCardSelected: { backgroundColor: "rgba(79,70,229,0.12)", borderColor: "rgba(99,102,241,0.5)" },
  memberCardTop: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  memberAvatar: { width: 42, height: 42, borderRadius: 14, borderWidth: 2 },
  memberName: { fontSize: 13, fontWeight: "800", color: "#FFF" },
  memberRelBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  memberRelTxt: { fontSize: 9, fontWeight: "700" },
  memberSub: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  memberExpanded: { backgroundColor: "rgba(0,0,0,0.2)", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  memberExpandedRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  memberExpandedLbl: { fontSize: 11, color: "rgba(255,255,255,0.35)", width: 80, fontWeight: "600" },
  memberExpandedVal: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "600" },

  queuePreviewCard: { borderRadius: 18, padding: 14, backgroundColor: "rgba(79,70,229,0.1)", borderWidth: 1, borderColor: "rgba(99,102,241,0.25)" },
  queuePreviewHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 },
  livePip: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#22C55E", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 4 },
  queuePreviewTitle: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  queuePreviewSub: { fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: "auto" },
  queueRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.04)" },
  queueRowNum: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.45)", width: 28 },
  queueRowName: { fontSize: 11, color: "rgba(255,255,255,0.7)", flex: 1 },
  queueTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  queueTypeTxt: { fontSize: 9, fontWeight: "700" },
  queueStatus: { fontSize: 10, fontWeight: "700", width: 48, textAlign: "right" },

  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: "rgba(10,14,26,0.97)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", flexDirection: "row", alignItems: "center", gap: 16 },
  bottomPriceLbl: { fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: "600", marginBottom: 2 },
  bottomPrice: { fontSize: 22, fontWeight: "900", color: "#FFF" },
  bottomPriceSub: { fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: "500" },
  continueBtn: { height: 48, paddingHorizontal: 24, borderRadius: 15, overflow: "hidden", alignItems: "center", justifyContent: "center", shadowColor: "rgba(79,70,229,0.45)", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 6 },
  continueBtnTxt: { fontSize: 14, fontWeight: "800", color: "#FFF" },
});
