import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
const DEMO_PHOTO = require("../../assets/images/demo-doctor.jpg");
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { pct } from "@/constants/design";
import { AnimatedRing } from "@/components/AnimatedRing";
import { useQuery } from "@tanstack/react-query";
import { getListDoctorsQueryOptions, getGetPatientTokensQueryOptions } from "@workspace/api-client-react";
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
import { useAuth } from "@/contexts/AuthContext";

const isWeb = Platform.OS === "web";

const SPECIALTIES = [
  { icon: "heart" as const, label: "Cardiology", color: "#EF4444" },
  { icon: "smile" as const, label: "Dentist", color: "#3B82F6" },
  { icon: "eye" as const, label: "Eye Care", color: "#06B6D4" },
  { icon: "activity" as const, label: "Pediatric", color: "#22C55E" },
  { icon: "cpu" as const, label: "Neurology", color: "#8B5CF6" },
  { icon: "anchor" as const, label: "Orthopedic", color: "#F97316" },
  { icon: "mic" as const, label: "ENT", color: "#EC4899" },
  { icon: "thermometer" as const, label: "General", color: "#F59E0B" },
] as const;

const SAMPLE_DOCTORS: DoctorItem[] = [
  { id: "demo1", name: "Dr. Ananya Sharma", specialty: "Cardiologist",  clinicName: "HeartCare Clinic, Andheri",   rating: "4.9", wait: "25 min", token: 47, accent: "#EF4444", exp: "12 yrs", patients: "4.2K+", photo: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "demo2", name: "Dr. Vikram Patel",  specialty: "Dermatologist", clinicName: "Skin Glow Center, Bandra",    rating: "4.8", wait: "10 min", token: 12, accent: "#3B82F6", exp: "9 yrs",  patients: "3.1K+", photo: "https://randomuser.me/api/portraits/men/32.jpg"   },
  { id: "demo3", name: "Dr. Priya Nair",    specialty: "Neurologist",   clinicName: "NeuroPlus Hospital, Powai",   rating: "4.7", wait: "18 min", token: 31, accent: "#8B5CF6", exp: "15 yrs", patients: "2.8K+", photo: "https://randomuser.me/api/portraits/women/68.jpg" },
];

interface DoctorItem {
  id: string;
  name: string;
  specialty: string;
  clinicName: string;
  rating?: string;
  verified?: boolean;
  photo?: string;
  nextTokenNo?: number;
  estWaitMin?: number;
  fee?: number;
  accent: string;
  wait: string;
  token: number;
  exp: string;
  patients: string;
}

