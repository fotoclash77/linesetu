import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getListDoctorsQueryOptions, listDoctors } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

const SPECIALTIES = [
  { icon: "heart", label: "Cardiology", color: "#EF4444" },
  { icon: "smile", label: "Dentist", color: "#3B82F6" },
  { icon: "eye", label: "Eye Care", color: "#06B6D4" },
  { icon: "activity", label: "Pediatric", color: "#22C55E" },
  { icon: "cpu", label: "Neurology", color: "#8B5CF6" },
  { icon: "anchor", label: "Orthopedic", color: "#F97316" },
  { icon: "mic", label: "ENT", color: "#EC4899" },
  { icon: "thermometer", label: "General", color: "#F59E0B" },
] as const;

const SAMPLE_DOCTORS = [
  { id: "demo1", name: "Dr. Ananya Sharma", specialization: "Cardiologist", clinicName: "HeartCare Clinic", rating: "4.9", wait: "25 min", token: 47, accent: "#EF4444", exp: "12 yrs" },
  { id: "demo2", name: "Dr. Vikram Patel", specialization: "Dermatologist", clinicName: "Skin Glow Center", rating: "4.8", wait: "10 min", token: 12, accent: "#3B82F6", exp: "9 yrs" },
  { id: "demo3", name: "Dr. Priya Nair", specialization: "Neurologist", clinicName: "NeuroPlus Hospital", rating: "4.7", wait: "18 min", token: 31, accent: "#8B5CF6", exp: "15 yrs" },
];

