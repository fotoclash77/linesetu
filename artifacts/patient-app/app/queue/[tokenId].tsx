import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { pct } from "@/constants/design";
import { useQuery } from "@tanstack/react-query";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  ActivityIndicator,
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

const isWeb = Platform.OS === "web";
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
const AVG_MIN_PER_TOKEN = 7;

interface TokenData {
  id: string; tokenNumber: number; doctorId: string;
  patientName: string; date: string; shift: string; status: string; type: string;
  patientPaid?: number; doctorEarns?: number; platformFee?: number;
  clinicConsultFee?: number; walkinFee?: number; payAtClinic?: number; totalVisitCost?: number;
  paymentId?: string; paymentStatus?: string;
}

interface PositionData {
  tokenNumber: number; currentToken: number; position: number;
  estimatedWaitMins: number; status: string; totalWaiting: number;
}

async function fetchToken(tokenId: string): Promise<TokenData> {
  const res = await fetch(`${BASE_URL}/api/tokens/${tokenId}`);
  if (!res.ok) throw new Error("Token not found");
  return res.json();
}

async function fetchPosition(doctorId: string, tokenId: string): Promise<PositionData> {
  const res = await fetch(`${BASE_URL}/api/queues/${doctorId}/position/${tokenId}`);
  if (!res.ok) throw new Error("Position fetch failed");
  return res.json();
}

async function fetchDoctor(doctorId: string) {
  const res = await fetch(`${BASE_URL}/api/doctors/${doctorId}`);
  if (!res.ok) throw new Error("Doctor not found");
  return res.json() as Promise<{
    id: string; name: string; specialization: string;
    clinicName: string; clinicAddress: string;
  }>;
}

function useRealtimePosition(doctorId: string | undefined, tokenId: string | undefined) {
  const [pos, setPos] = useState<PositionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId || !tokenId) return;
    let active = true;
    const sseUrl = `${BASE_URL}/api/queues/${doctorId}/position/${tokenId}/stream`;

    if (typeof EventSource !== "undefined") {
      const es = new EventSource(sseUrl);
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.error) return;
          if (active) { setPos(data); setLoading(false); }
        } catch (_) {}
      };
      es.onerror = () => {
        if (active) setLoading(false);
      };
      return () => { active = false; es.close(); };
    }

    const poll = async () => {
      try {
        const data = await fetchPosition(doctorId, tokenId);
        if (active) { setPos(data); setLoading(false); }
      } catch (_) { if (active) setLoading(false); }
    };
    poll();
    const iv = setInterval(poll, 5_000);
    return () => { active = false; clearInterval(iv); };
  }, [doctorId, tokenId]);

  return { pos, loading };
}

