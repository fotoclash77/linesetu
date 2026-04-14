import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { pct } from "@/constants/design";
import { useQuery } from "@tanstack/react-query";
import { getGetDoctorQueryOptions } from "@workspace/api-client-react";
import React, { useState, useEffect } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

const isWeb = Platform.OS === "web";
const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

type FamilyMember = { id: string; name: string; relation: string; age: number; blood: string; gender: string; phone: string; avatar: string; color: string };
const ACCENT_FAMILY = ["#6366F1","#EC4899","#F59E0B","#10B981","#06B6D4","#8B5CF6"];
const SELF_DEFAULT: FamilyMember = { id: "self", name: "Self", relation: "Self", age: 0, blood: "", gender: "", phone: "", avatar: "", color: "#6366F1" };

const TYPE_COLOR: Record<string, string> = {
  emergency: "#F87171",
  online: "#67E8F9",
  walkin: "#4ADE80",
};

const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

interface ShiftCard {
  id: "morning" | "evening";
  label: string;
  icon: "sun" | "moon";
  startTime: string;
  endTime: string;
  clinicName: string;
  address: string;
  locationLink: string;
  maxTokens: number;
  color: string;
}

interface TokenRow {
  id: string; tokenNumber: number; patientName: string;
  type: string; status: string; shift: string;
}

