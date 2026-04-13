import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { pct } from "@/constants/design";
import { useQuery } from "@tanstack/react-query";
import {
  getGetLiveQueueQueryOptions,
  getGetPatientTokensQueryOptions,
} from "@workspace/api-client-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient as LGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

const isWeb = Platform.OS === "web";

const USER_TOKEN = 56;
const TOTAL = 72;
const AVG_MIN = 2.5;

export default function LiveQueueScreen() {
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const { tokenId } = useLocalSearchParams<{ tokenId: string }>();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const [current, setCurrent] = useState(47);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(c => c < USER_TOKEN ? c + 1 : c);
      setTick(t => t + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const ahead = Math.max(0, USER_TOKEN - current - 1);
  const waitMin = Math.round(ahead * AVG_MIN);
  const isDone = current >= USER_TOKEN;
  const isNear = !isDone && ahead <= 3;
  const isNext = !isDone && ahead === 0;
  const progPct = Math.min(100, Math.round((current / TOTAL) * 100));
  const userPct = Math.min(100, Math.round((USER_TOKEN / TOTAL) * 100));

  const status = isDone ? "done" : isNext ? "next" : isNear ? "near" : "waiting";
  const statusCfg = {
    waiting: { label: "Waiting",      color: "#818CF8", bg: "rgba(99,102,241,0.18)",  border: "rgba(99,102,241,0.4)"  },
    near:    { label: "Almost There", color: "#F59E0B", bg: "rgba(245,158,11,0.18)",  border: "rgba(245,158,11,0.4)"  },
    next:    { label: "You're Next!", color: "#4ADE80", bg: "rgba(34,197,94,0.18)",   border: "rgba(34,197,94,0.4)"   },
    done:    { label: "In Progress",  color: "#67E8F9", bg: "rgba(6,182,212,0.18)",   border: "rgba(6,182,212,0.4)"   },
  }[status];

  const { data } = useQuery(getGetPatientTokensQueryOptions(patient?.id ?? ""));
  const token = (data?.tokens ?? []).find((t) => t.id === tokenId);
  const myToken = token?.tokenNumber ?? USER_TOKEN;
  const doctorId = token?.doctorId ?? "demo1";

  const { data: queueData } = useQuery(getGetLiveQueueQueryOptions(doctorId));

  // Pulsing ring animations
  const ring1 = useSharedValue(1);
  const ring2 = useSharedValue(1);
  const ring3 = useSharedValue(1);
  const ring1Op = useSharedValue(0.6);
  const ring2Op = useSharedValue(0.5);
  const ring3Op = useSharedValue(0.4);

  useEffect(() => {
    const dur = 1400;
    ring1.value = withRepeat(withTiming(2.0, { duration: dur, easing: Easing.out(Easing.ease) }), -1, false);
    ring1Op.value = withRepeat(withTiming(0, { duration: dur }), -1, false);
    ring2.value = withRepeat(withDelay(350, withTiming(2.0, { duration: dur, easing: Easing.out(Easing.ease) })), -1, false);
    ring2Op.value = withRepeat(withDelay(350, withTiming(0, { duration: dur })), -1, false);
    ring3.value = withRepeat(withDelay(700, withTiming(2.0, { duration: dur, easing: Easing.out(Easing.ease) })), -1, false);
    ring3Op.value = withRepeat(withDelay(700, withTiming(0, { duration: dur })), -1, false);
  }, []);

  const liveBlinkOp = useSharedValue(1);
  useEffect(() => {
    liveBlinkOp.value = withRepeat(withSequence(
      withTiming(0.3, { duration: 600 }),
      withTiming(1, { duration: 600 }),
    ), -1, false);
  }, []);

  const slideUpY = useSharedValue(20);
  const slideUpOp = useSharedValue(0);
  useEffect(() => {
    slideUpY.value = 20;
    slideUpOp.value = 0;
    slideUpY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
    slideUpOp.value = withTiming(1, { duration: 320 });
  }, [current]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const id = "linesetu-queue-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes ping { 0%{transform:scale(1);opacity:0.6} 75%,100%{transform:scale(2.2);opacity:0} }
      @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.97)} }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
    `;
    document.head.appendChild(style);
  }, []);

  const slideUpStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUpY.value }],
    opacity: slideUpOp.value,
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1.value }],
    opacity: ring1Op.value,
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2.value }],
    opacity: ring2Op.value,
  }));
  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3.value }],
    opacity: ring3Op.value,
  }));
  const liveStyle = useAnimatedStyle(() => ({
    opacity: liveBlinkOp.value,
  }));

  const ringColor = isNear || isDone ? "#F59E0B" : "#4F46E5";
  const ringBase = isNear ? "rgba(245,158,11,0.6)" : isDone ? "rgba(34,197,94,0.5)" : "rgba(99,102,241,0.5)";

  return (
    <View style={styles.container}>
      <View style={[styles.orb1, isNear && { backgroundColor: "rgba(245,158,11,0.18)" }]} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 6 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Queue</Text>
          <Animated.View style={[styles.liveBadge, liveStyle]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeTxt}>LIVE</Text>
          </Animated.View>
        </View>
        <Pressable style={styles.headerBtn}>
          <Feather name="bell" size={17} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor & Shift Strip */}
        <View style={styles.sectionPad}>
          <View style={styles.shiftStrip}>
            <View style={styles.shiftLeft}>
              <Feather name="home" size={12} color="#67E8F9" />
              <View>
                <Text style={styles.shiftClinic}>HeartCare Clinic</Text>
                <Text style={styles.shiftLoc}>Andheri West, Mumbai · Morning Shift</Text>
              </View>
            </View>
            <Pressable
              style={styles.mapsBtn}
              onPress={() => Linking.openURL("https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai")}
            >
              <Feather name="navigation" size={11} color="#4285F4" />
              <Text style={styles.mapsBtnTxt}>Maps</Text>
            </Pressable>
          </View>
        </View>

        {/* Pulsing Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextLeft}>
            <Text style={styles.heroLabelSmall}>NOW CONSULTING</Text>
            <View style={styles.heroRingWrap}>
              {/* Outer ping ring 120px */}
              <Animated.View style={[styles.heroRingOuter, ring1Style, { borderColor: ringBase }]} />
              {/* Middle static ring 92px */}
              <View style={[styles.heroRingMid, { borderColor: isNear || isDone ? "rgba(245,158,11,0.35)" : "rgba(99,102,241,0.35)" }]} />
              {/* Inner gradient disc 72px */}
              <LGradient
                colors={isNear || isDone ? ["#F59E0B", "#EF4444"] : ["#4F46E5", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCore}
              >
                <Animated.Text style={[styles.heroCoreNum, slideUpStyle]}>{current}</Animated.Text>
                <Text style={styles.heroCoreLabel}>Current</Text>
              </LGradient>
            </View>
            <Text style={styles.heroConsultingTxt} numberOfLines={1}>
              Doctor is consulting Token #{current}
            </Text>
            <Text style={styles.heroDocName}>Dr. Ananya Sharma</Text>
          </View>

          <View style={styles.heroTextRight}>
            <View style={styles.myTokenBlock}>
              <Text style={styles.myTokenLbl}>MY TOKEN</Text>
              <Text style={styles.myTokenNum}>#{myToken}</Text>
              <View style={[styles.statusChip, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
                <Text style={[styles.statusChipTxt, { color: statusCfg.color }]}>{statusCfg.label}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.sectionPad}>
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLbl}>{ahead} tokens ahead of you</Text>
              <Text style={styles.progressRight}>~{waitMin} min wait</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: pct(progPct) }]}>
                <LinearGradient colors={["#4F46E5", "#06B6D4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </View>
              <View style={[styles.youMarker, { left: pct(userPct) }]}>
                <View style={styles.youDot} />
                <Text style={styles.youLabel}>YOU</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stat Tiles */}
        <View style={styles.sectionPad}>
          <View style={styles.statGrid}>
            {([
              { label: "My Token",  val: `#${myToken}`,           color: "#A5B4FC", bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.3)",  icon: "hash"     },
              { label: "Clinic",    val: "Open",                   color: "#4ADE80", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)",  icon: "home"     },
              { label: "Tokens Left", val: `${ahead}`,              color: "#67E8F9", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.25)",  icon: "list"     },
              { label: "Avg/Token", val: "~2.5 min",                  color: "#F59E0B", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)", icon: "activity" },
            ] as Array<{ label: string; val: string; color: string; bg: string; border: string; icon: React.ComponentProps<typeof Feather>["name"] }>).map(({ label, val, color, bg, border, icon }) => (
              <View key={label} style={[styles.statTile, { backgroundColor: bg, borderColor: border }]}>
                <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
                  <Feather name={icon} size={14} color={color} />
                </View>
                <Text style={[styles.statVal, { color }]}>{val}</Text>
                <Text style={styles.statLbl}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Your Appointment Card */}
        <View style={styles.sectionPad}>
          <View style={styles.apptCard}>
            <View style={styles.apptHeader}>
              <Text style={styles.apptTitle}>Your Appointment</Text>
              <View style={[styles.apptStatusBadge, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
                <Text style={[styles.apptStatusTxt, { color: statusCfg.color }]}>{statusCfg.label}</Text>
              </View>
            </View>
            <View style={styles.apptBody}>
              <View style={[styles.apptTokenBox, { borderColor: statusCfg.border }]}>
                <Text style={styles.apptTokenHash}>#</Text>
                <Text style={[styles.apptTokenNum, { color: statusCfg.color }]}>{myToken}</Text>
                <Text style={styles.apptTokenLbl}>Token</Text>
              </View>
              <View style={styles.apptDetails}>
                <View style={styles.apptDetailRow}>
                  <Feather name="users" size={12} color="#818CF8" />
                  <Text style={styles.apptDetailLbl}>Ahead</Text>
                  <Text style={styles.apptDetailVal}>{ahead} patient{ahead !== 1 ? "s" : ""}</Text>
                </View>
                <View style={styles.apptDetailRow}>
                  <Feather name="clock" size={12} color="#06B6D4" />
                  <Text style={styles.apptDetailLbl}>Est. Wait</Text>
                  <Text style={styles.apptDetailVal}>~{waitMin} min</Text>
                </View>
                <View style={styles.apptDetailRow}>
                  <Feather name="calendar" size={12} color="#22C55E" />
                  <Text style={styles.apptDetailLbl}>Shift</Text>
                  <Text style={styles.apptDetailVal}>Morning</Text>
                </View>
              </View>
            </View>
            <View style={styles.apptDoctorRow}>
              <View style={styles.apptDoctorAvatar}>
                <Feather name="user" size={14} color="#818CF8" />
              </View>
              <View>
                <Text style={styles.apptDoctorName}>Dr. Ananya Sharma</Text>
                <Text style={styles.apptDoctorSpec}>Cardiologist · HeartCare Clinic</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={styles.apptVerifiedBadge}>
                <Feather name="check-circle" size={11} color="#22C55E" />
                <Text style={styles.apptVerifiedTxt}>Verified</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alert Banners */}
        {isNext && !isDone && (
          <View style={styles.sectionPad}>
            <View style={styles.alertBannerGreen}>
              <Feather name="check-circle" size={15} color="#4ADE80" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: "#4ADE80" }]}>You're Next!</Text>
                <Text style={styles.alertBody}>Head to the clinic now — the doctor will call you shortly.</Text>
              </View>
            </View>
          </View>
        )}
        {isNear && !isNext && (
          <View style={styles.sectionPad}>
            <View style={styles.alertBannerYellow}>
              <Feather name="alert-triangle" size={15} color="#FCD34D" />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Only {ahead} patient{ahead !== 1 ? "s" : ""} ahead — Get ready!</Text>
                <Text style={styles.alertBody}>Make your way to the clinic now so you don't miss your turn.</Text>
              </View>
            </View>
          </View>
        )}
        {isDone && (
          <View style={styles.sectionPad}>
            <View style={styles.alertBannerCyan}>
              <Feather name="activity" size={15} color="#67E8F9" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: "#67E8F9" }]}>You are in consultation now</Text>
                <Text style={styles.alertBody}>Please proceed to the doctor's cabin.</Text>
              </View>
            </View>
          </View>
        )}
        {!isNear && !isNext && !isDone && (
          <View style={styles.sectionPad}>
            <View style={styles.alertBannerBlue}>
              <Feather name="info" size={15} color="#67E8F9" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: "#67E8F9" }]}>Wait at home or nearby</Text>
                <Text style={styles.alertBody}>We'll notify you 3 tokens before yours. Arrive 5 mins early.</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notification Card */}
        <View style={styles.sectionPad}>
          <View style={styles.notifCard}>
            <View style={styles.notifHeader}>
              <Feather name="bell" size={14} color="#818CF8" />
              <Text style={styles.notifTitle}>SMS Reminder Enabled</Text>
              <View style={{ flex: 1 }} />
              <View style={styles.notifBadge}><Text style={styles.notifBadgeTxt}>Active</Text></View>
            </View>
            <Text style={styles.notifBody}>
              You'll get an SMS when 3 tokens are left before yours. Stay relaxed!
            </Text>
            <View style={styles.notifTokensRow}>
              {["3 tokens left", "1 token left", "Your turn"].map((t, i) => (
                <View key={t} style={[styles.notifTokenChip, i === 0 && { backgroundColor: "rgba(129,140,248,0.2)", borderColor: "rgba(129,140,248,0.4)" }]}>
                  <Text style={[styles.notifTokenChipTxt, i === 0 && { color: "#A5B4FC" }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Shift Details */}
        <View style={styles.sectionPad}>
          <View style={styles.shiftCard}>
            <View style={styles.shiftCardHeader}>
              <Feather name="sun" size={12} color="#F59E0B" />
              <Text style={styles.shiftCardTitle}>Morning Shift Details</Text>
            </View>
            <View style={styles.shiftDetail}>
              <Feather name="clock" size={11} color="rgba(255,255,255,0.3)" />
              <Text style={styles.shiftDetailTxt}>10:00 AM – 2:00 PM</Text>
              <View style={styles.shiftDetailDiv} />
              <Feather name="users" size={11} color="rgba(255,255,255,0.3)" />
              <Text style={styles.shiftDetailTxt}>{TOTAL} total tokens</Text>
            </View>
            <View style={styles.shiftDetail}>
              <Feather name="map-pin" size={11} color="rgba(255,255,255,0.3)" />
              <Text style={styles.shiftDetailTxt}>HeartCare Clinic, Andheri West, Mumbai</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 10 }]}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoTxt}>Token #{myToken}</Text>
          <Text style={styles.bottomInfoSep}>·</Text>
          <Text style={styles.bottomInfoTxt2}>Dr. Ananya Sharma</Text>
        </View>
      </View>
    </View>
  );
}

