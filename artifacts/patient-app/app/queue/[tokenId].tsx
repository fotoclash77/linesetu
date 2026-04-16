import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { pct } from "@/constants/design";
import { useQuery } from "@tanstack/react-query";
import { doc, onSnapshot } from "firebase/firestore";
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

  // ── Real-time clinic name from Firestore ──────────────────────
  const [liveClinicName, setLiveClinicName] = useState("");
  const [liveClinicAddress, setLiveClinicAddress] = useState("");
  const [liveClinicMaps, setLiveClinicMaps] = useState("");

  useEffect(() => {
    if (!token?.doctorId) return;
    const ref = doc(db, "doctors", token.doctorId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      const date = token?.date ?? "";
      const shift = token?.shift ?? "";
      // Try calendar entry first (shift-specific clinic)
      const shiftCfg = data.calendar?.[date]?.[shift];
      const calClinicName = shiftCfg?.clinicName ?? "";
      if (calClinicName) {
        setLiveClinicName(calClinicName);
        // Find matching clinic for address + maps link
        const clinicsArr: any[] = Array.isArray(data.clinics) ? data.clinics : [];
        const matched = clinicsArr.find((c: any) => c.name === calClinicName && c.active !== false);
        setLiveClinicAddress(matched?.address ?? shiftCfg?.clinicAddress ?? "");
        setLiveClinicMaps(matched?.maps ?? "");
      } else {
        // Fallback: first active clinic
        const clinicsArr: any[] = Array.isArray(data.clinics) ? data.clinics : [];
        const first = clinicsArr.find((c: any) => c.active !== false);
        setLiveClinicName(first?.name ?? data.clinicName ?? "Clinic");
        setLiveClinicAddress(first?.address ?? data.clinicAddress ?? "");
        setLiveClinicMaps(first?.maps ?? "");
      }
    }, () => {});
    return () => unsub();
  }, [token?.doctorId, token?.date, token?.shift]);

  // ── Derived values ────────────────────────────────────────────
  const myToken      = token?.tokenNumber ?? 0;
  const current      = pos?.currentToken  ?? 0;
  const ahead        = pos?.position      ?? 0;
  const waitMin      = pos?.estimatedWaitMins ?? ahead * AVG_MIN_PER_TOKEN;
  const totalWaiting = pos?.totalWaiting  ?? 0;
  const tokenStatus  = pos?.status ?? token?.status ?? "waiting";
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
  const feePayAtClinic = token?.payAtClinic ?? (feeClinicConsult + feeWalkin);
  const feeTotalVisit  = token?.totalVisitCost ?? (feePayNow + feePayAtClinic);
  const hasFeeData    = feePayNow > 0 || feePayAtClinic > 0;

  const isDone = tokenStatus === "in_consult" || tokenStatus === "done";
  const isNear = !isDone && ahead > 0 && ahead <= 3;
  const isNext = !isDone && ahead === 0;
  const progPct = myToken > 0 && current > 0
    ? Math.min(100, Math.round((current / myToken) * 100)) : 0;
  const userPct = 100; // "YOU" marker is always at end

  const status = isDone ? "done" : isNext ? "next" : isNear ? "near" : "waiting";
  const statusCfg = {
    waiting: { label: "Waiting",      color: "#818CF8", bg: "rgba(99,102,241,0.18)",  border: "rgba(99,102,241,0.4)"  },
    near:    { label: "Almost There", color: "#F59E0B", bg: "rgba(245,158,11,0.18)",  border: "rgba(245,158,11,0.4)"  },
    next:    { label: "You're Next!", color: "#4ADE80", bg: "rgba(34,197,94,0.18)",   border: "rgba(34,197,94,0.4)"   },
    done:    { label: "In Progress",  color: "#67E8F9", bg: "rgba(6,182,212,0.18)",   border: "rgba(6,182,212,0.4)"   },
  }[status];

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

        {/* Doctor & Clinic Strip */}
        <View style={styles.sectionPad}>
          <View style={styles.shiftStrip}>
            <View style={styles.shiftLeft}>
              <Feather name="home" size={12} color="#67E8F9" />
              <View>
                <Text style={styles.shiftClinic}>{clinicName}</Text>
                <Text style={styles.shiftLoc}>{clinicAddress ? `${clinicAddress} · ` : ""}{shiftLabel}</Text>
              </View>
            </View>
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
        </View>

        {/* Pulsing Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextLeft}>
            <Text style={styles.heroLabelSmall}>NOW CONSULTING</Text>
            <View style={styles.heroRingWrap}>
              <Animated.View style={[styles.heroRingOuter, ring1Style, { borderColor: ringBase }]} />
              <View style={[styles.heroRingMid, { borderColor: isNear || isDone ? "rgba(245,158,11,0.35)" : "rgba(99,102,241,0.35)" }]} />
              <LGradient
                colors={isNear || isDone ? ["#F59E0B", "#EF4444"] : ["#4F46E5", "#06B6D4"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.heroCore}
              >
                <Animated.Text style={[styles.heroCoreNum, slideUpStyle]}>{current || "–"}</Animated.Text>
                <Text style={styles.heroCoreLabel}>Current</Text>
              </LGradient>
            </View>
            <Text style={styles.heroDocName}>
              {doctorName.startsWith("Dr") ? doctorName : `Dr. ${doctorName}`}
            </Text>
            <Text style={styles.heroConsultingTxt} numberOfLines={1}>
              {current ? `Doctor is consulting Token #${current}` : "Queue not started yet"}
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

        {/* Progress Bar */}
        <View style={styles.sectionPad}>
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLbl}>{ahead} token{ahead !== 1 ? "s" : ""} ahead of you</Text>
            <Text style={styles.progressRight}>~{waitMin} min</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: pct(Math.max(5, progPct)) }]}>
                <LinearGradient colors={["#4F46E5", "#06B6D4"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </View>
              <View style={[styles.youMarker, { left: "95%" as any }]}>
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
              { label: "My Token",    val: `#${myToken}`,           color: "#A5B4FC", bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.3)",  icon: "hash"     },
              { label: "Clinic",      val: "Open",                   color: "#4ADE80", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)",  icon: "home"     },
              { label: "Tokens Left", val: `${ahead}`,               color: "#67E8F9", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.25)",  icon: "list"     },
              { label: "Est. Wait",   val: `~${waitMin}m`,           color: "#F59E0B", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)", icon: "clock"    },
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
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Feather name={shiftIcon} size={11} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.apptDetailVal}>{shiftLabel}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.apptDoctorRow}>
              <View style={styles.apptDoctorAvatar}>
                <Feather name="user" size={14} color="#818CF8" />
              </View>
              <View>
                <Text style={styles.apptDoctorName}>{doctorName}</Text>
                <Text style={styles.apptDoctorSpec}>{specialization}{clinicName ? ` · ${clinicName}` : ""}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={styles.apptVerifiedBadge}>
                <Feather name="check-circle" size={11} color="#22C55E" />
                <Text style={styles.apptVerifiedTxt}>Verified</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fee Breakdown */}
        {hasFeeData && (
          <View style={styles.sectionPad}>
            <View style={styles.feeCard}>
              <View style={styles.feeHeader}>
                <Feather name="file-text" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.feeHeaderTitle}>Payment Summary</Text>
                {token?.paymentStatus === "paid" && (
                  <View style={styles.feePaidBadge}>
                    <Feather name="check-circle" size={9} color="#4ADE80" />
                    <Text style={styles.feePaidBadgeTxt}>Paid</Text>
                  </View>
                )}
              </View>

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
                  {feeWalkin > 0 && (
                    <>
                      <View style={styles.feeDivider} />
                      <View style={styles.feeLineRow}>
                        <Feather name="log-in" size={11} color="#2DD4BF" />
                        <Text style={styles.feeLineLblSub}>Walk-in Fee</Text>
                        <Text style={[styles.feeLineValClinic, { color: "#2DD4BF" }]}>₹{feeWalkin}</Text>
                      </View>
                    </>
                  )}
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
            </View>
          </View>
        )}

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
                <Text style={styles.alertBody}>Queue updates in real-time. Arrive a few minutes before your turn.</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notification Card */}
        <View style={styles.sectionPad}>
          <View style={styles.notifCard}>
            <View style={styles.notifHeader}>
              <Feather name="bell" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.notifTitle}>Reminders Active</Text>
              <View style={{ flex: 1 }} />
              <View style={styles.notifBadge}><Text style={styles.notifBadgeTxt}>Active</Text></View>
            </View>
            <Text style={styles.notifBody}>You'll get notified when your turn is approaching. Stay relaxed!</Text>
            <View style={styles.notifTokensRow}>
              {["10 tokens left", "5 tokens left", "1 token left", "Your turn"].map((t, i) => (
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
              <Feather name={shiftIcon} size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.shiftCardTitle}>{shiftLabel} Details</Text>
            </View>
            <View style={styles.shiftDetail}>
              <Feather name="clock" size={11} color="rgba(255,255,255,0.3)" />
              <Text style={styles.shiftDetailTxt}>{shift === "morning" ? "10:00 AM – 2:00 PM" : "4:00 PM – 8:00 PM"}</Text>
            </View>
            {!!clinicAddress && (
              <View style={styles.shiftDetail}>
                <Feather name="map-pin" size={11} color="rgba(255,255,255,0.3)" />
                <Text style={styles.shiftDetailTxt}>{clinicAddress}</Text>
              </View>
            )}
          </View>
        </View>
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
  notifTokenChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  notifTokenChipTxt: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.35)" },

  shiftCard: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  shiftCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  shiftCardTitle: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  shiftDetail: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  shiftDetailTxt: { fontSize: 11, color: "rgba(255,255,255,0.4)" },

  feeCard: { borderRadius: 18, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)" },
  feeHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
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
