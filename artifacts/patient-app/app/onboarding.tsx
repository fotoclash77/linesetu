import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const { width: SCREEN_W } = Dimensions.get("window");

const BG = "#060A14";
const INDIGO = "#4F46E5";
const INDIGO_LT = "#818CF8";
const CYAN = "#06B6D4";
const CYAN_LT = "#22D3EE";

async function markSeenAndGo() {
  await AsyncStorage.setItem("hasSeenOnboarding_patient", "true");
  router.replace("/login");
}

// ─── Slide 0: Splash ─────────────────────────────────────────
function SplashSlide() {
  const badges = ["50K+ Patients", "ABDM Ready", "100% Secure"];
  return (
    <View style={[styles.slide, { alignItems: "center", justifyContent: "center" }]}>
      <View style={styles.glowOrb} />

      {/* Logo rings */}
      <View style={styles.outerRing}>
        <View style={styles.innerRing}>
          <LinearGradient
            colors={["#4F46E5", "#6366F1"]}
            style={styles.logoCore}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            {/* Heartbeat line */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 8, height: 2, backgroundColor: "white", borderRadius: 1 }} />
              <View style={{ width: 6, height: 14, borderLeftWidth: 2, borderRightWidth: 2, borderColor: "transparent", marginTop: -6 }}>
                <View style={{ width: 2, height: 14, backgroundColor: "white", borderRadius: 1, position: "absolute", left: 0 }} />
              </View>
              <View style={{ width: 8, height: 20, marginTop: -4 }}>
                <View style={{ position: "absolute", width: 2, height: 20, backgroundColor: "white", left: 0, borderRadius: 1 }} />
                <View style={{ position: "absolute", width: 6, height: 2, backgroundColor: "white", top: 4, borderRadius: 1 }} />
              </View>
              <View style={{ width: 8, height: 2, backgroundColor: "white", borderRadius: 1 }} />
            </View>
          </LinearGradient>
        </View>
        <View style={styles.orbitDot} />
        <View style={styles.orbitDot2} />
      </View>

      <Text style={styles.brandName}>LINESETU</Text>
      <View style={styles.badgeRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.portalLabel}>PATIENT APP</Text>
        <View style={styles.dividerLine} />
      </View>
      <Text style={styles.tagline}>Skip the waiting room.{"\n"}See a doctor on your terms.</Text>

      <View style={styles.trustRow}>
        {badges.map((b) => (
          <View key={b} style={styles.trustBadge}>
            <View style={[styles.dot, { backgroundColor: INDIGO_LT }]} />
            <Text style={styles.trustText}>{b}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Slide 1: Book Instantly ──────────────────────────────────
function BookSlide() {
  const doctors = [
    { name: "Dr. Ananya Sharma", spec: "Cardiologist", wait: "12 min", fee: "₹500", token: 47, rating: "4.9", accent: "#EF4444", initials: "AS" },
    { name: "Dr. Vikram Patel", spec: "Dermatologist", wait: "8 min", fee: "₹400", token: 12, rating: "4.8", accent: "#3B82F6", initials: "VP" },
  ];
  return (
    <View style={styles.slide}>
      <View style={styles.featureBadgeRow}>
        <LinearGradient colors={["#4F46E5", "#6366F1"]} style={styles.featureIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.calendarIcon}>
            <View style={styles.calGridTop} />
            <View style={styles.calGridBot} />
          </View>
        </LinearGradient>
        <View>
          <Text style={[styles.featureNum, { color: INDIGO_LT }]}>FEATURE 01</Text>
          <Text style={styles.featureSub}>How it works</Text>
        </View>
      </View>

      <Text style={styles.slideTitle}>Book a Token{"\n"}<Text style={{ color: INDIGO_LT }}>Instantly</Text></Text>
      <Text style={styles.slideDesc}>
        Choose your doctor, grab a token, and show up right on time. Zero paperwork, no long waits.
      </Text>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search doctors, specialities…</Text>
        <View style={styles.filterBtn}>
          <Text style={{ fontSize: 11 }}>≡</Text>
        </View>
      </View>

      {/* Doctor cards */}
      <View style={{ gap: 10, marginTop: 12 }}>
        {doctors.map((doc) => (
          <View key={doc.name} style={styles.doctorCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <View style={[styles.avatar, { backgroundColor: doc.accent + "22", borderColor: doc.accent + "44" }]}>
                <Text style={{ fontSize: 13, fontWeight: "900", color: doc.accent }}>{doc.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.doctorName}>{doc.name}</Text>
                <Text style={styles.doctorSpec}>{doc.spec}</Text>
              </View>
              <Text style={styles.rating}>★ {doc.rating}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={styles.infoPill}>
                <View style={styles.greenDot} />
                <Text style={styles.infoPillText}>{doc.wait} wait</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.infoPillText}>{doc.fee}</Text>
              </View>
              <TouchableOpacity style={{ marginLeft: "auto" }}>
                <LinearGradient colors={["#4F46E5", "#6366F1"]} style={styles.bookBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.bookBtnText}>Book #{doc.token}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Slide 2: Track Your Turn ─────────────────────────────────
function TrackSlide() {
  const queue = [
    { num: 38, label: "Done", done: true },
    { num: 39, label: "Done", done: true },
    { num: 40, label: "Now", active: true },
    { num: 41, label: "You", you: true },
    { num: 42, label: "Next", none: true },
  ];

  return (
    <View style={styles.slide}>
      <View style={styles.featureBadgeRow}>
        <LinearGradient colors={["#0891B2", CYAN]} style={styles.featureIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.clockOuter}>
            <View style={styles.clockHand} />
          </View>
        </LinearGradient>
        <View>
          <Text style={[styles.featureNum, { color: CYAN_LT }]}>FEATURE 02</Text>
          <Text style={styles.featureSub}>Live tracking</Text>
        </View>
      </View>

      <Text style={styles.slideTitle}>Track Your{"\n"}<Text style={{ color: CYAN_LT }}>Turn Live</Text></Text>
      <Text style={styles.slideDesc}>
        Watch the queue move in real-time. Arrive exactly when it's your turn — no more crowded waiting rooms.
      </Text>

      {/* Position card */}
      <LinearGradient
        colors={["rgba(6,182,212,0.12)", "rgba(8,145,178,0.06)"]}
        style={[styles.positionCard, { borderColor: "rgba(6,182,212,0.25)" }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <View>
            <Text style={[styles.featureNum, { color: CYAN_LT }]}>YOUR POSITION</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 2 }}>
              <Text style={{ fontSize: 42, fontWeight: "900", color: "#fff", lineHeight: 50 }}>41</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.4)" }}>/ 58</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.featureSub}>Estimated wait</Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff", marginTop: 2 }}>~6 min</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
              <View style={[styles.dot, { backgroundColor: CYAN_LT, width: 6, height: 6 }]} />
              <Text style={{ fontSize: 10, color: CYAN_LT, fontWeight: "600" }}>Updating live</Text>
            </View>
          </View>
        </View>

        {/* Queue track */}
        <View style={{ flexDirection: "row", gap: 4 }}>
          {queue.map((q, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
              <View style={[
                styles.queueSlot,
                q.active && { backgroundColor: "rgba(6,182,212,0.25)", borderColor: "rgba(6,182,212,0.5)" },
                q.you && { backgroundColor: "rgba(79,70,229,0.35)", borderColor: "rgba(99,102,241,0.6)" },
                q.done && { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" },
                q.none && { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" },
              ]}>
                {q.done
                  ? <Text style={{ fontSize: 10, color: "rgba(34,197,94,0.5)" }}>✓</Text>
                  : <Text style={{ fontSize: 11, fontWeight: "900", color: q.you ? INDIGO_LT : q.active ? CYAN_LT : "rgba(255,255,255,0.2)" }}>{q.num}</Text>}
              </View>
              <Text style={{ fontSize: 8, fontWeight: "700", color: q.you ? INDIGO_LT : q.active ? CYAN_LT : "rgba(255,255,255,0.2)" }}>
                {q.label}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Notification card */}
      <View style={styles.notifCard}>
        <LinearGradient colors={["rgba(79,70,229,0.25)", "rgba(79,70,229,0.15)"]} style={styles.notifIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={{ fontSize: 14 }}>🔔</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>Your turn is almost here!</Text>
          <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2, lineHeight: 15 }}>
            Token #41 · Dr. Ananya's clinic · Please be ready.
          </Text>
          <Text style={{ fontSize: 9, color: INDIGO_LT, fontWeight: "600", marginTop: 4 }}>Just now</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Slide 3: Pay Securely ────────────────────────────────────
function PaySlide() {
  const methods = [
    { icon: "⚡", label: "UPI", sub: "GPay · PhonePe · Paytm" },
    { icon: "💳", label: "Cards", sub: "Visa · Mastercard · RuPay" },
    { icon: "🏦", label: "Net Banking", sub: "100+ banks" },
  ];
  const receipts = [
    { doc: "Dr. Ananya Sharma", date: "Mar 28", amt: "₹500" },
    { doc: "Dr. Priya Nair", date: "Mar 15", amt: "₹600" },
    { doc: "Dr. Vikram Patel", date: "Mar 3", amt: "₹400" },
  ];

  return (
    <View style={styles.slide}>
      <View style={styles.featureBadgeRow}>
        <LinearGradient colors={["#16A34A", "#22C55E"]} style={styles.featureIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={{ fontSize: 20 }}>💳</Text>
        </LinearGradient>
        <View>
          <Text style={[styles.featureNum, { color: "#4ADE80" }]}>FEATURE 03</Text>
          <Text style={styles.featureSub}>Payments & records</Text>
        </View>
      </View>

      <Text style={styles.slideTitle}>Pay Securely,{"\n"}<Text style={{ color: "#4ADE80" }}>Every Time</Text></Text>
      <Text style={styles.slideDesc}>
        Pay consultation fees online with UPI, cards, or net banking. Instant receipts, zero cash hassle.
      </Text>

      {/* Payment methods */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        {methods.map(({ icon, label, sub }) => (
          <View key={label} style={styles.methodCard}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>{label}</Text>
            <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 2, textAlign: "center" }}>{sub}</Text>
          </View>
        ))}
      </View>

      {/* Security badge */}
      <View style={styles.securityBadge}>
        <View style={styles.shieldIcon}>
          <Text style={{ fontSize: 14 }}>🛡️</Text>
        </View>
        <View>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>256-bit SSL Encrypted</Text>
          <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Powered by Razorpay · PCI-DSS Compliant</Text>
        </View>
      </View>

      {/* Receipts */}
      <View style={styles.receiptsCard}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.5)", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
          Recent Consultations
        </Text>
        {receipts.map((r, i) => (
          <View key={i} style={[styles.receiptRow, i < receipts.length - 1 && { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" }]}>
            <View>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>{r.doc}</Text>
              <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{r.date}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>{r.amt}</Text>
              <View style={styles.paidBadge}>
                <Text style={{ fontSize: 9, fontWeight: "700", color: "#4ADE80" }}>Paid</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────
const SLIDES = [
  { key: "splash", component: SplashSlide },
  { key: "book", component: BookSlide },
  { key: "track", component: TrackSlide },
  { key: "pay", component: PaySlide },
];

export default function OnboardingScreen() {
  const flatRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);
  const isLast = current === SLIDES.length - 1;

  function goNext() {
    if (isLast) {
      markSeenAndGo();
    } else {
      const next = current + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrent(next);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setCurrent(idx);
        }}
        renderItem={({ item }) => {
          const Comp = item.component;
          return (
            <View style={{ width: SCREEN_W, flex: 1 }}>
              <SafeAreaView style={{ flex: 1 }}>
                <Comp />
              </SafeAreaView>
            </View>
          );
        }}
        style={{ flex: 1 }}
      />

      {/* Bottom controls */}
      <SafeAreaView edges={["bottom"]} style={styles.controls}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot2, i === current && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={markSeenAndGo} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
            <LinearGradient
              colors={["#4F46E5", "#6366F1"]}
              style={[styles.nextBtn, isLast && styles.getStartedBtn]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextText}>{isLast ? "Get Started →" : "Next →"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  glowOrb: {
    position: "absolute",
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: "rgba(79,70,229,0.18)",
    alignSelf: "center", top: "15%",
  },
  outerRing: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 1, borderColor: "rgba(129,140,248,0.2)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 24,
  },
  innerRing: {
    width: 108, height: 108, borderRadius: 54,
    borderWidth: 1, borderColor: "rgba(99,102,241,0.3)",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(79,70,229,0.1)",
  },
  logoCore: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: "center", justifyContent: "center",
  },
  orbitDot: {
    position: "absolute", top: 10, right: 10,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: INDIGO_LT,
  },
  orbitDot2: {
    position: "absolute", bottom: 14, left: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "rgba(6,182,212,0.7)",
  },
  brandName: { fontSize: 34, fontWeight: "900", color: "#fff", letterSpacing: -1, marginBottom: 8 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  dividerLine: { flex: 1, maxWidth: 30, height: 1, backgroundColor: "rgba(129,140,248,0.3)" },
  portalLabel: { fontSize: 10, fontWeight: "700", color: INDIGO_LT, letterSpacing: 3 },
  tagline: { fontSize: 15, color: "rgba(255,255,255,0.45)", fontWeight: "500", textAlign: "center", lineHeight: 24, marginBottom: 28, paddingHorizontal: 20 },
  trustRow: { flexDirection: "row", gap: 8 },
  trustBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)" },
  trustText: { fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  featureBadgeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  featureIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  calendarIcon: { gap: 3 },
  calGridTop: { width: 20, height: 2, backgroundColor: "white", borderRadius: 1 },
  calGridBot: { width: 16, height: 2, backgroundColor: "white", borderRadius: 1 },
  clockOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "white", alignItems: "center", justifyContent: "center" },
  clockHand: { width: 1.5, height: 8, backgroundColor: "white", position: "absolute", bottom: "50%", borderRadius: 1 },
  featureNum: { fontSize: 9, fontWeight: "700", color: INDIGO_LT, letterSpacing: 2 },
  featureSub: { fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: "500", marginTop: 1 },
  slideTitle: { fontSize: 26, fontWeight: "900", color: "#fff", lineHeight: 34, marginBottom: 8 },
  slideDesc: { fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 20, marginBottom: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)" },
  searchIcon: { fontSize: 13 },
  searchPlaceholder: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.25)" },
  filterBtn: { width: 28, height: 28, borderRadius: 10, backgroundColor: "rgba(79,70,229,0.25)", alignItems: "center", justifyContent: "center" },
  doctorCard: { padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)" },
  avatar: { width: 42, height: 42, borderRadius: 12, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  doctorName: { fontSize: 13, fontWeight: "700", color: "#fff" },
  doctorSpec: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 },
  rating: { fontSize: 11, fontWeight: "700", color: "#FBBF24" },
  infoPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.04)" },
  infoPillText: { fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: "600" },
  greenDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#22C55E" },
  bookBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  bookBtnText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  positionCard: { borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 10 },
  queueSlot: { width: "100%", height: 30, borderRadius: 8, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  notifCard: { flexDirection: "row", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)", alignItems: "flex-start" },
  notifIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  methodCard: { flex: 1, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)", alignItems: "center" },
  securityBadge: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(34,197,94,0.2)", backgroundColor: "rgba(34,197,94,0.07)", alignItems: "center", marginBottom: 10 },
  shieldIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(34,197,94,0.2)", alignItems: "center", justifyContent: "center" },
  receiptsCard: { borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)", overflow: "hidden" },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
  paidBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: "rgba(34,197,94,0.12)" },
  controls: {
    backgroundColor: BG,
    paddingHorizontal: 24, paddingBottom: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)",
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 12 },
  dot2: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.2)" },
  dotActive: { width: 20, height: 8, borderRadius: 4, backgroundColor: INDIGO },
  btnRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  skipBtn: { paddingVertical: 12, paddingRight: 16 },
  skipText: { fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: "600" },
  nextBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
  getStartedBtn: { paddingHorizontal: 36 },
  nextText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});