function DoctorCard({ doc, accent }: { doc: any; accent: string }) {
  return (
    <Pressable
      testID={`doctor-card-${doc.id}`}
      style={({ pressed }) => [styles.docCard, { borderColor: accent + "28", opacity: pressed ? 0.85 : 1 }]}
      onPress={() => router.push(`/doctor/${doc.id}`)}
    >
      <View style={[styles.docAvatar, { backgroundColor: accent + "22", borderColor: accent + "55" }]}>
        <Feather name="user" size={28} color={accent} />
      </View>
      <View style={[styles.verifiedBadge]}>
        <Feather name="check-circle" size={16} color="#4F46E5" />
      </View>
      <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
      <View style={[styles.specBadge, { backgroundColor: accent + "18" }]}>
        <Text style={[styles.specText, { color: accent }]}>{doc.specialization}</Text>
      </View>
      <Text style={styles.clinicName} numberOfLines={1}>{doc.clinicName || "Clinic"}</Text>
      <View style={styles.docStats}>
        <View style={styles.docStatItem}>
          <Feather name="star" size={9} color="#F59E0B" />
          <Text style={styles.docStatTxt}>{doc.rating || "4.8"}</Text>
        </View>
        <View style={styles.docStatItem}>
          <Feather name="clock" size={9} color="rgba(255,255,255,0.4)" />
          <Text style={styles.docStatTxt}>{doc.wait || "~15 min"}</Text>
        </View>
        <View style={styles.docStatItem}>
          <Feather name="hash" size={9} color="#22C55E" />
          <Text style={styles.docStatTxt}>T-{doc.token || 1}</Text>
        </View>
      </View>
      <View style={styles.liveRow}>
        <View style={styles.liveDot} />
        <Text style={styles.liveTxt}>Accepting Tokens</Text>
      </View>
      <Pressable
        style={[styles.bookBtn, { backgroundColor: accent }]}
        onPress={() => router.push(`/doctor/${doc.id}`)}
      >
        <Text style={styles.bookBtnTxt}>Get Token</Text>
      </Pressable>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const [search, setSearch] = useState("");

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 64;

  const { data: doctorsData, isLoading } = useQuery(getListDoctorsQueryOptions());
  const apiDoctors = (doctorsData?.doctors ?? []).map((d: any, i: number) => ({
    ...d,
    accent: ["#EF4444", "#3B82F6", "#8B5CF6", "#22C55E"][i % 4],
    rating: "4.8",
    wait: "~15 min",
    token: 1,
    exp: "10 yrs",
  }));
  const doctors = apiDoctors.length > 0 ? apiDoctors : SAMPLE_DOCTORS;

  const firstName = patient?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <View style={[styles.container]}>
      {/* Glow orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>Hello, {firstName} 👋</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn}>
            <Feather name="bell" size={18} color="rgba(255,255,255,0.7)" />
            <View style={styles.notifDot} />
          </Pressable>
          <LinearGradient colors={["#4F46E5", "#06B6D4"]} style={styles.avatarCircle}>
            <Text style={styles.avatarTxt}>{(patient?.name?.[0] ?? "P").toUpperCase()}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.3)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, clinics…"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={setSearch}
          />
          <View style={styles.locationChip}>
            <Feather name="map-pin" size={11} color="#06B6D4" />
            <Text style={styles.locationTxt}>Mumbai</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Links */}
        <View style={styles.quickLinksRow}>
          {[
            { icon: "plus-square" as const, label: "Book Token", color: "#4F46E5", onPress: () => router.push("/(tabs)/bookings") },
            { icon: "list" as const, label: "My Queue", color: "#06B6D4", onPress: () => router.push("/(tabs)/bookings") },
            { icon: "users" as const, label: "Add Family", color: "#22C55E", onPress: () => router.push("/(tabs)/profile") },
            { icon: "alert-circle" as const, label: "Emergency", color: "#EF4444", onPress: () => {} },
          ].map(({ icon, label, color, onPress }) => (
            <Pressable key={label} style={styles.quickLink} onPress={onPress}>
              <View style={[styles.quickIcon, { backgroundColor: color + "1A", borderColor: color + "33" }]}>
                <Feather name={icon} size={18} color={color} />
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Promo Banner */}
        <View style={styles.sectionPad}>
          <LinearGradient
            colors={["rgba(79,70,229,0.55)", "rgba(6,182,212,0.4)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoOrb} />
            <View style={styles.promoRow}>
              <Feather name="zap" size={13} color="#FCD34D" />
              <Text style={styles.promoTag}>PLATFORM FEE OFFER</Text>
            </View>
            <Text style={styles.promoTitle}>Book today for just ₹20</Text>
            <Text style={styles.promoSub}>Skip the queue · Pay consultation at clinic</Text>
            <Pressable style={styles.promoCta}>
              <Text style={styles.promoCtaTxt}>Book Now</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Featured Doctors */}
        <View style={styles.sectionPad}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator color="#818CF8" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.docList}>
                {doctors.map((doc: any) => (
                  <DoctorCard key={doc.id} doc={doc} accent={doc.accent} />
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Browse by Specialty */}
        <View style={styles.sectionPad}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Specialty</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          <View style={styles.specGrid}>
            {SPECIALTIES.map(({ icon, label, color }) => (
              <Pressable key={label} style={styles.specItem}>
                <View style={[styles.specIcon, { backgroundColor: color + "1A" }]}>
                  <Feather name={icon} size={17} color={color} />
                </View>
                <Text style={styles.specItemLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: {
    position: "absolute", top: -60, left: -40, width: 220, height: 220,
    borderRadius: 110, backgroundColor: "rgba(99,102,241,0.22)",
  },
  orb2: {
    position: "absolute", top: 200, right: -60, width: 180, height: 180,
    borderRadius: 90, backgroundColor: "rgba(6,182,212,0.14)",
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14,
  },
  greeting: { fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: "500" },
  name: { fontSize: 20, fontWeight: "800", color: "#FFF", letterSpacing: -0.3 },
  headerRight: { flexDirection: "row", gap: 10, alignItems: "center" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  notifDot: {
    position: "absolute", top: 8, right: 9,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#0A0E1A",
  },
  avatarCircle: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 16 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14, height: 46,
  },
  searchIcon: { marginLeft: 14 },
  searchInput: { flex: 1, fontSize: 14, color: "#FFF", paddingHorizontal: 10 },
  locationChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingRight: 12 },
  locationTxt: { fontSize: 11, fontWeight: "600", color: "#06B6D4" },
  quickLinksRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 20, paddingBottom: 20,
  },
  quickLink: {
    flex: 1, alignItems: "center", gap: 7,
    padding: 14, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  quickIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  quickLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.65)", textAlign: "center" },
  sectionPad: { paddingHorizontal: 20, marginBottom: 22 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  seeAll: { fontSize: 12, fontWeight: "600", color: "#818CF8" },
  promoBanner: {
    borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: "rgba(99,102,241,0.3)",
    overflow: "hidden",
  },
  promoOrb: {
    position: "absolute", right: -20, top: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  promoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  promoTag: { fontSize: 10, fontWeight: "700", color: "#FCD34D", letterSpacing: 0.8 },
  promoTitle: { fontSize: 16, fontWeight: "800", color: "#FFF", marginBottom: 2 },
  promoSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 12 },
  promoCta: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7,
    alignSelf: "flex-start",
  },
  promoCtaTxt: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  docList: { flexDirection: "row", gap: 14, paddingBottom: 4 },
  docCard: {
    width: 180, borderRadius: 22,
    padding: 14, paddingBottom: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, overflow: "visible",
    position: "relative",
  },
  docAvatar: {
    width: 68, height: 68, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, marginBottom: 10,
  },
  verifiedBadge: {
    position: "absolute", top: 4, right: 4,
  },
  docName: { fontSize: 13, fontWeight: "800", color: "#FFF", marginBottom: 4 },
  specBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 6 },
  specText: { fontSize: 10, fontWeight: "600" },
  clinicName: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 },
  docStats: { flexDirection: "row", gap: 6, marginBottom: 8 },
  docStatItem: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 5,
  },
  docStatTxt: { fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  liveRow: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(34,197,94,0.08)",
    borderWidth: 1, borderColor: "rgba(34,197,94,0.2)",
    borderRadius: 8, padding: 6, marginBottom: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
  liveTxt: { fontSize: 9, fontWeight: "700", color: "#4ADE80" },
  bookBtn: {
    borderRadius: 10, paddingVertical: 9, alignItems: "center",
  },
  bookBtnTxt: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  specItem: {
    width: "22%", alignItems: "center", gap: 7,
    padding: 13, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  specIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  specItemLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.55)", textAlign: "center" },
});
