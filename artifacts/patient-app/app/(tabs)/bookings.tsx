import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { Image } from "expo-image";
import { router } from "expo-router";
import { usePatientNotifs } from "@/contexts/PatientNotifsContext";
import { useQuery } from "@tanstack/react-query";
import { getGetPatientTokensQueryOptions, getListDoctorsQueryOptions } from "@workspace/api-client-react";
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

const isWeb = Platform.OS === "web";

const ACCENT_POOL = ["#6366F1","#EC4899","#F59E0B","#10B981","#06B6D4","#8B5CF6","#EF4444","#F97316"];

type FilterTab = "all" | "active" | "upcoming" | "past";

interface TokenItem {
  id: string;
  doctorId?: string;
  doctorName?: string;
  tokenNumber: number;
  status: "waiting" | "in_consult" | "done" | "cancelled" | "upcoming";
  bookedAt?: string;
  shiftLabel?: string;
  queuePosition?: number;
}

interface BookingItem extends TokenItem {
  memberId: string;
  doctor: string;
  doctorPhoto: string;
  specialty: string;
  clinicName?: string;
  clinicLoc?: string;
  date: string;
  shift: string;
  time?: string;
  shiftTime?: string;
  visitType?: "first" | "followup";
  tokenType?: "normal" | "emergency";
  ahead?: number;
  patientPaid: number;
  amount?: number;
  consultFee: number;
  doctorEarns?: number;
  platformFee?: number;
  clinicConsultFee?: number;
  walkinFee?: number;
  payAtClinic?: number;
  totalVisitCost?: number;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  waiting:    { label: "Active",    color: "#4ADE80", bg: "rgba(34,197,94,0.18)",   border: "rgba(34,197,94,0.4)"   },
  in_consult: { label: "Active",    color: "#4ADE80", bg: "rgba(34,197,94,0.18)",   border: "rgba(34,197,94,0.4)"   },
  upcoming:   { label: "Upcoming",  color: "#67E8F9", bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.35)"  },
  done:       { label: "Completed", color: "#A5B4FC", bg: "rgba(99,102,241,0.14)",  border: "rgba(99,102,241,0.3)"  },
  cancelled:  { label: "Skipped",   color: "#F59E0B", bg: "rgba(245,158,11,0.14)",  border: "rgba(245,158,11,0.3)"  },
};

interface MemberItem {
  id: string; name: string; relation: string; age: number; avatar: string; color: string;
}