function DoctorCard({ doc }: { doc: DoctorItem }) {
  const { accent } = doc;
  return (
    <Pressable
      testID={`doctor-card-${doc.id}`}
      style={({ pressed }) => [styles.docCard, { borderColor: accent + "28", opacity: pressed ? 0.85 : 1 }]}
      onPress={() => router.push(`/doctor/${doc.id}`)}
    >
      <View style={{ position: "relative", marginBottom: 10 }}>
        <Image
          source={doc.id === "demo1" ? DEMO_PHOTO : { uri: doc.photo }}
          style={[styles.docPhoto, { borderColor: accent + "55" }]}
          contentFit="cover"
        />
      </View>

      <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
      <View style={styles.ratingRow}>
        <Feather name="check-circle" size={10} color="#06B6D4" />
        <Text style={styles.verifiedTxt}>Verified</Text>
      </View>
      <View style={[styles.specBadge, { backgroundColor: accent + "18" }]}>
        <Text style={[styles.specText, { color: accent }]}>{doc.specialty}</Text>
      </View>
      <View style={styles.clinicRow}>
        <Feather name="home" size={9} color="rgba(255,255,255,0.3)" />
        <Text style={styles.clinicName} numberOfLines={1}>{doc.clinicName || "Clinic"}</Text>
      </View>

      <View style={styles.docStats}>
        {[
          { icon: "users" as const, val: doc.patients, lbl: "Patients" },
          { icon: "clock" as const, val: doc.exp, lbl: "Exp" },
          { icon: "clock" as const, val: doc.wait, lbl: "Wait" },
        ].map(({ icon, val, lbl }) => (
          <View key={lbl} style={styles.docStatItem}>
            <Feather name={icon} size={9} color="rgba(255,255,255,0.3)" />
            <Text style={styles.docStatVal}>{val}</Text>
            <Text style={styles.docStatLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      <View style={styles.liveRow}>
        <View style={styles.liveDot} />
        <Text style={styles.liveTxt}>Token #{doc.token} Live</Text>
        <Text style={styles.waitSmall}>~{doc.wait}</Text>
      </View>
      <Pressable
        style={[styles.bookBtn, { backgroundColor: accent, shadowColor: accent }]}
        onPress={() => router.push(`/doctor/${doc.id}`)}
      >
        <Text style={styles.bookBtnTxt}>Get Token</Text>
      </Pressable>
    </Pressable>
  );
}

interface TokenItem {
  id: string;
  doctorId: string;
  doctorName?: string;
  tokenNumber: number;
  status: "waiting" | "in_consult" | "done" | "cancelled" | "upcoming";
  bookedAt?: string;
  shiftLabel?: string;
  queuePosition?: number;
}

function LiveQueueCard({ token }: { token: TokenItem | undefined }) {
  const myToken = token?.tokenNumber ?? 52;
  const currentToken = 47;
  const waitMin = 25;
  const ahead = Math.max(0, myToken - currentToken);
  const progressPct = myToken > 0 ? Math.min(100, (currentToken / myToken) * 100) : 90;

  return (
    <View style={styles.liveQueueCard}>
      <View style={styles.liveQueueHeader}>
        <View style={styles.greenDot} />
        <Text style={styles.liveQueueLbl}>Live Queue</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.liveQueueDocChip}>
          <Feather name="radio" size={10} color="#818CF8" />
          <Text style={styles.liveQueueDocTxt}>Dr. Ananya Sharma</Text>
        </View>
      </View>

      <View style={styles.liveQueueStats}>
        <View style={[styles.queueStatBox, { backgroundColor: "rgba(79,70,229,0.2)", borderColor: "rgba(99,102,241,0.4)" }]}>
          <View style={styles.queueStatHeader}>
            <Feather name="hash" size={9} color="#818CF8" />
            <Text style={styles.queueStatLblTxt}>MY TOKEN</Text>
          </View>
          <Text style={[styles.queueStatNum, { color: "#A5B4FC" }]}>{myToken}</Text>
          <Text style={styles.queueStatSub}>Your number</Text>
        </View>
        <View style={[styles.queueStatBox, { backgroundColor: "rgba(6,182,212,0.12)", borderColor: "rgba(6,182,212,0.3)", overflow: "visible" }]}>
          <AnimatedRing size={54} color="#06B6D4" pulses={2} />
          <View style={styles.queueStatHeader}>
            <Feather name="radio" size={9} color="#06B6D4" />
            <Text style={styles.queueStatLblTxt}>CURRENT</Text>
          </View>
          <Text style={[styles.queueStatNum, { color: "#67E8F9" }]}>{currentToken}</Text>
          <Text style={styles.queueStatSub}>Being served</Text>
        </View>
        <View style={[styles.queueStatBox, { backgroundColor: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.25)" }]}>
          <View style={styles.queueStatHeader}>
            <Feather name="clock" size={9} color="#22C55E" />
            <Text style={styles.queueStatLblTxt}>EST. WAIT</Text>
          </View>
          <Text style={[styles.queueStatNum, { color: "#4ADE80", fontSize: 22 }]}>~{waitMin}</Text>
          <Text style={styles.queueStatSub}>minutes</Text>
        </View>
      </View>

      <View style={styles.liveProgressSection}>
        <View style={styles.liveProgressHeader}>
          <Text style={styles.liveProgressLbl}>{ahead} tokens ahead of you</Text>
          <Text style={styles.liveProgressRight}>Cardiology OPD</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: pct(progressPct) }]} />
        </View>
      </View>

      <Pressable style={styles.viewQueueBtn} onPress={() => token?.id && router.push(`/queue/${token.id}`)}>
        <Text style={styles.viewQueueBtnTxt}>View Queue →</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 64;

  const { data: doctorsData, isLoading } = useQuery(getListDoctorsQueryOptions());
  const { data: tokenData } = useQuery({
    ...getGetPatientTokensQueryOptions(patient?.id ?? ""),
    enabled: !!patient?.id,
  });

  const apiDoctors: DoctorItem[] = (doctorsData?.doctors ?? []).map((d, i: number) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialization,
    clinicName: d.clinicName ?? "Clinic",
    accent: ["#EF4444", "#3B82F6", "#8B5CF6", "#22C55E"][i % 4],
    rating: "4.8",
    wait: "~15 min",
    token: 1,
    exp: "10 yrs",
    patients: "1K+",
    photo: `https://randomuser.me/api/portraits/${i % 2 === 0 ? "women" : "men"}/${30 + i}.jpg`,
  }));
  const doctors: DoctorItem[] = apiDoctors.length > 0 ? apiDoctors : SAMPLE_DOCTORS;

  const VALID_STATUSES = new Set<TokenItem["status"]>(["waiting", "in_consult", "done", "cancelled", "upcoming"]);
  const activeTokens: TokenItem[] = (tokenData?.tokens ?? [])
    .filter((t) => t.status === "waiting" || t.status === "in_consult")
    .map((t) => ({
      id: t.id,
      doctorId: t.doctorId,
      tokenNumber: t.tokenNumber,
      status: VALID_STATUSES.has(t.status as TokenItem["status"])
        ? (t.status as TokenItem["status"])
        : "waiting",
    }));
  const activeToken = activeTokens[0];

  const firstName = patient?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>Hello, {firstName} 👋</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} onPress={() => router.push("/notifications")}>
            <Feather name="bell" size={18} color="rgba(255,255,255,0.7)" />
            <View style={styles.notifDot} />
          </Pressable>
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
            { icon: "calendar" as const, label: "Book Token", color: "#4F46E5", glow: "rgba(79,70,229,0.3)", onPress: () => router.push("/find-doctors") },
            { icon: "list" as const, label: "My Queue", color: "#06B6D4", glow: "rgba(6,182,212,0.3)", onPress: () => router.push("/(tabs)/bookings") },
            { icon: "user-plus" as const, label: "Add Family", color: "#22C55E", glow: "rgba(34,197,94,0.3)", onPress: () => router.push("/(tabs)/profile") },
            { icon: "grid" as const, label: "Scan QR", color: "#F59E0B", glow: "rgba(245,158,11,0.3)", onPress: () => {} },
          ].map(({ icon, label, color, glow, onPress }) => (
            <Pressable key={label} style={styles.quickLink} onPress={onPress}>
              <View style={[styles.quickIcon, { backgroundColor: color + "1A", borderColor: color + "33",
                shadowColor: glow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 4 }]}>
                <Feather name={icon} size={18} color={color} />
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Live Queue Mini-Card — always visible; uses real token when available */}
        <View style={styles.sectionPad}>
          <LiveQueueCard token={activeToken} />
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
            <View style={styles.promoOrb2} />
            <View style={styles.promoRow}>
              <Feather name="zap" size={14} color="#FCD34D" />
              <Text style={styles.promoTag}>PLATFORM FEE OFFER</Text>
            </View>
            <Text style={styles.promoTitle}>Book today for just ₹10</Text>
            <Text style={styles.promoSub}>Skip the queue · Pay consultation at clinic</Text>
            <Pressable style={styles.promoCta} onPress={() => router.push("/find-doctors")}>
              <Text style={styles.promoCtaTxt}>Book Now</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Recommended Doctors */}
        <View style={styles.sectionPad}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 2 }} onPress={() => router.push("/find-doctors")}>
              <Text style={styles.seeAll}>See All</Text>
              <Feather name="chevron-right" size={13} color="#818CF8" />
            </Pressable>
          </View>
          {isLoading ? (
            <ActivityIndicator color="#818CF8" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.docList}>
                {doctors.map((doc) => (
                  <DoctorCard key={doc.id} doc={doc} />
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Browse by Specialty */}
        <View style={styles.sectionPad}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Specialty</Text>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 2 }} onPress={() => router.push("/find-doctors")}>
              <Text style={styles.seeAll}>See All</Text>
              <Feather name="chevron-right" size={13} color="#818CF8" />
            </Pressable>
          </View>
          <View style={styles.specGrid}>
            {SPECIALTIES.map(({ icon, label, color }) => (
              <Pressable key={label} style={styles.specItem} onPress={() => router.push({ pathname: "/find-doctors", params: { specialty: label } })}>
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
  orb1: { position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.22)" },
  orb2: { position: "absolute", top: 200, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.14)" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14 },
  greeting: { fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: "500" },
  name: { fontSize: 20, fontWeight: "800", color: "#FFF", letterSpacing: -0.3 },
  headerRight: { flexDirection: "row", gap: 10, alignItems: "center" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#0A0E1A" },
  quickLinksRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingBottom: 20 },
  quickLink: { flex: 1, alignItems: "center", gap: 7, padding: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  quickLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.65)", textAlign: "center" },
  sectionPad: { paddingHorizontal: 20, marginBottom: 22 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  seeAll: { fontSize: 12, fontWeight: "600", color: "#818CF8" },

  liveQueueCard: {
    borderRadius: 22, overflow: "hidden", padding: 18,
    backgroundColor: "rgba(79,70,229,0.14)",
    borderWidth: 1, borderColor: "rgba(99,102,241,0.35)",
  },
  liveQueueHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  greenDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#22C55E", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  liveQueueLbl: { fontSize: 11, fontWeight: "700", color: "#4ADE80", letterSpacing: 0.8, textTransform: "uppercase" },
  liveQueueDocChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  liveQueueDocTxt: { fontSize: 10, fontWeight: "600", color: "#818CF8" },
  liveQueueStats: { flexDirection: "row", gap: 10, marginBottom: 14 },
  queueStatBox: { flex: 1, borderRadius: 16, padding: 12, alignItems: "center", borderWidth: 1 },
  queueStatHeader: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 4 },
  queueStatLblTxt: { fontSize: 8, fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5 },
  queueStatNum: { fontSize: 30, fontWeight: "900", color: "#A5B4FC", lineHeight: 34 },
  queueStatSub: { fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 },
  liveProgressSection: { marginBottom: 14 },
  liveProgressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  liveProgressLbl: { fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: "500" },
  liveProgressRight: { fontSize: 10, color: "#818CF8", fontWeight: "600" },
  progressTrack: { height: 5, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: "#4F46E5" },
  viewQueueBtn: { backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  viewQueueBtnTxt: { fontSize: 12, fontWeight: "700", color: "#FFF" },

  promoBanner: { borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "rgba(99,102,241,0.3)", overflow: "hidden" },
  promoOrb: { position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.06)" },
  promoOrb2: { position: "absolute", right: 20, bottom: -30, width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255,255,255,0.04)" },
  promoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  promoTag: { fontSize: 10, fontWeight: "700", color: "#FCD34D", letterSpacing: 0.8 },
  promoTitle: { fontSize: 16, fontWeight: "800", color: "#FFF", marginBottom: 2 },
  promoSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 12 },
  promoCta: { backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7, alignSelf: "flex-start" },
  promoCtaTxt: { fontSize: 12, fontWeight: "700", color: "#FFF" },

  docList: { flexDirection: "row", gap: 14, paddingBottom: 4 },
  docCard: {
    width: 200, borderRadius: 22, padding: 14, paddingBottom: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, overflow: "hidden",
  },
  docPhoto: { width: 160, height: 160, borderRadius: 16, borderWidth: 2.5 },
  docName: { fontSize: 13, fontWeight: "800", color: "#FFF", marginBottom: 3 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 5 },
  ratingTxt: { fontSize: 11, fontWeight: "700", color: "#F59E0B" },
  ratingSlash: { fontSize: 10, color: "rgba(255,255,255,0.3)" },
  verifiedTxt: { fontSize: 10, fontWeight: "600", color: "#06B6D4" },
  specBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 6 },
  specText: { fontSize: 10, fontWeight: "600" },
  clinicRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  clinicName: { fontSize: 10, color: "rgba(255,255,255,0.4)", flex: 1 },
  docStats: { flexDirection: "row", gap: 6, marginBottom: 10 },
  docStatItem: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, paddingVertical: 6, alignItems: "center", gap: 2 },
  docStatVal: { fontSize: 11, fontWeight: "700", color: "#FFF", lineHeight: 13 },
  docStatLbl: { fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(34,197,94,0.08)", borderWidth: 1, borderColor: "rgba(34,197,94,0.2)", borderRadius: 10, padding: 7, marginBottom: 10 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 3 },
  liveTxt: { fontSize: 10, fontWeight: "700", color: "#4ADE80", flex: 1 },
  waitSmall: { fontSize: 9, color: "rgba(255,255,255,0.35)" },
  bookBtn: { borderRadius: 12, paddingVertical: 9, alignItems: "center", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  bookBtnTxt: { fontSize: 12, fontWeight: "700", color: "#FFF" },

  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  specItem: { width: "22%", alignItems: "center", gap: 7, padding: 13, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  specIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  specItemLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.55)", textAlign: "center" },
});
