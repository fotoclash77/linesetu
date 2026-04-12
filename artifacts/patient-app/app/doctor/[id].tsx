import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getGetDoctorQueryOptions, getGetLiveQueueQueryOptions } from "@workspace/api-client-react";
import React from "react";
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

const isWeb = Platform.OS === "web";

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const isDemoDoc = id?.startsWith("demo");

  const { data: doctor, isLoading } = useQuery({
    ...getGetDoctorQueryOptions(id ?? ""),
    enabled: !!id && !isDemoDoc,
  });

  const today = new Date().toISOString().split("T")[0];
  const { data: queueData } = useQuery({
    ...getGetLiveQueueQueryOptions(id ?? "", { date: today, shift: "morning" }),
    enabled: !!id && !isDemoDoc,
    refetchInterval: 15_000,
  });

  const doc = isDemoDoc
    ? {
        id,
        name: id === "demo1" ? "Dr. Ananya Sharma" : id === "demo2" ? "Dr. Vikram Patel" : "Dr. Priya Nair",
        specialization: id === "demo1" ? "Cardiologist" : id === "demo2" ? "Dermatologist" : "Neurologist",
        clinicName: id === "demo1" ? "HeartCare Clinic" : id === "demo2" ? "Skin Glow Center" : "NeuroPlus Hospital",
        clinicAddress: "Mumbai",
        shifts: { morning: true, morningStart: "09:00", morningEnd: "13:00", evening: true, eveningStart: "17:00", eveningEnd: "21:00" },
      }
    : doctor;

  const accent = "#4F46E5";
  const totalBooked = queueData?.totalBooked ?? 0;
  const currentToken = queueData?.currentToken ?? 0;
  const nextToken = (queueData?.nextTokenNumber ?? totalBooked) + 1;

  if (isLoading && !isDemoDoc) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#818CF8" size="large" />
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={{ color: "#FFF" }}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Back header */}
      <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <Text style={styles.navTitle}>Doctor Profile</Text>
        <Pressable style={styles.shareBtn}>
          <Feather name="share-2" size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 80 }}>
        {/* Doctor card */}
        <View style={styles.docCard}>
          <View style={styles.docAvatarBig}>
            <Feather name="user" size={44} color={accent} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <Text style={styles.docName}>{doc.name}</Text>
              <Feather name="check-circle" size={14} color="#4F46E5" />
            </View>
            <View style={styles.specChip}>
              <Text style={styles.specTxt}>{doc.specialization}</Text>
            </View>
            <View style={styles.clinicRow}>
              <Feather name="map-pin" size={11} color="rgba(255,255,255,0.4)" />
              <Text style={styles.clinicTxt}>{doc.clinicName}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Rating", value: "4.8★", color: "#F59E0B" },
            { label: "Patients", value: "3.2K+", color: "#06B6D4" },
            { label: "Experience", value: "10 yrs", color: "#22C55E" },
            { label: "Fee", value: "₹500", color: "#818CF8" },
          ].map(({ label, value, color }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={styles.statDiv} />}
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color }]}>{value}</Text>
                <Text style={styles.statLbl}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Live Queue */}
        <View style={styles.sectionPad}>
          <LinearGradient
            colors={["rgba(79,70,229,0.22)", "rgba(6,182,212,0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.queueCard}
          >
            <View style={styles.queueHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTxt}>Live Queue</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.queueShiftTxt}>Morning</Text>
            </View>
            <View style={styles.queueStats}>
              <View style={styles.queueStat}>
                <Text style={styles.queueStatNum}>{nextToken}</Text>
                <Text style={styles.queueStatLbl}>Your Token</Text>
              </View>
              <View style={styles.queueStat}>
                <Text style={[styles.queueStatNum, { color: "#67E8F9" }]}>{currentToken}</Text>
                <Text style={styles.queueStatLbl}>Current</Text>
              </View>
              <View style={styles.queueStat}>
                <Text style={[styles.queueStatNum, { color: "#4ADE80", fontSize: 24 }]}>~{(nextToken - currentToken) * 7}m</Text>
                <Text style={styles.queueStatLbl}>Est. Wait</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Shifts */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Available Shifts</Text>
          <View style={{ gap: 10 }}>
            {doc.shifts?.morning && (
              <View style={styles.shiftCard}>
                <View style={[styles.shiftIconBox, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
                  <Feather name="sun" size={16} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shiftLabel}>Morning</Text>
                  <Text style={styles.shiftTime}>{doc.shifts.morningStart} – {doc.shifts.morningEnd}</Text>
                </View>
                <View style={styles.availBadge}>
                  <Text style={styles.availTxt}>Available</Text>
                </View>
              </View>
            )}
            {doc.shifts?.evening && (
              <View style={styles.shiftCard}>
                <View style={[styles.shiftIconBox, { backgroundColor: "rgba(129,140,248,0.15)" }]}>
                  <Feather name="moon" size={16} color="#818CF8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shiftLabel}>Evening</Text>
                  <Text style={styles.shiftTime}>{doc.shifts.eveningStart} – {doc.shifts.eveningEnd}</Text>
                </View>
                <View style={styles.availBadge}>
                  <Text style={styles.availTxt}>Available</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* About */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTxt}>
              {doc.name} is a highly experienced {doc.specialization?.toLowerCase()} with over 10 years of
              clinical practice. Specialises in comprehensive patient care with a patient-first approach.
            </Text>
          </View>
        </View>

        {/* Clinic */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Clinic Location</Text>
          <View style={styles.clinicCard}>
            <View style={styles.clinicIconBox}>
              <Feather name="map-pin" size={18} color="#06B6D4" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clinicCardName}>{doc.clinicName}</Text>
              <Text style={styles.clinicCardAddr}>{doc.clinicAddress || "Mumbai"}</Text>
            </View>
            <Pressable style={styles.mapBtn}>
              <Feather name="navigation" size={14} color="#06B6D4" />
              <Text style={styles.mapBtnTxt}>Directions</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={[styles.ctaBar, { paddingBottom: bottomPad + 8 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaFee}>Platform fee: ₹20 – ₹30</Text>
          <Text style={styles.ctaSub}>Consult fee payable at clinic</Text>
        </View>
        <Pressable
          style={styles.ctaBtn}
          onPress={() => router.push(`/booking/${id}`)}
        >
          <LinearGradient
            colors={["#4F46E5", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGrad}
          >
            <Text style={styles.ctaBtnTxt}>Book Token</Text>
            <Feather name="arrow-right" size={16} color="#FFF" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  loadingScreen: { flex: 1, backgroundColor: "#0A0E1A", alignItems: "center", justifyContent: "center" },
  orb1: { position: "absolute", top: -60, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(99,102,241,0.2)" },
  orb2: { position: "absolute", top: 150, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.14)" },
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  navTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  shareBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center", justifyContent: "center",
  },
  docCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20, padding: 16,
  },
  docAvatarBig: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: "rgba(79,70,229,0.2)",
    borderWidth: 2, borderColor: "rgba(79,70,229,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  docName: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  specChip: {
    backgroundColor: "rgba(79,70,229,0.18)", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 4,
  },
  specTxt: { fontSize: 10, fontWeight: "600", color: "#818CF8" },
  clinicRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  clinicTxt: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  statsRow: {
    flexDirection: "row", marginHorizontal: 20, marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18, paddingVertical: 14,
  },
  statDiv: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.08)" },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  statLbl: { fontSize: 9, color: "rgba(255,255,255,0.4)" },
  sectionPad: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#FFF", marginBottom: 10 },
  queueCard: {
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: "rgba(99,102,241,0.35)",
  },
  queueHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#22C55E" },
  liveTxt: { fontSize: 11, fontWeight: "700", color: "#4ADE80", letterSpacing: 0.8, textTransform: "uppercase" },
  queueShiftTxt: { fontSize: 10, fontWeight: "600", color: "#818CF8" },
  queueStats: { flexDirection: "row", gap: 10 },
  queueStat: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14, padding: 12, alignItems: "center",
  },
  queueStatNum: { fontSize: 28, fontWeight: "900", color: "#A5B4FC" },
  queueStatLbl: { fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  shiftCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, padding: 14,
  },
  shiftIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  shiftLabel: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  shiftTime: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  availBadge: {
    backgroundColor: "rgba(34,197,94,0.15)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  availTxt: { fontSize: 10, fontWeight: "700", color: "#4ADE80" },
  aboutCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, padding: 14,
  },
  aboutTxt: { fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 20 },
  clinicCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, padding: 14,
  },
  clinicIconBox: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: "rgba(6,182,212,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  clinicCardName: { fontSize: 13, fontWeight: "700", color: "#FFF", marginBottom: 2 },
  clinicCardAddr: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  mapBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  mapBtnTxt: { fontSize: 11, fontWeight: "600", color: "#06B6D4" },
  ctaBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 20, paddingTop: 14,
    backgroundColor: "rgba(10,14,26,0.97)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)",
  },
  ctaFee: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  ctaSub: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  ctaBtn: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 22, paddingVertical: 14,
  },
  ctaBtnTxt: { fontSize: 14, fontWeight: "700", color: "#FFF" },
});