function MemberDropdown({ selected, members, onSelect }: { selected: MemberItem; members: MemberItem[]; onSelect: (m: MemberItem) => void }) {
  const [open, setOpen] = useState(false);
  const isAll = selected.id === "all";

  return (
    <View style={{ zIndex: 100 }}>
      <Pressable
        style={[styles.dropdownBtn, open && styles.dropdownBtnOpen]}
        onPress={() => setOpen(p => !p)}
      >
        {isAll ? (
          <View style={styles.dropdownAllIcon}>
            <Feather name="users" size={15} color="#A5B4FC" />
          </View>
        ) : (
          <Image source={{ uri: selected.avatar }} style={[styles.dropdownAvatar, { borderColor: selected.color + "60" }]} contentFit="cover" />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.dropdownName}>{selected.name}</Text>
          {!isAll && <Text style={styles.dropdownSub}>{selected.relation} · {selected.age} yrs</Text>}
        </View>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color="rgba(255,255,255,0.4)" />
      </Pressable>

      {open && (
        <View style={styles.dropdownMenu}>
          {members.map((m, i) => {
            const isSelected = m.id === selected.id;
            const hasAvatar = m.id !== "all";
            return (
              <Pressable
                key={m.id}
                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected, i < members.length - 1 && styles.dropdownItemBorder]}
                onPress={() => { onSelect(m); setOpen(false); }}
              >
                {hasAvatar ? (
                  <Image source={{ uri: m.avatar }} style={[styles.dropdownItemAvatar, { borderColor: m.color + "50" }]} contentFit="cover" />
                ) : (
                  <View style={styles.dropdownAllIcon}>
                    <Feather name="users" size={14} color="#A5B4FC" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dropdownItemName, isSelected && { color: "#A5B4FC" }]}>{m.name}</Text>
                  {hasAvatar && <Text style={styles.dropdownItemSub}>{m.relation} · {m.age} yrs</Text>}
                </View>
                {isSelected && <View style={styles.selectedDot} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function SummaryStrip({ bookings }: { bookings: BookingItem[] }) {
  const active = bookings.filter(b => b.status === "waiting" || b.status === "in_consult").length;
  const upcoming = bookings.filter(b => b.status === "upcoming").length;
  const done = bookings.filter(b => b.status === "done").length;
  const skipped = bookings.filter(b => b.status === "cancelled").length;

  const tiles = [
    { label: "Active", value: active, color: "#4ADE80", bg: "rgba(34,197,94,0.12)" },
    { label: "Upcoming", value: upcoming, color: "#67E8F9", bg: "rgba(6,182,212,0.12)" },
    { label: "Done", value: done, color: "#A5B4FC", bg: "rgba(99,102,241,0.12)" },
    { label: "Skipped", value: skipped, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  ];

  return (
    <View style={styles.summaryStrip}>
      {tiles.map(t => (
        <View key={t.label} style={[styles.summaryTile, { backgroundColor: t.bg, borderColor: t.color + "25" }]}>
          <Text style={[styles.summaryVal, { color: t.color }]}>{t.value}</Text>
          <Text style={styles.summaryLbl}>{t.label}</Text>
        </View>
      ))}
    </View>
  );
}

const MEMBER_ALL: MemberItem = { id: "all", name: "All Members", relation: "", age: 0, avatar: "", color: "#A5B4FC" };
const MEMBER_SELF_DEFAULT: MemberItem = { id: "self", name: "Self", relation: "Self", age: 0, avatar: "", color: "#6366F1" };

function BookingCard({ booking, members, showMember }: { booking: BookingItem; members: MemberItem[]; showMember: boolean }) {
  const cfg = STATUS_CFG[booking.status] ?? STATUS_CFG.waiting;
  const isActive = booking.status === "waiting" || booking.status === "in_consult";
  const isSkipped = booking.status === "cancelled";
  const member = members.find(m => m.id === booking.memberId) ?? MEMBER_SELF_DEFAULT;
  const waitMin = booking.ahead != null ? Math.round(booking.ahead * 2.5) : null;

  return (
    <View style={[styles.bookingCard, isActive && styles.bookingCardActive, isSkipped && { opacity: 0.72 }]}>
      {showMember && (
        <View style={[styles.memberTag, { backgroundColor: member.color + "10", borderBottomColor: "rgba(255,255,255,0.05)" }]}>
          {member.id !== "all" && member.avatar ? (
            <Image source={{ uri: member.avatar }} style={styles.memberTagAvatar} contentFit="cover" />
          ) : null}
          <Text style={[styles.memberTagName, { color: member.color }]}>{member.name}</Text>
          {member.relation ? <Text style={styles.memberTagRel}>· {member.relation}</Text> : null}
        </View>
      )}

      <View style={styles.bookingCardTop}>
        <View style={{ position: "relative" }}>
          <Image source={{ uri: booking.doctorPhoto }} style={[styles.bookingDocPhoto, { borderColor: isActive ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)" }]} contentFit="cover" />
          {isActive && <View style={styles.activePhotoDot} />}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={[styles.bookingDocName, isSkipped && { color: "rgba(255,255,255,0.5)" }]} numberOfLines={1}>{booking.doctor}</Text>
            <Feather name="check-circle" size={11} color="#4F46E5" />
          </View>
          <Text style={styles.bookingSpecialty}>{booking.specialty}</Text>
          <View style={[styles.visitTypeBadge, { backgroundColor: booking.visitType === "first" ? "rgba(99,102,241,0.2)" : "rgba(16,185,129,0.2)" }]}>
            <Text style={[styles.visitTypeTxt, { color: booking.visitType === "first" ? "#A5B4FC" : "#6EE7B7" }]}>{booking.visitType === "first" ? "First Visit" : "Follow-up"}</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            {isActive && <View style={[styles.statusDot, { shadowColor: "#22C55E" }]} />}
            <Text style={[styles.statusTxt, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Feather name="tag" size={9} color={isActive ? "#A5B4FC" : "rgba(255,255,255,0.3)"} />
            <Text style={[styles.tokenNumTxt, { color: isActive ? "#A5B4FC" : "rgba(255,255,255,0.45)" }]}>#{booking.tokenNumber}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingCardBody}>
        <View style={[styles.tokenBlock, isActive && styles.tokenBlockActive]}>
          <Text style={styles.tokenBlockLbl}>Token</Text>
          <Text style={[styles.tokenBlockNum, { color: isActive ? "#FFF" : isSkipped ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.65)" }]}>#{booking.tokenNumber}</Text>
          {isActive && <Text style={styles.tokenBlockYours}>YOURS</Text>}
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Feather name="calendar" size={11} color="rgba(255,255,255,0.3)" />
            <Text style={styles.bookingInfoTxt}>{booking.date}</Text>
            <View style={styles.shiftChip}>
              <Feather name={booking.shift === "morning" ? "sun" : "moon"} size={9} color="#F59E0B" />
              <Text style={styles.shiftChipTxt}>{booking.shift === "morning" ? "Morning" : "Evening"}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Feather name="clock" size={11} color="rgba(255,255,255,0.25)" />
            <Text style={styles.bookingSubTxt}>{booking.time}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Feather name="home" size={11} color="rgba(255,255,255,0.25)" />
            <Text style={styles.bookingSubTxt} numberOfLines={1}>{booking.clinicName} · {booking.clinicLoc}</Text>
          </View>
          {isActive && booking.ahead != null && (
            <View style={{ flexDirection: "row", gap: 6 }}>
              <View style={styles.aheadChip}>
                <Text style={styles.aheadChipTxt}>{booking.ahead} ahead</Text>
              </View>
              <View style={styles.waitChip}>
                <Feather name="clock" size={9} color="#F59E0B" />
                <Text style={styles.waitChipTxt}>~{waitMin} min</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.paymentRow}>
        <View style={styles.paymentPaidGroup}>
          <Feather name="check-circle" size={10} color="#4ADE80" />
          <Text style={styles.paymentTxt}>₹{booking.patientPaid} paid</Text>
        </View>
        {(booking.payAtClinic ?? booking.consultFee) > 0 && (
          <>
            <Text style={styles.paymentDot}>·</Text>
            <View style={styles.paymentClinicGroup}>
              <Feather name="home" size={10} color="#F59E0B" />
              <Text style={styles.paymentAtClinic}>₹{booking.payAtClinic ?? booking.consultFee} at clinic</Text>
            </View>
          </>
        )}
        <Text style={styles.paymentDot}>·</Text>
        <Text style={styles.paymentTotal}>₹{booking.totalVisitCost ?? (booking.patientPaid + (booking.payAtClinic ?? booking.consultFee))} total</Text>
      </View>

      <View style={styles.cardCta}>
        {isActive ? (
          <Pressable
            style={styles.viewQueueCta}
            onPress={() => router.push(`/queue/${booking.id}`)}
          >
            <Feather name="activity" size={13} color="#FFF" />
            <Text style={styles.viewQueueCtaTxt}>View Live Queue</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.viewDetailCta}>
            <Text style={styles.viewDetailCtaTxt}>View Details</Text>
            <Feather name="arrow-right" size={11} color="rgba(255,255,255,0.5)" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const { unreadCount } = usePatientNotifs();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 64;

  const [selectedMember, setSelectedMember] = useState<MemberItem>(MEMBER_ALL);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [members, setMembers] = useState<MemberItem[]>([MEMBER_ALL]);

  // Load family members from AsyncStorage
  React.useEffect(() => {
    import("@react-native-async-storage/async-storage").then(({ default: AS }) => {
      AS.getItem("linesetu_family").then(raw => {
        try {
          const family: any[] = raw ? JSON.parse(raw) : [];
          const selfMember: MemberItem = {
            id: "self", name: (patient as any)?.name ?? "Self",
            relation: "Self", age: 0, avatar: (patient as any)?.photo ?? "", color: "#6366F1",
          };
          const extras: MemberItem[] = family.map((f: any, i: number) => ({
            id: f.id ?? `member_${i}`, name: f.name ?? "Member",
            relation: f.relation ?? "Family", age: f.age ?? 0,
            avatar: f.photo ?? "", color: ACCENT_POOL[i % ACCENT_POOL.length],
          }));
          setMembers([MEMBER_ALL, selfMember, ...extras]);
        } catch { /* ignore */ }
      }).catch(() => {});
    });
  }, [patient?.id]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    ...getGetPatientTokensQueryOptions(patient?.id ?? ""),
    enabled: !!patient?.id,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });

  const { data: doctorsData } = useQuery({
    ...getListDoctorsQueryOptions(),
    staleTime: 5 * 60 * 1000,
  });
  const doctorById = React.useMemo(() => {
    const m = new Map<string, any>();
    (doctorsData?.doctors ?? []).forEach((d: any) => m.set(d.id, d));
    return m;
  }, [doctorsData]);

  // Real-time doctor photo map from Firebase
  const [fbPhotoMap, setFbPhotoMap] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "doctors"), (snap) => {
      const map = new Map<string, string>();
      snap.forEach((d) => {
        const photo = d.data()?.profilePhoto;
        if (photo) map.set(d.id, photo);
      });
      setFbPhotoMap(map);
    });
    return () => unsub();
  }, []);

  const apiTokens = data?.tokens ?? [];

  const BOOKING_STATUSES = new Set<BookingItem["status"]>(["waiting", "in_consult", "done", "cancelled", "upcoming"]);
  const allBookings: BookingItem[] = apiTokens.map((t: any) => {
    const doc = doctorById.get(t.doctorId);
    return {
      id: t.id,
      doctorId: t.doctorId,
      tokenNumber: t.tokenNumber,
      status: BOOKING_STATUSES.has(t.status as BookingItem["status"])
        ? (t.status as BookingItem["status"])
        : "waiting" as const,
      doctor: doc?.name ?? t.doctorName ?? "Doctor",
      doctorPhoto: fbPhotoMap.get(t.doctorId) ?? doc?.profilePhoto ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(doc?.name ?? "D")}&background=4F46E5&color=fff`,
      specialty: doc?.specialization ?? "General",
      clinicName: doc?.clinicName ?? doc?.clinics?.[0]?.name ?? "Clinic",
      clinicLoc: doc?.clinicAddress ?? doc?.clinics?.[0]?.address ?? "",
      date: t.date,
      shift: t.shift,
      time: t.shift === "morning" ? "9:00 AM – 1:00 PM" : "5:00 PM – 9:00 PM",
      visitType: "first" as const,
      memberId: t.memberId ?? "self",
      ahead: t.queuePosition ?? 0,
      patientPaid: t.patientPaid ?? t.amount ?? 20,
      consultFee: t.clinicConsultFee ?? doc?.fee ?? 500,
      doctorEarns: t.doctorEarns,
      platformFee: t.platformFee,
      clinicConsultFee: t.clinicConsultFee,
      walkinFee: t.walkinFee,
      payAtClinic: t.payAtClinic,
      totalVisitCost: t.totalVisitCost,
    };
  });

  const memberBookings = selectedMember.id === "all"
    ? allBookings
    : allBookings.filter((b) => b.memberId === selectedMember.id);

  const filtered = memberBookings.filter((b) => {
    if (filter === "all") return true;
    if (filter === "active") return b.status === "waiting" || b.status === "in_consult";
    if (filter === "upcoming") return b.status === "upcoming";
    return b.status === "done" || b.status === "cancelled";
  });

  const tabCount = (t: FilterTab) => {
    if (t === "all") return memberBookings.length;
    if (t === "active") return memberBookings.filter((b) => b.status === "waiting" || b.status === "in_consult").length;
    if (t === "upcoming") return memberBookings.filter((b) => b.status === "upcoming").length;
    return memberBookings.filter((b) => b.status === "done" || b.status === "cancelled").length;
  };

  const showMember = selectedMember.id === "all";

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSub}>{allBookings.length} appointments · family</Text>
        </View>
        <Pressable style={styles.bellBtn} onPress={() => router.push("/notifications")}>
          <Feather name="bell" size={18} color="rgba(255,255,255,0.7)" />
          {unreadCount > 0 && <View style={styles.bellDot} />}
        </Pressable>
      </View>

      <View style={styles.filterSection}>
        <MemberDropdown selected={selectedMember} members={members} onSelect={setSelectedMember} />

        <View style={styles.filterTabs}>
          {(["all", "active", "upcoming", "past"] as FilterTab[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.filterTab, filter === t && styles.filterTabActive]}
              onPress={() => setFilter(t)}
            >
              <Text style={[styles.filterTabTxt, filter === t && styles.filterTabTxtActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
              <View style={[styles.filterTabBadge, filter === t && styles.filterTabBadgeActive]}>
                <Text style={[styles.filterTabBadgeTxt, filter === t && { color: "#FFF" }]}>{tabCount(t)}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <SummaryStrip bookings={memberBookings} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#818CF8" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#818CF8" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="calendar" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>No bookings here</Text>
            <Text style={styles.emptyBody}>Try a different filter or book your first token</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.push("/(tabs)")}>
              <Text style={styles.emptyBtnTxt}>Find Doctors</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ marginTop: 4 }}>
            {filtered.map((bk) => (
              <BookingCard key={bk.id} booking={bk} members={members} showMember={showMember} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(99,102,241,0.18)" },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 },
  bellBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(79,70,229,0.18)", borderWidth: 1, borderColor: "rgba(99,102,241,0.35)", alignItems: "center", justifyContent: "center" },
  bellIcon: { fontSize: 18 },
  bellDot: { position: "absolute", top: 7, right: 7, width: 9, height: 9, borderRadius: 4.5, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#0A0E1A" },

  filterSection: { paddingHorizontal: 20, gap: 12, marginBottom: 8 },

  dropdownBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)" },
  dropdownBtnOpen: { borderColor: "rgba(99,102,241,0.5)" },
  dropdownAvatar: { width: 32, height: 32, borderRadius: 10, borderWidth: 2 },
  dropdownAllIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(165,180,252,0.15)", borderWidth: 2, borderColor: "rgba(165,180,252,0.3)", alignItems: "center", justifyContent: "center" },
  dropdownName: { fontSize: 14, fontWeight: "800", color: "#FFF" },
  dropdownSub: { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  dropdownMenu: { backgroundColor: "#111827", borderRadius: 16, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)", overflow: "hidden", marginTop: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.7, shadowRadius: 20, elevation: 20 },
  dropdownItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, paddingHorizontal: 14, backgroundColor: "transparent" },
  dropdownItemSelected: { backgroundColor: "rgba(99,102,241,0.2)" },
  dropdownItemBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  dropdownItemAvatar: { width: 32, height: 32, borderRadius: 10, borderWidth: 2 },
  dropdownItemName: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  dropdownItemSub: { fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 },
  selectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6366F1" },

  filterTabs: { flexDirection: "row", gap: 6 },
  filterTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  filterTabActive: { backgroundColor: "rgba(99,102,241,0.25)", borderColor: "rgba(99,102,241,0.5)" },
  filterTabTxt: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)" },
  filterTabTxtActive: { color: "#A5B4FC" },
  filterTabBadge: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  filterTabBadgeActive: { backgroundColor: "rgba(99,102,241,0.5)" },
  filterTabBadgeTxt: { fontSize: 9, fontWeight: "800", color: "rgba(255,255,255,0.5)" },

  summaryStrip: { flexDirection: "row", gap: 6 },
  summaryTile: { flex: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 6, alignItems: "center", borderWidth: 1 },
  summaryVal: { fontSize: 22, fontWeight: "900", lineHeight: 24 },
  summaryLbl: { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.4)", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.6 },

  bookingCard: {
    borderRadius: 20, marginBottom: 10, overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)",
  },
  bookingCardActive: {
    backgroundColor: "rgba(34,197,94,0.07)",
    borderColor: "rgba(34,197,94,0.3)",
    shadowColor: "rgba(34,197,94,0.2)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 6,
  },
  memberTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1 },
  memberTagAvatar: { width: 18, height: 18, borderRadius: 6 },
  memberTagName: { fontSize: 10, fontWeight: "700" },
  memberTagRel: { fontSize: 9, color: "rgba(255,255,255,0.3)" },

  bookingCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  bookingDocPhoto: { width: 44, height: 44, borderRadius: 14, borderWidth: 2 },
  activePhotoDot: { position: "absolute", bottom: -2, right: -2, width: 11, height: 11, borderRadius: 5.5, backgroundColor: "#22C55E", borderWidth: 2, borderColor: "#0A0E1A", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  bookingDocName: { fontSize: 13, fontWeight: "800", color: "#FFF", flex: 1 },
  bookingSpecialty: { fontSize: 10, color: "rgba(103,232,249,0.8)", fontWeight: "600", marginTop: 2 },
  visitTypeBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4 },
  visitTypeTxt: { fontSize: 9, fontWeight: "700" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  statusTxt: { fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  tokenNumTxt: { fontSize: 12, fontWeight: "900" },

  bookingCardBody: { flexDirection: "row", gap: 8, padding: 10, paddingHorizontal: 14 },
  tokenBlock: { width: 60, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.07)" },
  tokenBlockActive: { backgroundColor: "rgba(99,102,241,0.3)", borderColor: "rgba(99,102,241,0.5)", shadowColor: "rgba(99,102,241,0.3)", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 4 },
  tokenBlockLbl: { fontSize: 7, fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.6 },
  tokenBlockNum: { fontSize: 22, fontWeight: "900", lineHeight: 25, letterSpacing: -1 },
  tokenBlockYours: { fontSize: 7, fontWeight: "700", color: "rgba(165,180,252,0.8)", marginTop: 2 },

  bookingInfoTxt: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.75)" },
  shiftChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, backgroundColor: "rgba(245,158,11,0.12)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" },
  shiftChipTxt: { fontSize: 9, fontWeight: "700", color: "#FCD34D" },
  bookingSubTxt: { fontSize: 11, color: "rgba(255,255,255,0.45)" },
  aheadChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  aheadChipTxt: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  waitChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(245,158,11,0.12)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" },
  waitChipTxt: { fontSize: 10, fontWeight: "700", color: "#FCD34D" },

  paymentRow: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 14, marginBottom: 0, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", flexWrap: "wrap" },
  paymentPaidGroup: { flexDirection: "row", alignItems: "center", gap: 4 },
  paymentClinicGroup: { flexDirection: "row", alignItems: "center", gap: 4 },
  paymentTxt: { fontSize: 10, fontWeight: "700", color: "#4ADE80" },
  paymentDot: { color: "rgba(255,255,255,0.15)", fontSize: 10 },
  paymentAtClinic: { fontSize: 10, color: "#F59E0B", fontWeight: "600" },
  paymentTotal: { fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: "700" },

  cardCta: { padding: 10, paddingHorizontal: 14, paddingTop: 8 },
  viewQueueCta: { height: 38, borderRadius: 12, backgroundColor: "#16A34A", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, shadowColor: "rgba(34,197,94,0.35)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 6 },
  viewQueueCtaTxt: { fontSize: 12, fontWeight: "800", color: "#FFF" },
  viewDetailCta: { height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  viewDetailCtaTxt: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.5)" },

  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  emptyBody: { fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" },
  emptyBtn: { marginTop: 8, backgroundColor: "rgba(99,102,241,0.2)", borderWidth: 1, borderColor: "rgba(99,102,241,0.4)", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnTxt: { fontSize: 14, fontWeight: "700", color: "#818CF8" },
});