const RING_SIZE = 120;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(99,102,241,0.22)" },
  orb2: { position: "absolute", top: 200, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(6,182,212,0.14)" },

  header: { flexDirection: "row", alignItems: "center", gap: 0, paddingHorizontal: 18, paddingBottom: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(34,197,94,0.18)", borderWidth: 1, borderColor: "rgba(34,197,94,0.4)" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4 },
  liveBadgeTxt: { fontSize: 9, fontWeight: "800", color: "#4ADE80", letterSpacing: 1 },
  headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },

  sectionPad: { paddingHorizontal: 20, marginBottom: 14 },

  shiftStrip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(6,182,212,0.1)", borderWidth: 1, borderColor: "rgba(6,182,212,0.25)" },
  shiftLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  shiftClinic: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  shiftLoc: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  mapsBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(66,133,244,0.18)", borderWidth: 1, borderColor: "rgba(66,133,244,0.35)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  mapsBtnTxt: { fontSize: 11, fontWeight: "700", color: "#4285F4" },

  heroSection: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 10 },
  heroTextLeft: { flex: 1, alignItems: "center" },
  heroLabelSmall: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.3)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 18 },
  heroRingWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" },
  heroRingOuter: { position: "absolute", width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: 1.5 },
  heroRingMid: { position: "absolute", width: 92, height: 92, borderRadius: 46, borderWidth: 1.5 },
  heroCore: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  heroCoreNum: { fontSize: 30, fontWeight: "900", lineHeight: 34, letterSpacing: -1, color: "#FFF" },
  heroCoreLabel: { fontSize: 8, fontWeight: "600", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.8 },
  heroConsultingTxt: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.5)", marginTop: 12, textAlign: "center" },
  heroDocName: { fontSize: 11, fontWeight: "700", color: "#A5B4FC", marginTop: 2, textAlign: "center" },
  heroTextRight: { flex: 1, alignItems: "center" },
  myTokenBlock: { alignItems: "center", gap: 6 },
  myTokenLbl: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 },
  myTokenNum: { fontSize: 44, fontWeight: "900", color: "#FFF", letterSpacing: -2, lineHeight: 50 },
  statusChip: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusChipTxt: { fontSize: 10, fontWeight: "800" },

  progressSection: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressLbl: { fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  progressRight: { fontSize: 11, color: "#818CF8", fontWeight: "700" },
  progressTrack: { height: 8, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.06)", overflow: "visible", position: "relative" },
  progressFill: { height: "100%", borderRadius: 99, overflow: "hidden" },
  youMarker: { position: "absolute", top: -18, alignItems: "center", marginLeft: -10 },
  youDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFF", borderWidth: 2, borderColor: "#4F46E5", shadowColor: "#FFF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 4 },
  youLabel: { fontSize: 8, fontWeight: "800", color: "#FFF", marginTop: 2 },

  statGrid: { flexDirection: "row", gap: 8 },
  statTile: { flex: 1, borderRadius: 16, paddingVertical: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statVal: { fontSize: 16, fontWeight: "900", lineHeight: 18 },
  statLbl: { fontSize: 8, fontWeight: "600", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.5 },

  alertBannerYellow: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(245,158,11,0.14)", borderWidth: 1, borderColor: "rgba(245,158,11,0.4)" },
  alertBannerGreen:  { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(34,197,94,0.14)",  borderWidth: 1, borderColor: "rgba(34,197,94,0.4)"  },
  alertBannerCyan:   { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(6,182,212,0.14)",   borderWidth: 1, borderColor: "rgba(6,182,212,0.4)"   },
  alertBannerBlue:   { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(6,182,212,0.1)",    borderWidth: 1, borderColor: "rgba(6,182,212,0.3)"   },
  alertTitle: { fontSize: 12, fontWeight: "800", color: "#FCD34D", marginBottom: 2 },
  alertBody: { fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 16 },

  notifCard: { padding: 14, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  notifHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  notifTitle: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  notifBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, backgroundColor: "rgba(34,197,94,0.2)", borderWidth: 1, borderColor: "rgba(34,197,94,0.35)" },
  notifBadgeTxt: { fontSize: 9, fontWeight: "700", color: "#4ADE80" },
  notifBody: { fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 16, marginBottom: 10 },
  notifTokensRow: { flexDirection: "row", gap: 7 },
  notifTokenChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  notifTokenChipTxt: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.35)" },

  shiftCard: { padding: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)", gap: 8 },
  shiftCardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  shiftCardTitle: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  shiftDetail: { flexDirection: "row", alignItems: "center", gap: 6 },
  shiftDetailTxt: { fontSize: 11, color: "rgba(255,255,255,0.55)" },
  shiftDetailDiv: { width: 1, height: 12, backgroundColor: "rgba(255,255,255,0.1)" },

  apptCard: { padding: 16, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", gap: 14 },
  apptHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  apptTitle: { fontSize: 13, fontWeight: "800", color: "#FFF" },
  apptStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  apptStatusTxt: { fontSize: 10, fontWeight: "800" },
  apptBody: { flexDirection: "row", alignItems: "center", gap: 14 },
  apptTokenBox: { width: 72, height: 72, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1.5, backgroundColor: "rgba(99,102,241,0.12)" },
  apptTokenHash: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.4)", lineHeight: 14 },
  apptTokenNum: { fontSize: 30, fontWeight: "900", letterSpacing: -1, lineHeight: 34 },
  apptTokenLbl: { fontSize: 8, fontWeight: "700", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 },
  apptDetails: { flex: 1, gap: 8 },
  apptDetailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  apptDetailLbl: { fontSize: 11, color: "rgba(255,255,255,0.4)", flex: 1 },
  apptDetailVal: { fontSize: 11, fontWeight: "700", color: "#FFF" },
  apptDoctorRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  apptDoctorAvatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.2)", borderWidth: 1, borderColor: "rgba(99,102,241,0.35)", alignItems: "center", justifyContent: "center" },
  apptDoctorName: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  apptDoctorSpec: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 },
  apptVerifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(34,197,94,0.12)", borderWidth: 1, borderColor: "rgba(34,197,94,0.3)" },
  apptVerifiedTxt: { fontSize: 9, fontWeight: "700", color: "#22C55E" },

  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: "rgba(10,14,26,0.95)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", flexDirection: "row", alignItems: "center", gap: 12 },
  bottomInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  bottomInfoTxt: { fontSize: 13, fontWeight: "700", color: "#A5B4FC" },
  bottomInfoSep: { color: "rgba(255,255,255,0.2)" },
  bottomInfoTxt2: { fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 },
});