function buildShiftCards(dayCfg: any): ShiftCard[] {
  if (!dayCfg || dayCfg.off) return [];
  const cards: ShiftCard[] = [];
  const m = dayCfg.morning;
  const e = dayCfg.evening;
  if (m?.enabled) cards.push({
    id: "morning", label: "Morning", icon: "sun", color: "#F59E0B",
    startTime: m.startTime ?? "09:00", endTime: m.endTime ?? "13:00",
    clinicName: m.clinicName ?? "", address: m.address ?? "", locationLink: m.locationLink ?? "",
    maxTokens: parseInt(String(m.maxTokens ?? "20"), 10) || 20,
  });
  if (e?.enabled) cards.push({
    id: "evening", label: "Evening", icon: "moon", color: "#818CF8",
    startTime: e.startTime ?? "17:00", endTime: e.endTime ?? "21:00",
    clinicName: e.clinicName ?? "", address: e.address ?? "", locationLink: e.locationLink ?? "",
    maxTokens: parseInt(String(e.maxTokens ?? "15"), 10) || 15,
  });
  return cards;
}

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const { doctorId, date: dateParam, shift: shiftParam } = useLocalSearchParams<{
    doctorId: string; date?: string; shift?: string;
  }>();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 20;

  // Build rolling 30-day calendar
  const today = new Date(); today.setHours(0,0,0,0);
  const todayIso = isoOf(today);
  const dates30: Date[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    dates30.push(d);
  }
  const startDow = today.getDay();
  const cells: (Date | null)[] = [...Array(startDow).fill(null), ...dates30];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  // State
  const initDate = (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) ? dateParam : todayIso;
  const initShift = (shiftParam === "morning" || shiftParam === "evening") ? shiftParam : null;

  const [visitType, setVisitType] = useState<"first-visit" | "follow-up">("first-visit");
  const [tokenType, setTokenType] = useState<"normal" | "emergency">("normal");
  const [selectedIso, setSelectedIso] = useState<string>(initDate);
  const [selectedShiftId, setSelectedShiftId] = useState<"morning" | "evening" | null>(initShift);
  const [family, setFamily] = useState<FamilyMember[]>([SELF_DEFAULT]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember>(SELF_DEFAULT);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  // Load family members from AsyncStorage
  useEffect(() => {
    import("@react-native-async-storage/async-storage").then(({ default: AS }) => {
      AS.getItem("linesetu_family").then(raw => {
        try {
          const stored: any[] = raw ? JSON.parse(raw) : [];
          const selfM: FamilyMember = {
            id: "self", name: (patient as any)?.name ?? "Self",
            relation: "Self", age: (patient as any)?.age ?? 0,
            blood: (patient as any)?.blood ?? "", gender: (patient as any)?.gender ?? "",
            phone: (patient as any)?.phone ?? "", avatar: (patient as any)?.photo ?? "", color: "#6366F1",
          };
          const extras: FamilyMember[] = stored.map((f: any, i: number) => ({
            id: f.id ?? `member_${i}`, name: f.name ?? "Member", relation: f.relation ?? "Family",
            age: f.age ?? 0, blood: f.blood ?? "", gender: f.gender ?? "",
            phone: f.phone ?? "", avatar: f.photo ?? "", color: ACCENT_FAMILY[i % ACCENT_FAMILY.length],
          }));
          const all = [selfM, ...extras];
          setFamily(all);
          setSelectedMember(selfM);
        } catch { /* ignore */ }
      }).catch(() => {});
    });
  }, [patient?.id]);

  // Real token counts for selected date (re-fetched via SSE/polling)
  const [tokenCounts, setTokenCounts] = useState<Record<string, number>>({ morning: 0, evening: 0 });
  const [liveQueue, setLiveQueue] = useState<TokenRow[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // Doctor data from Firebase
  const isDemoId = !doctorId || doctorId.startsWith("demo");
  const { data: doctorData } = useQuery({
    ...getGetDoctorQueryOptions(doctorId ?? ""),
    enabled: !isDemoId,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });

  const docName  = isDemoId ? "Dr. Ananya Sharma" : (doctorData?.name ?? "Doctor");
  const docSpec  = isDemoId ? "Cardiologist"      : (doctorData?.specialization ?? "");
  const docPhoto = (doctorData as any)?.profilePhoto ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(docName)}&background=4F46E5&color=fff`;
  const docAvail = isDemoId ? true : ((doctorData as any)?.isAvailable !== false);

  const calendar: Record<string, any> = (doctorData as any)?.calendar ?? {};

  // Live queue fetch with SSE + polling fallback for the selected date
  useEffect(() => {
    if (isDemoId || !doctorId) {
      setQueueLoading(false);
      return;
    }
    setQueueLoading(true);
    let active = true;
    const url = `${BASE}/api/tokens/stream/${doctorId}?date=${selectedIso}`;

    if (typeof EventSource !== "undefined") {
      const es = new EventSource(url);
      es.onmessage = (ev) => {
        try {
          const tokens: TokenRow[] = JSON.parse(ev.data);
          const valid = tokens.filter(t => t.status !== "cancelled");
          const mc = valid.filter(t => t.shift === "morning").length;
          const ec = valid.filter(t => t.shift === "evening").length;
          if (active) {
            setTokenCounts({ morning: mc, evening: ec });
            setLiveQueue(valid.slice(0, 5));
            setQueueLoading(false);
          }
        } catch (_) {}
      };
      es.onerror = () => { if (active) setQueueLoading(false); };
      return () => { active = false; es.close(); };
    }

    // Polling fallback
    const poll = async () => {
      try {
        const res = await fetch(`${BASE}/api/tokens?doctorId=${doctorId}&date=${selectedIso}`);
        const data = await res.json();
        if (data.tokens && active) {
          const valid: TokenRow[] = data.tokens.filter((t: any) => t.status !== "cancelled");
          const mc = valid.filter(t => t.shift === "morning").length;
          const ec = valid.filter(t => t.shift === "evening").length;
          setTokenCounts({ morning: mc, evening: ec });
          setLiveQueue(valid.slice(0, 5));
        }
      } catch (_) {}
      if (active) setQueueLoading(false);
    };
    poll();
    const iv = setInterval(poll, 10_000);
    return () => { active = false; clearInterval(iv); };
  }, [doctorId, selectedIso, isDemoId]);

  // Derive shift cards for selected date from calendar
  const dayCfg = calendar[selectedIso] ?? null;
  const shiftCards = isDemoId ? [] : buildShiftCards(dayCfg);

  const selectedShift = shiftCards.find(s => s.id === selectedShiftId) ?? null;
  const canBook = selectedShift !== null;

  // If previously selected shift is no longer available on new date, clear it
  useEffect(() => {
    if (selectedShiftId && shiftCards.length > 0 && !shiftCards.find(s => s.id === selectedShiftId)) {
      setSelectedShiftId(null);
    }
  }, [selectedIso]);

  const isEmergency = tokenType === "emergency";
  const eAppFee = isEmergency ? 20 : 10;
  const platformFee = 10;
  const payableNow = eAppFee + platformFee;
  const consultFee = 500;

  // Calendar cell style — no entry = holiday by default (matches doctor app)
  function cellStyle(cfg: any) {
    if (!cfg) return { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", off: true };
    if (cfg.off) return { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", off: true };
    const m = cfg.morning?.enabled, e = cfg.evening?.enabled;
    if (m && e)  return { bg: "rgba(13,148,136,0.13)",  border: "rgba(45,212,191,0.35)",  off: false };
    if (m)       return { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",   off: false };
    if (e)       return { bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.3)",   off: false };
    return { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", off: true };
  }

  // Month label tracking
  let prevMonth = -1;
  const monthRows: { label: string; rowIdx: number }[] = [];
  rows.forEach((row, ri) => {
    const fd = row.find(c => c !== null);
    if (fd && fd.getMonth() !== prevMonth) {
      prevMonth = fd.getMonth();
      monthRows.push({ label: fd.toLocaleDateString("en-IN", { month: "long", year: "numeric" }), rowIdx: ri });
    }
  });

  function handleBook() {
    if (!canBook) return;
    router.push({
      pathname: "/payment",
      params: {
        doctorId: doctorId ?? "demo1",
        doctorName: docName,
        doctorPhoto: docPhoto,
        doctorSpec: docSpec,
        visitType,
        date: selectedIso,
        shift: selectedShift!.id,
        clinic: selectedShift!.clinicName,
        clinicLoc: selectedShift!.address,
        time: `${selectedShift!.startTime} – ${selectedShift!.endTime}`,
        patientId: selectedMember.id,
        patientName: selectedMember.name,
        tokenType,
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
            </View>
            <View style={[styles.availPip, !docAvail && { backgroundColor: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.35)" }]}>
              <View style={[styles.availPipDot, !docAvail && { backgroundColor: "#EF4444" }]} />
              <Text style={[styles.availPipTxt, !docAvail && { color: "#F87171" }]}>{docAvail ? "Available" : "Unavailable"}</Text>
            </View>
          </View>
        </View>

        {/* Visit Type Toggle */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Visit Type</Text>
          <View style={styles.toggleRow}>
            <Pressable style={[styles.toggleBtn, visitType === "first-visit" && styles.toggleBtnActive]} onPress={() => setVisitType("first-visit")}>
              <Feather name="user-plus" size={14} color={visitType === "first-visit" ? "#FFF" : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.toggleTxt, visitType === "first-visit" && styles.toggleTxtActive]}>First Visit</Text>
            </Pressable>
            <Pressable style={[styles.toggleBtn, visitType === "follow-up" && styles.toggleBtnActive]} onPress={() => setVisitType("follow-up")}>
              <Feather name="repeat" size={14} color={visitType === "follow-up" ? "#FFF" : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.toggleTxt, visitType === "follow-up" && styles.toggleTxtActive]}>Follow-up</Text>
            </Pressable>
          </View>
        </View>

        {/* Token Type Toggle */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Token Priority</Text>
          <View style={styles.toggleRow}>
            <Pressable style={[styles.toggleBtn, tokenType === "normal" && styles.toggleBtnActive]} onPress={() => setTokenType("normal")}>
              <Feather name="user" size={14} color={tokenType === "normal" ? "#FFF" : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.toggleTxt, tokenType === "normal" && styles.toggleTxtActive]}>Normal</Text>
            </Pressable>
            <Pressable style={[styles.toggleBtn, tokenType === "emergency" && { borderColor: "#EF4444", backgroundColor: "rgba(239,68,68,0.2)" }]} onPress={() => setTokenType("emergency")}>
              <Feather name="alert-triangle" size={14} color={tokenType === "emergency" ? "#F87171" : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.toggleTxt, tokenType === "emergency" && { color: "#F87171" }]}>Emergency</Text>
            </Pressable>
          </View>
          <View style={styles.feePreviewCard}>
            <View style={styles.feePreviewRow}>
              <Feather name="monitor" size={12} color={isEmergency ? "#F87171" : "#67E8F9"} />
              <Text style={styles.feePreviewLbl}>E-Token Fee</Text>
              <Text style={[styles.feePreviewVal, { color: isEmergency ? "#F87171" : "#67E8F9" }]}>₹{eAppFee}</Text>
            </View>
            <View style={styles.feePreviewRow}>
              <Feather name="shield" size={12} color="#818CF8" />
              <Text style={styles.feePreviewLbl}>Platform Fee</Text>
              <Text style={[styles.feePreviewVal, { color: "#818CF8" }]}>₹{platformFee}</Text>
            </View>
            <View style={[styles.feePreviewRow, { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", marginTop: 6, paddingTop: 8 }]}>
              <Feather name="credit-card" size={12} color="#FFF" />
              <Text style={[styles.feePreviewLbl, { color: "#FFF", fontWeight: "700" }]}>Pay Now</Text>
              <Text style={[styles.feePreviewVal, { color: isEmergency ? "#F87171" : "#A5B4FC", fontWeight: "700", fontSize: 15 }]}>₹{payableNow}</Text>
            </View>
            <Text style={styles.feePreviewNote}>+ ₹{consultFee} consultation paid directly at clinic</Text>
          </View>
        </View>

        {/* Calendar — real rolling 30 days */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Select Date</Text>
          <View style={styles.calHeader}>
            {DOW.map(d => <Text key={d} style={styles.calDow}>{d}</Text>)}
          </View>
          {rows.map((row, ri) => {
            const ml = monthRows.find(m => m.rowIdx === ri);
            return (
              <View key={ri}>
                {ml && <Text style={calRowStyles.monthLabel}>{ml.label}</Text>}
                <View style={styles.calGrid}>
                  {row.map((cell, ci) => {
                    if (!cell) return <View key={ci} style={styles.calCell} />;
                    const iso = isoOf(cell);
                    const cfg = calendar[iso];
                    const cs = cellStyle(cfg);
                    const isPast = cell < today;
                    const isToday = cell.getTime() === today.getTime();
                    const isSelected = iso === selectedIso;
                    const isOff = cs.off;
                    return (
                      <Pressable
                        key={ci}
                        disabled={isPast || (isOff && !isDemoId)}
                        onPress={() => { setSelectedIso(iso); setSelectedShiftId(null); }}
                        style={[
                          styles.calCell,
                          !isDemoId && { backgroundColor: cs.bg, borderWidth: 1, borderColor: cs.border, borderRadius: 8 },
                          isSelected && styles.calCellSelected,
                          isToday && !isSelected && styles.calCellToday,
                          isPast && !isSelected && styles.calCellPast,
                        ]}
                      >
                        <Text style={[
                          styles.calCellTxt,
                          isSelected && styles.calCellTxtSelected,
                          isPast && styles.calCellTxtPast,
                          isOff && !isDemoId && { color: "rgba(239,68,68,0.6)", textDecorationLine: "line-through" },
                          isToday && !isSelected && { color: "#2DD4BF", fontWeight: "800" },
                        ]}>{cell.getDate()}</Text>
                        {/* Shift availability dots */}
                        {!isDemoId && !isPast && (
                          <View style={{ flexDirection: "row", gap: 2, marginTop: 2, height: 5, alignItems: "center", justifyContent: "center" }}>
                            {!isOff && cfg?.morning?.enabled && (
                              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#FCD34D" }} />
                            )}
                            {!isOff && cfg?.evening?.enabled && (
                              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#A5B4FC" }} />
                            )}
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
          {!isDemoId && (
            <View style={calRowStyles.legend}>
              {[{ color: "#2DD4BF", label: "Both" }, { color: "#FCD34D", label: "Morning" }, { color: "#A5B4FC", label: "Evening" }, { color: "#F87171", label: "Holiday" }].map(item => (
                <View key={item.label} style={calRowStyles.legendItem}>
                  <View style={[calRowStyles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={calRowStyles.legendTxt}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Shift Cards — real from Firebase calendar */}
        {!isDemoId && (
          <View style={styles.sectionPad}>
            <Text style={styles.sectionLabel}>Available Shifts</Text>
            {(!dayCfg || dayCfg?.off || shiftCards.length === 0) ? (
              <View style={calRowStyles.offDay}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>🚫</Text>
                <Text style={{ color: "#F87171", fontWeight: "700", fontSize: 13 }}>Doctor is off on this day</Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {shiftCards.map(shift => {
                  const booked = tokenCounts[shift.id] ?? 0;
                  const fillPct = Math.min(Math.round((booked / shift.maxTokens) * 100), 100);
                  const isSelected = selectedShiftId === shift.id;
                  const isFull = booked >= shift.maxTokens;
                  const fillColor = fillPct >= 80 ? "#EF4444" : fillPct >= 60 ? "#F59E0B" : "#22C55E";
                  return (
                    <Pressable
                      key={shift.id}
                      style={[styles.shiftCard, isSelected && styles.shiftCardSelected, isFull && styles.shiftCardFull]}
                      onPress={() => !isFull && setSelectedShiftId(shift.id)}
                      disabled={isFull}
                    >
                      <View style={styles.shiftCardTop}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <View style={[styles.shiftIcon, { backgroundColor: shift.color + "22" }]}>
                            <Feather name={shift.icon} size={14} color={shift.color} />
                          </View>
                          <View>
                            <Text style={[styles.shiftLabel, { color: shift.color }]}>{shift.label} Shift</Text>
                            <Text style={styles.shiftTime}>{shift.startTime} – {shift.endTime}</Text>
                          </View>
                        </View>
                        <View style={{ alignItems: "flex-end", gap: 4 }}>
                          {isSelected && <Feather name="check-circle" size={18} color="#4F46E5" />}
                          {isFull && <Text style={styles.fullTag}>Full</Text>}
                          {!isSelected && !isFull && <View style={styles.radioEmpty} />}
                        </View>
                      </View>
                      <View style={{ gap: 4 }}>
                        <View style={styles.fillBarTrack}>
                          <View style={[styles.fillBarFill, { width: pct(fillPct), backgroundColor: fillColor }]} />
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          {queueLoading
                            ? <Text style={styles.fillBarLbl}>Loading…</Text>
                            : <Text style={styles.fillBarLbl}>{booked}/{shift.maxTokens} booked</Text>}
                          <Text style={[styles.fillBarPct, { color: fillColor }]}>{fillPct}% full</Text>
                        </View>
                      </View>
                      <View style={styles.shiftMeta}>
                        <Feather name="home" size={10} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.shiftMetaTxt} numberOfLines={1}>
                          {shift.clinicName}{shift.address ? ` · ${shift.address}` : ""}
                        </Text>
                        {shift.locationLink ? (
                          <Pressable style={styles.mapsBtn} onPress={() => Linking.openURL(shift.locationLink)}>
                            <Feather name="navigation" size={10} color="#4285F4" />
                            <Text style={styles.mapsBtnTxt}>Maps</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Family Member */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Booking For</Text>
          <View style={{ gap: 8 }}>
            {family.map(m => {
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
                        { icon: "phone" as const,    label: "Phone",       val: m.phone },
                        { icon: "droplet" as const,  label: "Blood Group", val: m.blood },
                        { icon: "user" as const,     label: "Gender",      val: m.gender },
                        { icon: "calendar" as const, label: "Age",         val: `${m.age} years` },
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

        {/* Live Queue Preview — real from Firebase */}
        <View style={styles.sectionPad}>
          <View style={styles.queuePreviewCard}>
            <View style={styles.queuePreviewHeader}>
              <View style={styles.livePip} />
              <Text style={styles.queuePreviewTitle}>Live Queue Preview</Text>
              {queueLoading
                ? <ActivityIndicator size="small" color="#22C55E" style={{ marginLeft: "auto" }} />
                : <Text style={styles.queuePreviewSub}>{liveQueue.length} in queue</Text>}
            </View>
            {liveQueue.length === 0 && !queueLoading ? (
              <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center", paddingVertical: 12 }}>No tokens booked yet for this date</Text>
            ) : (
              liveQueue.map(q => (
                <View key={q.id} style={styles.queueRow}>
                  <Text style={styles.queueRowNum}>#{q.tokenNumber}</Text>
                  <Text style={styles.queueRowName} numberOfLines={1}>{q.patientName}</Text>
                  <View style={[styles.queueTypeBadge, { backgroundColor: (TYPE_COLOR[q.type] ?? "#FFF") + "18", borderColor: (TYPE_COLOR[q.type] ?? "#FFF") + "35" }]}>
                    <Text style={[styles.queueTypeTxt, { color: TYPE_COLOR[q.type] ?? "#FFF" }]}>{q.type}</Text>
                  </View>
                  <Text style={[styles.queueStatus, q.status === "in_consult" ? { color: "#4ADE80" } : { color: "rgba(255,255,255,0.3)" }]}>
                    {q.status === "in_consult" ? "Active" : "Waiting"}
                  </Text>
                </View>
              ))
            )}
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

const calRowStyles = StyleSheet.create({
  monthLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 6, marginBottom: 2, paddingHorizontal: 2 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendTxt: { fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: "600" },
  offDay: { paddingVertical: 24, alignItems: "center", gap: 4 },
});

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

  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)" },
  toggleBtnActive: { backgroundColor: "rgba(79,70,229,0.3)", borderColor: "rgba(99,102,241,0.6)" },
  toggleTxt: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.4)" },
  toggleTxtActive: { color: "#FFF" },

  feePreviewCard: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 12, gap: 8 },
  feePreviewRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  feePreviewLbl: { flex: 1, fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: "500" },
  feePreviewVal: { fontSize: 13, fontWeight: "700" },
  feePreviewNote: { fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 4 },

  calHeader: { flexDirection: "row", marginBottom: 4 },
  calDow: { flex: 1, textAlign: "center", fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: { width: pct(100 / 7), aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  calCellSelected: { backgroundColor: "#4F46E5", borderRadius: 12, borderWidth: 0 },
  calCellToday: { backgroundColor: "rgba(79,70,229,0.2)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(99,102,241,0.4)" },
  calCellPast: { opacity: 0.3 },
  calCellTxt: { fontSize: 13, fontWeight: "600", color: "#FFF" },
  calCellTxtSelected: { fontWeight: "800" },
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