export default function LiveQueueScreen() {
  const insets = useSafeAreaInsets();
  const { tokenId } = useLocalSearchParams<{ tokenId: string }>();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 16 + 64;

  const validTokenId = tokenId && tokenId !== "demo" ? tokenId : undefined;

  const { data: token, isLoading: tokenLoading, isError: tokenError } = useQuery({
    queryKey: ["token", validTokenId],
    queryFn: () => fetchToken(validTokenId!),
    enabled: !!validTokenId,
    staleTime: 60_000,
    retry: 1,
  });

  const { pos, loading: posLoading } = useRealtimePosition(token?.doctorId, validTokenId);

  const { data: doctor } = useQuery({
    queryKey: ["doctor", token?.doctorId],
    queryFn: () => fetchDoctor(token!.doctorId),
    enabled: !!token?.doctorId,
    staleTime: 120_000,
  });

  // ── Real-time clinic name + avgConsultMins from Firestore ────
  const [liveClinicName, setLiveClinicName] = useState("");
  const [liveClinicAddress, setLiveClinicAddress] = useState("");
  const [liveClinicMaps, setLiveClinicMaps] = useState("");
  const [liveClinicDistrict, setLiveClinicDistrict] = useState("");
  const [liveClinicState, setLiveClinicState] = useState("");
  const [liveShiftTiming, setLiveShiftTiming] = useState("");
  const [liveAvgMin, setLiveAvgMin] = useState(AVG_MIN_PER_TOKEN);

  useEffect(() => {
    if (!token?.doctorId) return;
    const ref = doc(db, "doctors", token.doctorId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      const date = token?.date ?? "";
      const shift = token?.shift ?? "";
      // Capture avg consult time (minutes per patient)
      const shiftCfg = data.calendar?.[date]?.[shift];
      const avgMin =
        shiftCfg?.avgConsultMins ??
        data.avgConsultMins ??
        AVG_MIN_PER_TOKEN;
      setLiveAvgMin(Number(avgMin) || AVG_MIN_PER_TOKEN);

      // Shift timing — from config or default by shift name
      const startTime = shiftCfg?.startTime ?? (shift === "morning" ? "10:00 AM" : "4:00 PM");
      const endTime   = shiftCfg?.endTime   ?? (shift === "morning" ? "2:00 PM"  : "8:00 PM");
      setLiveShiftTiming(`${startTime} – ${endTime}`);

      // Clinic name, address, district, state from shift config or first active clinic
      const calClinicName = shiftCfg?.clinicName ?? "";
      const clinicsArr: any[] = Array.isArray(data.clinics) ? data.clinics : [];
      if (calClinicName) {
        setLiveClinicName(calClinicName);
        const matched = clinicsArr.find((c: any) => c.name === calClinicName && c.active !== false);
        setLiveClinicAddress(matched?.address ?? shiftCfg?.clinicAddress ?? "");
        setLiveClinicMaps(matched?.maps ?? "");
        setLiveClinicDistrict(matched?.district ?? data.district ?? "");
        setLiveClinicState(matched?.state ?? data.state ?? "");
      } else {
        const first = clinicsArr.find((c: any) => c.active !== false);
        setLiveClinicName(first?.name ?? data.clinicName ?? "Clinic");
        setLiveClinicAddress(first?.address ?? data.clinicAddress ?? "");
        setLiveClinicMaps(first?.maps ?? "");
        setLiveClinicDistrict(first?.district ?? data.district ?? "");
        setLiveClinicState(first?.state ?? data.state ?? "");
      }
    }, () => {});
    return () => unsub();
  }, [token?.doctorId, token?.date, token?.shift]);

  // ── Real-time queue position from Firestore (zero delay) ──────
  const [liveCurrentToken, setLiveCurrentToken] = useState<number | null>(null);
  const [liveCurrentTokenType, setLiveCurrentTokenType] = useState<string>("");
  const [liveTotalWaiting, setLiveTotalWaiting] = useState<number | null>(null);
  const [liveWaitingNumbers, setLiveWaitingNumbers] = useState<number[] | null>(null);

  useEffect(() => {
    if (!token?.doctorId || !token?.date || !token?.shift) return;
    const queueId = `${token.doctorId}_${token.date}_${token.shift}`;
    const ref = doc(db, "queues", queueId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      setLiveCurrentToken(data.currentToken ?? 0);
      setLiveCurrentTokenType(data.currentTokenType ?? "");
      setLiveTotalWaiting(data.waitingTokenIds?.length ?? 0);
      if (Array.isArray(data.waitingTokenNumbers)) {
        setLiveWaitingNumbers(data.waitingTokenNumbers as number[]);
      }
    }, () => {});
    return () => unsub();
  }, [token?.doctorId, token?.date, token?.shift]);

  // ── Real-time token status from Firestore ─────────────────────
  const [liveTokenStatus, setLiveTokenStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!validTokenId) return;
    const ref = doc(db, "tokens", validTokenId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      setLiveTokenStatus(data.status ?? null);
    }, () => {});
    return () => unsub();
  }, [validTokenId]);

  // ── Push notification registration (native builds only) ──────
  useEffect(() => {
    if (!validTokenId || Platform.OS === "web") return;
    (async () => {
      try {
        const Notifications = await import("expo-notifications");
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;
        if (existing !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") return;
        const tokenObj = await Notifications.getExpoPushTokenAsync();
        const expoPushToken = tokenObj.data;
        await updateDoc(doc(db, "tokens", validTokenId), { expoPushToken });
      } catch (_) {
        // expo-notifications not available in Expo Go — works in production builds
      }
    })();
  }, [validTokenId]);

  // ── Reminder thresholds (saved to token doc in Firestore) ─────
  const REMINDER_OPTIONS = [
    { label: "10 tokens left", value: 10 },
    { label: "5 tokens left",  value: 5  },
    { label: "1 token left",   value: 1  },
    { label: "Your turn",      value: 0  },
  ];
  const [selectedReminders, setSelectedReminders] = useState<number[]>([10, 5, 1, 0]);
  const [reminderBanner, setReminderBanner] = useState<string | null>(null);
  const [feeExpanded, setFeeExpanded] = useState(false);
  const lastTriggeredRef = useRef<Set<number>>(new Set());
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved thresholds from Firestore token doc
  useEffect(() => {
    if (!validTokenId) return;
    const ref = doc(db, "tokens", validTokenId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      if (Array.isArray(data.reminderThresholds)) {
        setSelectedReminders(data.reminderThresholds as number[]);
      }
    }, () => {});
    return () => unsub();
  }, [validTokenId]);

  const toggleReminder = useCallback(async (value: number) => {
    if (!validTokenId) return;
    const next = selectedReminders.includes(value)
      ? selectedReminders.filter(v => v !== value)
      : [...selectedReminders, value];
    setSelectedReminders(next);
    try {
      await updateDoc(doc(db, "tokens", validTokenId), { reminderThresholds: next });
    } catch (_) {}
  }, [validTokenId, selectedReminders]);

  // ── Derived values ────────────────────────────────────────────
  const myToken      = token?.tokenNumber ?? 0;
  // Live from Firestore onSnapshot — zero delay, no polling
  const current      = liveCurrentToken ?? pos?.currentToken ?? 0;
  // Use accurate waitingTokenNumbers (excludes cancelled/skipped) if available
  // Falls back to simple subtraction for old queue docs without the field
  const ahead = liveWaitingNumbers !== null
    ? liveWaitingNumbers.filter(n => n < myToken).length
    : Math.max(0, myToken - current);
  const waitMin      = ahead * liveAvgMin;
  const totalWaiting = liveTotalWaiting ?? pos?.totalWaiting ?? 0;
  // Priority: live Firestore > SSE/polling > static token data
  const tokenStatus  = liveTokenStatus ?? pos?.status ?? token?.status ?? "waiting";
  const shift        = token?.shift ?? "morning";
  const shiftLabel   = shift === "morning" ? "Morning Shift" : "Evening Shift";
  const shiftIcon: React.ComponentProps<typeof Feather>["name"] = shift === "morning" ? "sun" : "moon";

  const doctorName    = doctor?.name ?? "Your Doctor";
  const clinicName    = liveClinicName || doctor?.clinicName || "Clinic";
  const clinicAddress = liveClinicAddress || doctor?.clinicAddress || "";
  const specialization = doctor?.specialization ?? "OPD";

  const isEmergency   = token?.type === "emergency";
  const feePayNow     = token?.patientPaid ?? 0;
  const feeDoctorEarns = token?.doctorEarns ?? 0;
  const feePlatform   = token?.platformFee ?? 0;
  const feeClinicConsult = token?.clinicConsultFee ?? 0;
  const feeWalkin     = token?.walkinFee ?? 0;
  // Walk-in fee is hidden from display — subtract it from both pay-at-clinic and total
  const feePayAtClinic = (token?.payAtClinic ?? (feeClinicConsult + feeWalkin)) - feeWalkin;
  const feeTotalVisit  = (token?.totalVisitCost ?? (feePayNow + feePayAtClinic + feeWalkin)) - feeWalkin;
  const hasFeeData    = feePayNow > 0 || feePayAtClinic > 0;

  const isCancelled  = tokenStatus === "cancelled";
  const isConsulting = tokenStatus === "in_consult";
  const isCompleted  = tokenStatus === "done";
  const isDone       = isConsulting || isCompleted;
  const isNear       = !isDone && !isCancelled && ahead > 0 && ahead <= 3;
  const isNext       = !isDone && !isCancelled && ahead === 0 && current > 0;
  const queueNotStarted = current === 0 && !isDone && !isCancelled;
  const progPct = myToken > 0 && current > 0
    ? Math.min(100, Math.round((current / myToken) * 100)) : 0;
  const userPct = 100; // "YOU" marker is always at end

  const status = isCancelled ? "cancelled"
    : isCompleted  ? "completed"
    : isConsulting ? "consulting"
    : isNext       ? "next"
    : isNear       ? "near"
    : queueNotStarted ? "notstarted"
    : "waiting";

  const statusCfg = {
    notstarted: { label: "Queue Not Started", color: "#818CF8", bg: "rgba(99,102,241,0.18)",  border: "rgba(99,102,241,0.4)"  },
    waiting:    { label: "In Queue",          color: "#818CF8", bg: "rgba(99,102,241,0.18)",  border: "rgba(99,102,241,0.4)"  },
    near:       { label: "Almost There",      color: "#F59E0B", bg: "rgba(245,158,11,0.18)",  border: "rgba(245,158,11,0.4)"  },
    next:       { label: "You're Next!",      color: "#4ADE80", bg: "rgba(34,197,94,0.18)",   border: "rgba(34,197,94,0.4)"   },
    consulting: { label: "Your Turn!",        color: "#4ADE80", bg: "rgba(34,197,94,0.18)",   border: "rgba(34,197,94,0.4)"   },
    completed:  { label: "Completed",         color: "#67E8F9", bg: "rgba(6,182,212,0.18)",   border: "rgba(6,182,212,0.4)"   },
    cancelled:  { label: "Cancelled",         color: "#F87171", bg: "rgba(239,68,68,0.18)",   border: "rgba(239,68,68,0.4)"   },
  }[status];

  // ── In-app reminder banner triggered by live ahead count ──────
  useEffect(() => {
    if (myToken === 0 || liveWaitingNumbers === null) return;
    const triggered = lastTriggeredRef.current;
    // Check each selected threshold
    for (const threshold of selectedReminders) {
      if (!triggered.has(threshold) && ahead <= threshold) {
        triggered.add(threshold);
        const msg = threshold === 0
          ? "It's your turn! Head to the clinic now."
          : `Only ${threshold} patient${threshold === 1 ? "" : "s"} ahead of you. Get ready!`;
        setReminderBanner(msg);
        if (bannerTimer.current) clearTimeout(bannerTimer.current);
        bannerTimer.current = setTimeout(() => setReminderBanner(null), 5000);
        break;
      }
    }
  }, [ahead, selectedReminders, myToken, liveWaitingNumbers]);

  // ── Animations ────────────────────────────────────────────────
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
    slideUpY.value = 20; slideUpOp.value = 0;
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

  const slideUpStyle = useAnimatedStyle(() => ({ transform: [{ translateY: slideUpY.value }], opacity: slideUpOp.value }));
  const ring1Style = useAnimatedStyle(() => ({ transform: [{ scale: ring1.value }], opacity: ring1Op.value }));
  const ring2Style = useAnimatedStyle(() => ({ transform: [{ scale: ring2.value }], opacity: ring2Op.value }));
  const ring3Style = useAnimatedStyle(() => ({ transform: [{ scale: ring3.value }], opacity: ring3Op.value }));
  const liveStyle  = useAnimatedStyle(() => ({ opacity: liveBlinkOp.value }));

  const ringColor = isNear || isDone ? "#F59E0B" : "#4F46E5";
  const ringBase  = isNear ? "rgba(245,158,11,0.6)" : isDone ? "rgba(34,197,94,0.5)" : "rgba(99,102,241,0.5)";

  if (!validTokenId || tokenError || (!tokenLoading && !token)) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Feather name="inbox" size={48} color="rgba(255,255,255,0.15)" />
        <Text style={{ color: "#FFF", marginTop: 16, fontSize: 16, fontWeight: "700" }}>No Active Queue</Text>
        <Text style={{ color: "rgba(255,255,255,0.4)", marginTop: 6, fontSize: 13, textAlign: "center", paddingHorizontal: 40 }}>You don't have an active token right now. Book a token to track your queue here.</Text>
        <Pressable
          style={{ marginTop: 20, backgroundColor: "#4F46E5", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (tokenLoading || posLoading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color="#4F46E5" size="large" />
        <Text style={{ color: "rgba(255,255,255,0.4)", marginTop: 14, fontSize: 13 }}>Loading queue…</Text>
      </View>
    );
  }

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
        <View style={styles.headerBtn}>
          <Feather name="bell" size={18} color="rgba(255,255,255,0.7)" />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>

        {/* Pulsing Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextLeft}>
            <Text style={styles.heroLabelSmall}>NOW CONSULTING</Text>
            {current > 0 && !!liveCurrentTokenType && (
              <View style={[
                styles.tokenTypeBadge,
                liveCurrentTokenType === "emergency"
                  ? styles.tokenTypeBadgeEmergency
                  : liveCurrentTokenType === "skipped"
                    ? styles.tokenTypeBadgeSkipped
                    : styles.tokenTypeBadgeNormal,
              ]}>
                <Feather
                  name={liveCurrentTokenType === "emergency" ? "alert-circle" : liveCurrentTokenType === "skipped" ? "skip-forward" : "check-circle"}
                  size={10}
                  color={liveCurrentTokenType === "emergency" ? "#EF4444" : liveCurrentTokenType === "skipped" ? "#F59E0B" : "#22C55E"}
                />
                <Text style={[
                  styles.tokenTypeBadgeTxt,
                  { color: liveCurrentTokenType === "emergency" ? "#FCA5A5" : liveCurrentTokenType === "skipped" ? "#FDE68A" : "#86EFAC" },
                ]}>
                  {liveCurrentTokenType === "emergency" ? "Emergency" : liveCurrentTokenType === "skipped" ? "Skipped Token" : "Normal"}
                </Text>
              </View>
            )}
            <View style={styles.heroRingWrap}>
              <Animated.View style={[styles.heroRingOuter, ring1Style, { borderColor: ringBase }]} />
              <View style={[styles.heroRingMid, { borderColor: isNear || isDone ? "rgba(245,158,11,0.35)" : "rgba(99,102,241,0.35)" }]} />
              <LGradient
                colors={isNear || isDone ? ["#F59E0B", "#EF4444"] : ["#4F46E5", "#06B6D4"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.heroCore}
              >
                <Animated.Text style={[styles.heroCoreNum, slideUpStyle, current ? { fontSize: 24, letterSpacing: 0 } : {}]}>
                  {current ? (liveCurrentTokenType === "emergency" ? `#E${current}` : `#${current}`) : "–"}
                </Animated.Text>
                <Text style={styles.heroCoreLabel}>Current</Text>
              </LGradient>
            </View>
            <Text style={styles.heroDocName}>
              {doctorName.startsWith("Dr") ? doctorName : `Dr. ${doctorName}`}
            </Text>
            <Text style={styles.heroConsultingTxt} numberOfLines={1}>
              {current
                ? `Doctor is consulting Token ${liveCurrentTokenType === "emergency" ? `#E${current}` : `#${current}`}`
                : "Queue not started yet"}
            </Text>
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

        {/* Amber Queue Status Card — progress + appointment */}
        <View style={styles.sectionPad}>
          <View style={styles.amberCard}>
            {/* Card header label */}
            <View style={styles.amberCardHeader}>
              <Feather name="activity" size={13} color="#F59E0B" />
              <Text style={styles.amberCardTitle}>Your Appointment</Text>
              <View style={[styles.apptStatusBadge, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
                <Text style={[styles.apptStatusTxt, { color: statusCfg.color }]}>{statusCfg.label}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.amberProgressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLbl}>{ahead} token{ahead !== 1 ? "s" : ""} ahead of you</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: pct(Math.max(5, progPct)) }]}>
                  <LinearGradient colors={["#F59E0B", "#FBBF24"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                </View>
                <View style={[styles.youMarker, { left: "95%" as any }]}>
                  <View style={[styles.youDot, { backgroundColor: "#F59E0B" }]} />
                  <Text style={styles.youLabel}>YOU</Text>
                </View>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.amberStatsRow}>
              <View style={styles.amberStatBox}>
                <Feather name="users" size={14} color="#F59E0B" />
                <Text style={styles.amberStatVal}>{ahead}</Text>
                <Text style={styles.amberStatLbl}>Ahead</Text>
              </View>
              <View style={styles.amberStatDivider} />
              <View style={styles.amberStatBox}>
                <Feather name="clock" size={14} color="#F59E0B" />
                <Text style={styles.amberStatVal}>~{waitMin}</Text>
                <Text style={styles.amberStatLbl}>Min Wait</Text>
              </View>
            </View>

            {/* Doctor row */}
            <View style={styles.amberDoctorRow}>
              <View style={styles.apptDoctorAvatar}>
                <Feather name="user" size={14} color="#818CF8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.apptDoctorName}>{doctorName}</Text>
                <Text style={styles.apptDoctorSpec}>{specialization}{clinicName ? ` · ${clinicName}` : ""}</Text>
              </View>
              <View style={styles.apptVerifiedBadge}>
                <Feather name="check-circle" size={11} color="#22C55E" />
                <Text style={styles.apptVerifiedTxt}>Verified</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Clinic Details Card */}
        <View style={styles.sectionPad}>
          <View style={styles.clinicCard}>
            {/* Top row: name + maps */}
            <View style={styles.clinicCardHeader}>
              <Feather name="home" size={13} color="#67E8F9" />
              <Text style={styles.clinicCardName} numberOfLines={1}>{clinicName}</Text>
              {(!!liveClinicMaps || !!clinicAddress) && (
                <Pressable
                  style={styles.mapsBtn}
                  onPress={() => Linking.openURL(liveClinicMaps || `https://maps.google.com/?q=${encodeURIComponent(clinicAddress)}`)}
                >
                  <Feather name="navigation" size={11} color="#4285F4" />
                  <Text style={styles.mapsBtnTxt}>Maps</Text>
                </Pressable>
              )}
            </View>
            {/* Address / District / State */}
            {(!!clinicAddress || !!liveClinicDistrict || !!liveClinicState) && (
              <View style={styles.clinicCardRow}>
                <Feather name="map-pin" size={10} color="rgba(255,255,255,0.3)" />
                <Text style={styles.clinicCardMeta} numberOfLines={2}>
                  {[clinicAddress, liveClinicDistrict, liveClinicState].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
            {/* Shift + timing */}
            <View style={styles.clinicCardRow}>
              <Feather name={shiftIcon} size={10} color="rgba(255,255,255,0.3)" />
              <Text style={styles.clinicCardMeta}>
                {shiftLabel}{liveShiftTiming ? `  ·  ${liveShiftTiming}` : ""}
              </Text>
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
        {!isNear && !isNext && !isDone && !isCancelled && (
          <View style={styles.sectionPad}>
            <View style={styles.alertBannerBlue}>
              <Feather name="info" size={15} color="#67E8F9" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: "#67E8F9" }]}>Wait at home or nearby</Text>
                <Text style={styles.alertBody}>Queue updates in real-time. Arrive a few minutes before your turn.</Text>
              </View>
            </View>
          </View>
        )}

        {/* In-app reminder banner */}
        {reminderBanner && (
          <View style={styles.sectionPad}>
            <Pressable style={styles.reminderBanner} onPress={() => setReminderBanner(null)}>
              <Feather name="bell" size={14} color="#FDE68A" />
              <Text style={styles.reminderBannerTxt}>{reminderBanner}</Text>
              <Feather name="x" size={12} color="rgba(253,230,138,0.6)" />
            </Pressable>
          </View>
        )}


        {/* Payment Summary — collapsible, at the bottom */}
        {hasFeeData && (
          <View style={styles.sectionPad}>
            <View style={styles.feeCard}>
              {/* Dropdown toggle header */}
              <Pressable style={styles.feeDropdownHeader} onPress={() => setFeeExpanded(v => !v)}>
                <Feather name="file-text" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={[styles.feeHeaderTitle, { flex: 0, marginRight: 6 }]}>Payment Summary</Text>
                {token?.paymentStatus === "paid" && !feeExpanded && (
                  <View style={styles.feePaidBadge}>
                    <Feather name="check-circle" size={9} color="#4ADE80" />
                    <Text style={styles.feePaidBadgeTxt}>Paid</Text>
                  </View>
                )}
                <View style={{ flex: 1 }} />
                {!feeExpanded && (
                  <Text style={[styles.feeTotalVal, { fontSize: 13, marginRight: 8 }, isEmergency && { color: "#F87171" }]}>₹{feeTotalVisit}</Text>
                )}
                <Feather name={feeExpanded ? "chevron-up" : "chevron-down"} size={15} color="rgba(255,255,255,0.45)" />
              </Pressable>

              {feeExpanded && (
                <>
                  <View style={styles.feeSectionDivider} />
                  <View style={styles.feeGroupRow}>
                    <Feather name="credit-card" size={10} color="#67E8F9" />
                    <Text style={styles.feeGroupLbl}>Paid Online</Text>
                  </View>
                  <View style={styles.feeLineRow}>
                    <Feather name="monitor" size={11} color={isEmergency ? "#EF4444" : "#67E8F9"} />
                    <Text style={styles.feeLineLbl}>{isEmergency ? "Emergency E-Token Fee" : "E-Token Fee"}</Text>
                    <Text style={[styles.feeLineVal, { color: isEmergency ? "#EF4444" : "#67E8F9" }]}>₹{feeDoctorEarns}</Text>
                  </View>
                  <View style={styles.feeDivider} />
                  <View style={styles.feeLineRow}>
                    <Feather name="shield" size={11} color="#818CF8" />
                    <Text style={styles.feeLineLbl}>Platform Fee</Text>
                    <Text style={[styles.feeLineVal, { color: "#818CF8" }]}>₹{feePlatform}</Text>
                  </View>
                  <View style={styles.feeSubtotalRow}>
                    <Text style={styles.feeSubtotalLbl}>Paid Online</Text>
                    <Text style={[styles.feeSubtotalVal, isEmergency && { color: "#F87171" }]}>₹{feePayNow}</Text>
                  </View>

                  {feePayAtClinic > 0 && (
                    <>
                      <View style={styles.feeSectionDivider} />
                      <View style={styles.feeGroupRow}>
                        <Feather name="home" size={10} color="#F59E0B" />
                        <Text style={[styles.feeGroupLbl, { color: "#F59E0B" }]}>Pay at Clinic</Text>
                      </View>
                      <View style={styles.feeLineRow}>
                        <Feather name="activity" size={11} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.feeLineLblSub}>{isEmergency ? "Emergency Consultation" : "Consultation Fee"}</Text>
                        <Text style={[styles.feeLineValClinic, isEmergency && { color: "#FCA5A5" }]}>₹{feeClinicConsult}</Text>
                      </View>
                    </>
                  )}

                  <View style={styles.feeSectionDivider} />
                  <View style={styles.feeTotalRow}>
                    <View>
                      <Text style={styles.feeTotalLbl}>Total Visit Cost</Text>
                      <Text style={styles.feeTotalHint}>Online + Clinic</Text>
                    </View>
                    <Text style={[styles.feeTotalVal, isEmergency && { color: "#F87171" }]}>₹{feeTotalVisit}</Text>
                  </View>
                  {token?.paymentStatus === "paid" && (
                    <View style={[styles.feePaidBadge, { alignSelf: "flex-start", marginTop: 8, marginHorizontal: 14, marginBottom: 6 }]}>
                      <Feather name="check-circle" size={9} color="#4ADE80" />
                      <Text style={styles.feePaidBadgeTxt}>Paid</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const RING_SIZE = 120;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(99,102,241,0.22)" },
  orb2: { position: "absolute", top: 200, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(6,182,212,0.14)" },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingBottom: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(34,197,94,0.18)", borderWidth: 1, borderColor: "rgba(34,197,94,0.4)" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
  liveBadgeTxt: { fontSize: 9, fontWeight: "800", color: "#4ADE80", letterSpacing: 1 },
  headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },

  sectionPad: { paddingHorizontal: 20, marginBottom: 14 },

  clinicCard: { borderRadius: 18, backgroundColor: "rgba(6,182,212,0.08)", borderWidth: 1, borderColor: "rgba(6,182,212,0.22)", paddingHorizontal: 14, paddingTop: 13, paddingBottom: 12, gap: 7 },
  clinicCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  clinicCardName: { flex: 1, fontSize: 13, fontWeight: "800", color: "#FFF", letterSpacing: 0.2 },
  clinicCardRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  clinicCardMeta: { fontSize: 11, color: "rgba(255,255,255,0.45)", flex: 1, lineHeight: 15 },
  mapsBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(66,133,244,0.18)", borderWidth: 1, borderColor: "rgba(66,133,244,0.35)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  mapsBtnTxt: { fontSize: 11, fontWeight: "700", color: "#4285F4" },

  tokenTypeBadge: { flexDirection: "row", alignItems: "center", alignSelf: "center", justifyContent: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, marginBottom: 2 },
  tokenTypeBadgeNormal: { backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.3)" },
  tokenTypeBadgeEmergency: { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)" },
  tokenTypeBadgeSkipped: { backgroundColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.3)" },
  tokenTypeBadgeTxt: { fontSize: 10, fontWeight: "700" },

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
  progressFill: { height: "100%" as any, borderRadius: 99, overflow: "hidden" },
  youMarker: { position: "absolute", top: -18, alignItems: "center", marginLeft: -10 },
  youDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFF", borderWidth: 2, borderColor: "#4F46E5" },
  youLabel: { fontSize: 8, fontWeight: "800", color: "#FFF", marginTop: 2 },

  statGrid: { flexDirection: "row", gap: 8 },
  statTile: { flex: 1, borderRadius: 16, paddingVertical: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  statIcon: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 13, fontWeight: "800" },
  statLbl: { fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: "600", textAlign: "center" },

  apptCard: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },

  amberCard: { borderRadius: 20, backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1.5, borderColor: "rgba(245,158,11,0.3)", overflow: "hidden" },
  amberCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  amberCardTitle: { flex: 1, fontSize: 13, fontWeight: "800", color: "#FFF", letterSpacing: 0.2 },
  amberProgressSection: { paddingHorizontal: 16, paddingBottom: 14 },
  amberStatsRow: { flexDirection: "row", alignItems: "stretch", borderTopWidth: 1, borderTopColor: "rgba(245,158,11,0.15)" },
  amberStatBox: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 14 },
  amberStatVal: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  amberStatLbl: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 0.5 },
  amberStatDivider: { width: 1, backgroundColor: "rgba(245,158,11,0.15)", marginVertical: 10 },
  amberDoctorRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(245,158,11,0.15)" },
  apptHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  apptTitle: { fontSize: 13, fontWeight: "800", color: "#FFF" },
  apptStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  apptStatusTxt: { fontSize: 10, fontWeight: "800" },
  apptBody: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 14 },
  apptTokenBox: { width: 68, alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1.5 },
  apptTokenHash: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.35)" },
  apptTokenNum: { fontSize: 28, fontWeight: "900", lineHeight: 32 },
  apptTokenLbl: { fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: "600", marginTop: 2 },
  apptDetails: { flex: 1, gap: 8 },
  apptDetailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  apptDetailLbl: { flex: 1, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: "600" },
  apptDetailVal: { fontSize: 11, fontWeight: "800", color: "#FFF" },
  apptDoctorRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
  apptDoctorAvatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(99,102,241,0.18)", alignItems: "center", justifyContent: "center" },
  apptDoctorName: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  apptDoctorSpec: { fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 },
  apptVerifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(34,197,94,0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  apptVerifiedTxt: { fontSize: 10, fontWeight: "700", color: "#22C55E" },

  alertBannerGreen:  { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 16, backgroundColor: "rgba(34,197,94,0.1)",   borderWidth: 1, borderColor: "rgba(34,197,94,0.3)"  },
  alertBannerYellow: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 16, backgroundColor: "rgba(252,211,77,0.1)",  borderWidth: 1, borderColor: "rgba(252,211,77,0.3)" },
  alertBannerCyan:   { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 16, backgroundColor: "rgba(6,182,212,0.1)",   borderWidth: 1, borderColor: "rgba(6,182,212,0.3)"  },
  alertBannerBlue:   { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 16, backgroundColor: "rgba(99,102,241,0.1)",  borderWidth: 1, borderColor: "rgba(99,102,241,0.3)" },
  alertTitle: { fontSize: 13, fontWeight: "800", color: "#FCD34D", marginBottom: 3 },
  alertBody:  { fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 16 },

  notifCard: { backgroundColor: "rgba(99,102,241,0.08)", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(99,102,241,0.2)" },
  notifHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  notifTitle: { fontSize: 12, fontWeight: "700", color: "#A5B4FC" },
  notifBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(34,197,94,0.2)" },
  notifBadgeTxt: { fontSize: 9, fontWeight: "800", color: "#4ADE80" },
  notifBody: { fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 16, marginBottom: 10 },
  notifTokensRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  notifTokenChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  notifTokenChipTxt: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.35)" },

  reminderBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(217,119,6,0.2)", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.4)" },
  reminderBannerTxt: { flex: 1, fontSize: 12, fontWeight: "600", color: "#FDE68A", lineHeight: 17 },

  feeCard: { borderRadius: 18, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)" },
  feeHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  feeDropdownHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 14 },
  feeHeaderTitle: { fontSize: 13, fontWeight: "800", color: "#FFF", flex: 1 },
  feePaidBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(34,197,94,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: "rgba(34,197,94,0.3)" },
  feePaidBadgeTxt: { fontSize: 9, fontWeight: "700", color: "#4ADE80" },
  feeGroupRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4 },
  feeGroupLbl: { fontSize: 10, fontWeight: "700", color: "#67E8F9", textTransform: "uppercase", letterSpacing: 0.8 },
  feeLineRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  feeLineLbl: { flex: 1, fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.75)" },
  feeLineVal: { fontSize: 14, fontWeight: "800" },
  feeLineLblSub: { flex: 1, fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: "500" },
  feeLineValClinic: { fontSize: 14, color: "#F59E0B", fontWeight: "700" },
  feeDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  feeSubtotalRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.03)" },
  feeSubtotalLbl: { flex: 1, fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.6)" },
  feeSubtotalVal: { fontSize: 16, fontWeight: "800", color: "#A5B4FC" },
  feeSectionDivider: { height: 1.5, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 14 },
  feeTotalRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13, backgroundColor: "rgba(255,255,255,0.03)" },
  feeTotalLbl: { fontSize: 13, fontWeight: "800", color: "#FFF" },
  feeTotalHint: { fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: "500", marginTop: 1 },
  feeTotalVal: { fontSize: 22, fontWeight: "900", color: "#A5B4FC", marginLeft: "auto" },
});
