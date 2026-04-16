import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const { width: SCREEN_W } = Dimensions.get("window");

const BG = "#060E12";
const TEAL = "#0D9488";
const TEAL_LT = "#2DD4BF";

async function markSeenAndGo() {
  await AsyncStorage.setItem("hasSeenOnboarding_doctor", "true");
  router.replace("/login");
}

// ─── Slide 0: Splash ─────────────────────────────────────────
function SplashSlide() {
  const badges = ["500+ Clinics", "12K+ Doctors", "MCI Verified"];
  return (
    <View style={[styles.slide, { alignItems: "center", justifyContent: "center" }]}>
      {/* Glow orb */}
      <View style={styles.glowOrb} />

      {/* Logo image */}
      <View style={styles.logoWrap}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </View>

      {/* Brand */}
      <Text style={styles.brandName}>LINESETU</Text>
      <View style={styles.badgeRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.portalLabel}>DOCTOR PORTAL</Text>
        <View style={styles.dividerLine} />
      </View>
      <Text style={styles.tagline}>Manage your clinic queue.{"\n"}Serve patients smarter.</Text>

      {/* Trust badges */}
      <View style={styles.trustRow}>
        {badges.map((b) => (
          <View key={b} style={styles.trustBadge}>
            <View style={[styles.dot, { backgroundColor: TEAL_LT }]} />
            <Text style={styles.trustText}>{b}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Slide 1: Smart Queue Management ─────────────────────────
function QueueSlide() {
  const patients = [
    { num: 1, name: "Rajan Mehta", status: "In Consultation", active: true },
    { num: 2, name: "Priya Sharma", status: "Next Up", active: false },
    { num: 3, name: "Amit Verma", status: "Waiting", active: false },
    { num: 4, name: "Sunita Patel", status: "Waiting", active: false },
  ];
  const stats = [
    { v: "~12 min", l: "avg wait" },
    { v: "18", l: "seen today" },
    { v: "4.8★", l: "rating" },
  ];

  return (
    <View style={styles.slide}>
      {/* Feature badge */}
      <View style={styles.featureBadgeRow}>
        <LinearGradient colors={["#0D9488", "#0891B2"]} style={styles.featureIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={[styles.lineIcon, { width: 16, marginBottom: 3 }]} />
          <View style={[styles.lineIcon, { width: 12 }]} />
          <View style={[styles.lineIcon, { width: 8, marginTop: 3 }]} />
        </LinearGradient>
        <View>
          <Text style={styles.featureNum}>FEATURE 01</Text>
          <Text style={styles.featureSub}>What you get</Text>
        </View>
      </View>

      <Text style={styles.slideTitle}>Smart Queue{"\n"}<Text style={{ color: TEAL_LT }}>Management</Text></Text>
      <Text style={styles.slideDesc}>
        Your clinic queue, organised and visible at a glance. No chaos, no confusion — just smooth patient flow.
      </Text>

      {/* Live Queue Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={[styles.liveIndicator, { backgroundColor: TEAL_LT }]} />
            <Text style={styles.cardTitle}>Live Queue</Text>
          </View>
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>4 waiting</Text>
          </View>
        </View>
        {patients.map((p) => (
          <View key={p.num} style={[styles.patientRow, p.active && styles.patientRowActive]}>
            <View style={[styles.tokenNum, p.active && styles.tokenNumActive]}>
              <Text style={[styles.tokenNumText, { color: p.active ? "#fff" : "rgba(255,255,255,0.35)" }]}>{p.num}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{p.name}</Text>
              <Text style={[styles.patientStatus, { color: p.active ? TEAL_LT : "rgba(255,255,255,0.3)" }]}>{p.status}</Text>
            </View>
            {p.active && <View style={[styles.dot, { backgroundColor: TEAL_LT, width: 8, height: 8 }]} />}
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        {stats.map(({ v, l }) => (
          <View key={l} style={styles.statBox}>
            <Text style={styles.statValue}>{v}</Text>
            <Text style={styles.statLabel}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Slide 2: Real-time Insights ─────────────────────────────
function InsightsSlide() {
  const hours = ["9", "10", "11", "12", "1", "2", "3"];
  const counts = [5, 12, 18, 14, 20, 16, 8];
  const max = 20;

  return (
    <View style={styles.slide}>
      <View style={styles.featureBadgeRow}>
        <LinearGradient colors={["#0891B2", "#2DD4BF"]} style={styles.featureIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.clockOuter}>
            <View style={styles.clockHand} />
          </View>
        </LinearGradient>
        <View>
          <Text style={styles.featureNum}>FEATURE 02</Text>
          <Text style={styles.featureSub}>Insights & tracking</Text>
        </View>
      </View>

      <Text style={styles.slideTitle}>Real-time Patient{"\n"}<Text style={{ color: TEAL_LT }}>Insights</Text></Text>
      <Text style={styles.slideDesc}>
        Track your patient flow throughout the day. See peaks, plan better, and reduce wait times dramatically.
      </Text>

      {/* Current consulting card */}
      <LinearGradient
        colors={["rgba(13,148,136,0.18)", "rgba(8,145,178,0.08)"]}
        style={styles.consultCard}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <View>
            <Text style={[styles.featureNum, { color: TEAL_LT }]}>NOW CONSULTING</Text>
            <Text style={styles.consultName}>Priya Sharma</Text>
            <Text style={styles.consultSub}>Token #7 · Est. 8 min remaining</Text>
          </View>
          <View style={styles.tokenCircle}>
            <Text style={styles.tokenCircleNum}>7</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient colors={[TEAL, TEAL_LT]} style={styles.progressFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={styles.progressLabel}>Started</Text>
          <Text style={[styles.progressLabel, { color: TEAL_LT }]}>~8 min left</Text>
        </View>
      </LinearGradient>

      {/* Hourly bar chart */}
      <View style={styles.chartCard}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={styles.chartTitle}>Today's Patient Flow</Text>
          <Text style={[styles.chartTitle, { color: TEAL_LT }]}>93 total</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 60, gap: 4 }}>
          {counts.map((c, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center", gap: 2 }}>
              {i === 4 ? (
                <LinearGradient
                  colors={[TEAL, TEAL_LT]}
                  style={{ width: "100%", height: (c / max) * 50, borderRadius: 2 }}
                  start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
                />
              ) : (
                <View style={{ width: "100%", height: (c / max) * 50, borderRadius: 2, backgroundColor: "rgba(45,212,191,0.18)" }} />
              )}
              <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: "600" }}>{hours[i]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Slide 3: Grow Your Practice ─────────────────────────────
function GrowthSlide() {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const values = [28, 34, 31, 42, 38, 51];
  const features = [
    { icon: "💸", title: "Digital Payments", desc: "Razorpay-powered instant payouts" },
    { icon: "📋", title: "Booking History", desc: "Full record of every consultation" },
    { icon: "⭐", title: "Patient Reviews", desc: "Build reputation, earn trust" },
  ];

  return (
    <View style={styles.slide}>
      <View style={styles.featureBadgeRow}>
        <LinearGradient colors={["#0F766E", "#0D9488"]} style={styles.featureIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.growthArrow} />
        </LinearGradient>
        <View>
          <Text style={styles.featureNum}>FEATURE 03</Text>
          <Text style={styles.featureSub}>Grow & earn</Text>
        </View>
      </View>

      <Text style={styles.slideTitle}>Grow Your{"\n"}<Text style={{ color: TEAL_LT }}>Practice</Text></Text>
      <Text style={styles.slideDesc}>
        Transparent earnings, instant payouts, and tools to attract more patients — all in one place.
      </Text>

      {/* Earnings card */}
      <LinearGradient
        colors={["rgba(13,148,136,0.15)", "rgba(15,118,110,0.06)"]}
        style={styles.consultCard}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <View>
            <Text style={[styles.featureNum, { color: TEAL_LT }]}>MARCH EARNINGS</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff", marginTop: 2 }}>₹51,000</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: TEAL_LT }}>↑ +34% vs last month</Text>
            </View>
          </View>
          <View>
            <Text style={[styles.consultSub, { textAlign: "right" }]}>Payout due</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Apr 1</Text>
            <Text style={[styles.consultSub, { color: TEAL_LT, marginTop: 2 }]}>Auto-transfer ✓</Text>
          </View>
        </View>
        {/* Mini chart */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 44, gap: 3 }}>
          {values.map((v, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center", gap: 2 }}>
              {i === 5 ? (
                <LinearGradient
                  colors={[TEAL, TEAL_LT]}
                  style={{ width: "100%", height: (v / 51) * 36, borderRadius: 2 }}
                  start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
                />
              ) : (
                <View style={{ width: "100%", height: (v / 51) * 36, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.08)" }} />
              )}
              <Text style={{ fontSize: 7, color: "rgba(255,255,255,0.25)" }}>{months[i]}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Feature pills */}
      <View style={{ gap: 6, marginTop: 10 }}>
        {features.map(({ icon, title, desc }) => (
          <View key={title} style={styles.featurePill}>
            <Text style={{ fontSize: 18 }}>{icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>{title}</Text>
              <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: "500" }}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────
const SLIDES = [
  { key: "queue", component: QueueSlide },
  { key: "insights", component: InsightsSlide },
  { key: "growth", component: GrowthSlide },
];

export default function OnboardingScreen() {
  const flatRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const isLast = current === SLIDES.length - 1;

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: BG }}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <SafeAreaView style={{ flex: 1 }}>
          <SplashSlide />
        </SafeAreaView>
      </View>
    );
  }

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
        {/* Page dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot2, i === current && styles.dotActive]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={markSeenAndGo} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
            <LinearGradient
              colors={[TEAL, "#0891B2"]}
              style={[styles.nextBtn, isLast && styles.getStartedBtn]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextText}>
                {isLast ? "Get Started →" : "Next →"}
              </Text>
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
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(13,148,136,0.18)",
    alignSelf: "center",
    top: "20%",
  },
  logoWrap: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  logoImg: {
    width: 132,
    height: 132,
    borderRadius: 30,
  },
  brandName: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dividerLine: { flex: 1, maxWidth: 30, height: 1, backgroundColor: "rgba(129,140,248,0.3)" },
  portalLabel: { fontSize: 10, fontWeight: "700", color: TEAL_LT, letterSpacing: 3 },
  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  trustRow: { flexDirection: "row", gap: 8 },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  trustText: { fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  featureBadgeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  featureIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  lineIcon: { height: 2, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 1 },
  clockOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: "white",
    alignItems: "center", justifyContent: "center",
  },
  clockHand: { width: 1.5, height: 8, backgroundColor: "white", position: "absolute", bottom: "50%", borderRadius: 1 },
  growthArrow: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderBottomColor: "white",
  },
  featureNum: { fontSize: 9, fontWeight: "700", color: TEAL_LT, letterSpacing: 2 },
  featureSub: { fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: "500", marginTop: 1 },
  slideTitle: { fontSize: 26, fontWeight: "900", color: "#fff", lineHeight: 34, marginBottom: 8 },
  slideDesc: { fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 20, marginBottom: 20 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  cardTitle: { fontSize: 12, fontWeight: "700", color: "#fff" },
  pillBadge: {
    backgroundColor: "rgba(13,148,136,0.2)",
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20,
  },
  pillBadgeText: { fontSize: 9, fontWeight: "700", color: TEAL_LT },
  liveIndicator: { width: 7, height: 7, borderRadius: 3.5 },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  patientRowActive: { backgroundColor: "rgba(13,148,136,0.1)" },
  tokenNum: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  tokenNumActive: { backgroundColor: TEAL },
  tokenNumText: { fontSize: 12, fontWeight: "900" },
  patientName: { fontSize: 12, fontWeight: "600", color: "#fff" },
  patientStatus: { fontSize: 10, fontWeight: "500", marginTop: 1 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingVertical: 8,
    alignItems: "center",
  },
  statValue: { fontSize: 14, fontWeight: "900", color: "#fff" },
  statLabel: { fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: "500", marginTop: 2 },
  consultCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(13,148,136,0.25)",
    marginBottom: 10,
  },
  consultName: { fontSize: 17, fontWeight: "900", color: "#fff", marginTop: 2 },
  consultSub: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  tokenCircle: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 1.5, borderColor: "rgba(45,212,191,0.4)",
    backgroundColor: "rgba(13,148,136,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  tokenCircleNum: { fontSize: 18, fontWeight: "900", color: TEAL_LT },
  progressTrack: {
    height: 5, backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3, overflow: "hidden",
  },
  progressFill: { width: "60%", height: "100%", borderRadius: 3 },
  progressLabel: { fontSize: 10, color: "rgba(255,255,255,0.3)" },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(255,255,255,0.025)",
    padding: 14,
  },
  chartTitle: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.6)" },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  controls: {
    backgroundColor: BG,
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 12 },
  dot2: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.2)" },
  dotActive: { width: 20, height: 8, borderRadius: 4, backgroundColor: TEAL },
  btnRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  skipBtn: { paddingVertical: 12, paddingRight: 16 },
  skipText: { fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: "600" },
  nextBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
  getStartedBtn: { paddingHorizontal: 36 },
  nextText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});
