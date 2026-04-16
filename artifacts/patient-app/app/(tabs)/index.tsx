import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { pct } from "@/constants/design";
import { AnimatedRing } from "@/components/AnimatedRing";
import { useQuery } from "@tanstack/react-query";
import { getListDoctorsQueryOptions, getGetPatientTokensQueryOptions } from "@workspace/api-client-react";
import React, { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import { usePatientNotifs } from "@/contexts/PatientNotifsContext";

const isWeb = Platform.OS === "web";

const SPEC_META: Record<string, { icon: React.ComponentProps<typeof Feather>["name"]; color: string }> = {
  cardiology:    { icon: "heart",        color: "#EF4444" },
  cardiologist:  { icon: "heart",        color: "#EF4444" },
  dentist:       { icon: "smile",        color: "#3B82F6" },
  dental:        { icon: "smile",        color: "#3B82F6" },
  "eye care":    { icon: "eye",          color: "#06B6D4" },
  ophthalmology: { icon: "eye",          color: "#06B6D4" },
  pediatric:     { icon: "activity",     color: "#22C55E" },
  pediatrics:    { icon: "activity",     color: "#22C55E" },
  neurology:     { icon: "cpu",          color: "#8B5CF6" },
  neurologist:   { icon: "cpu",          color: "#8B5CF6" },
  orthopedic:    { icon: "anchor",       color: "#F97316" },
  orthopedics:   { icon: "anchor",       color: "#F97316" },
  ent:           { icon: "mic",          color: "#EC4899" },
  general:       { icon: "thermometer",  color: "#F59E0B" },
  dermatology:   { icon: "sun",          color: "#A855F7" },
  dermatologist: { icon: "sun",          color: "#A855F7" },
  gynecology:    { icon: "user",         color: "#EC4899" },
  gynecologist:  { icon: "user",         color: "#EC4899" },
  psychiatry:    { icon: "message-circle", color: "#6366F1" },
  psychiatrist:  { icon: "message-circle", color: "#6366F1" },
  urology:       { icon: "shield",       color: "#14B8A6" },
  urologist:     { icon: "shield",       color: "#14B8A6" },
  gastroenterology: { icon: "clipboard", color: "#F97316" },
  gastroenterologist: { icon: "clipboard", color: "#F97316" },
  pulmonologist: { icon: "wind",         color: "#0EA5E9" },
  pulmonology:   { icon: "wind",         color: "#0EA5E9" },
  endocrinologist: { icon: "trending-up", color: "#D946EF" },
  endocrinology: { icon: "trending-up",  color: "#D946EF" },
  nephrologist:  { icon: "droplet",      color: "#0891B2" },
  nephrology:    { icon: "droplet",      color: "#0891B2" },
  oncologist:    { icon: "target",       color: "#DC2626" },
  oncology:      { icon: "target",       color: "#DC2626" },
  rheumatologist: { icon: "move",        color: "#7C3AED" },
  rheumatology:  { icon: "move",         color: "#7C3AED" },
  "plastic surgeon": { icon: "scissors", color: "#F472B6" },
  "general surgeon": { icon: "tool",     color: "#059669" },
  "orthopedic surgeon": { icon: "anchor", color: "#F97316" },
  "ent specialist": { icon: "mic",       color: "#EC4899" },
  "general physician": { icon: "thermometer", color: "#F59E0B" },
  ophthalmologist: { icon: "eye",        color: "#06B6D4" },
  pediatrician:  { icon: "activity",     color: "#22C55E" },
};
const SPEC_COLOR_POOL = ["#EF4444","#3B82F6","#06B6D4","#22C55E","#8B5CF6","#F97316","#EC4899","#F59E0B","#A855F7","#14B8A6"];


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
  isAvailable?: boolean;
}

function formatWait(mins: number) {
  if (!Number.isFinite(mins) || mins <= 0) return "~0 min";
  if (mins < 60) return `~${Math.round(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m ? `~${h}h ${m}m` : `~${h}h`;
}

function DoctorCard({ doc }: { doc: DoctorItem }) {
  const { accent } = doc;
  const available = doc.isAvailable !== false;
  const showWait = !!doc.wait && doc.wait !== "~";
  const navToDoctor = () => router.push({
    pathname: `/doctor/${doc.id}` as any,
    params: { hint_name: doc.name, hint_photo: doc.photo, hint_spec: doc.specialty, hint_clinic: doc.clinicName },
  });
  return (
    <Pressable
      testID={`doctor-card-${doc.id}`}
      style={({ pressed }) => [styles.docCard, { borderColor: accent + "28", opacity: pressed ? 0.85 : 1 }]}
      onPress={navToDoctor}
    >
      <View style={{ position: "relative", marginBottom: 10 }}>
        <Image
          source={{ uri: doc.photo }}
          style={[styles.docPhoto, { borderColor: accent + "55", opacity: available ? 1 : 0.6 }]}
          contentFit="cover"
        />
        <View style={styles.photoBadgeWrap}>
          <View style={styles.verifiedBadge}>
            <Feather name="check-circle" size={9} color="#06B6D4" />
            <Text style={styles.verifiedTxt}>Verified</Text>
          </View>
        </View>
        {!available && (
          <View style={styles.unavailOverlay}>
            <Text style={styles.unavailOverlayTxt}>Unavailable</Text>
          </View>
        )}
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
      </View>
      <View style={[styles.specBadge, { backgroundColor: accent + "18" }]}>
        <Text style={[styles.specText, { color: accent }]}>{doc.specialty}</Text>
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

      {available && showWait ? (
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTxt}>Token #{doc.token} Live</Text>
          <Text style={styles.waitSmall}>~{doc.wait}</Text>
        </View>
      ) : !available ? (
        <View style={styles.unavailRow}>
          <Feather name="slash" size={9} color="#EF4444" />
          <Text style={styles.unavailTxt}>Not accepting patients</Text>
        </View>
      ) : (
        <View style={styles.unavailRow}>
          <Feather name="clock" size={9} color="#F59E0B" />
          <Text style={styles.unavailTxt}>Live queue is yet not started</Text>
        </View>
      )}

      <Pressable
        disabled={!available}
        style={[styles.bookBtn, { backgroundColor: available ? accent : "rgba(255,255,255,0.08)", shadowColor: available ? accent : "transparent" }]}
        onPress={() => available && navToDoctor()}
      >
        <Text style={[styles.bookBtnTxt, !available && { color: "rgba(255,255,255,0.3)" }]}>
          {available ? "Get Token" : "Unavailable"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

interface TokenItem {
  id: string;
  doctorId: string;
  doctorName?: string;
  specialty?: string;
  tokenNumber: number;
  status: "waiting" | "in_consult" | "done" | "cancelled" | "upcoming";
  bookedAt?: string;
  shiftLabel?: string;
  queuePosition?: number;
}

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

async function fetchQueuePosition(doctorId: string, tokenId: string) {
  const res = await fetch(`${BASE_URL}/api/queues/${doctorId}/position/${tokenId}`);
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<{
    tokenNumber: number; currentToken: number; position: number;
    estimatedWaitMins: number; status: string; totalWaiting: number;
  }>;
}

function LiveQueueCard({ token, doctorName }: { token: TokenItem | undefined; doctorName: string }) {
  const { data: pos, isLoading: posLoading } = useQuery({
    queryKey: ["queue-pos", token?.doctorId, token?.id],
    queryFn: () => fetchQueuePosition(token!.doctorId, token!.id),
    enabled: !!token?.id && !!token?.doctorId,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const myToken      = token?.tokenNumber ?? 0;
  const currentToken = pos?.currentToken ?? 0;
  const waitMin      = pos?.estimatedWaitMins ?? 0;
  const ahead        = pos?.position ?? Math.max(0, myToken - currentToken);
  const queueStarted = currentToken > 0;
  const progressPct  = myToken > 0 && currentToken > 0
    ? Math.min(100, Math.round((currentToken / myToken) * 100)) : 0;

  if (!token) {
    return (
      <View style={[styles.liveQueueCard, { alignItems: "center", justifyContent: "center", paddingVertical: 28 }]}>
        <Feather name="activity" size={28} color="rgba(255,255,255,0.4)" style={{ marginBottom: 8 }} />
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" }}>No active token</Text>
        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4 }}>Book a token to track your queue</Text>
      </View>
    );
  }

  return (
    <View style={styles.liveQueueCard}>
      <View style={styles.liveQueueHeader}>
        <View style={[styles.greenDot, !queueStarted && { backgroundColor: "#FCD34D" }]} />
        <Text style={styles.liveQueueLbl}>Live Queue</Text>
        {!queueStarted && (
          <View style={{ marginLeft: 6, backgroundColor: "rgba(252,211,77,0.12)", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(252,211,77,0.3)" }}>
            <Text style={{ fontSize: 9, fontWeight: "700", color: "#FCD34D" }}>Queue not started yet</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <View style={styles.liveQueueDocChip}>
          <Feather name="radio" size={10} color="#818CF8" />
          <Text style={styles.liveQueueDocTxt} numberOfLines={1}>{doctorName || "Your Doctor"}</Text>
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
        <View style={[styles.queueStatBox, { backgroundColor: queueStarted ? "rgba(6,182,212,0.12)" : "rgba(252,211,77,0.06)", borderColor: queueStarted ? "rgba(6,182,212,0.3)" : "rgba(252,211,77,0.2)", overflow: "visible" }]}>
          {queueStarted && <AnimatedRing size={54} color="#06B6D4" pulses={2} />}
          <View style={styles.queueStatHeader}>
            <Feather name="radio" size={9} color={queueStarted ? "#06B6D4" : "#FCD34D"} />
            <Text style={styles.queueStatLblTxt}>CURRENT</Text>
          </View>
          {posLoading && !pos ? (
            <ActivityIndicator size="small" color="#67E8F9" style={{ marginVertical: 4 }} />
          ) : (
            <Text style={[styles.queueStatNum, { color: queueStarted ? "#67E8F9" : "#FCD34D", fontSize: queueStarted ? 28 : 13 }]}>
              {queueStarted ? currentToken : "Waiting"}
            </Text>
          )}
          <Text style={styles.queueStatSub}>{queueStarted ? "Being served" : "to start"}</Text>
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
          <Text style={styles.liveProgressLbl}>
            {queueStarted ? `${ahead} tokens ahead of you` : `${ahead} tokens in queue · waiting for doctor`}
          </Text>
          <Text style={styles.liveProgressRight}>{token.specialty ?? "OPD"}</Text>
        </View>
        <View style={styles.progressTrack}>
          {queueStarted ? (
            <View style={[styles.progressFill, { width: pct(progressPct) }]} />
          ) : (
            <View style={[styles.progressFill, { width: pct(10), backgroundColor: "#FCD34D", opacity: 0.5 }]} />
          )}
        </View>
      </View>

      <Pressable style={styles.viewQueueBtn} onPress={() => router.push(`/queue/${token.id}` as any)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text style={styles.viewQueueBtnTxt}>View Full Queue</Text>
          <Feather name="arrow-right" size={13} color="#FFF" />
        </View>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const { unreadCount } = usePatientNotifs();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 64;

  const { data: doctorsData, isLoading } = useQuery(getListDoctorsQueryOptions());
  const { data: tokenData } = useQuery({
    ...getGetPatientTokensQueryOptions(patient?.id ?? ""),
    enabled: !!patient?.id,
  });

  const [fbDoctorMap, setFbDoctorMap] = useState<Map<string, { photo: string; isActive: boolean; isApproved: boolean; isDeleted: boolean }>>(new Map());
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "doctors"), (snap) => {
      const map = new Map<string, { photo: string; isActive: boolean; isApproved: boolean; isDeleted: boolean }>();
      snap.forEach((d) => {
        const data = d.data() ?? {};
        map.set(d.id, {
          photo: data.profilePhoto || "",
          isActive: data.isActive !== false,
          isApproved: data.isApproved !== false,
          isDeleted: !!data.isDeleted,
        });
      });
      setFbDoctorMap(map);
    });
    return () => unsub();
  }, []);

  const rawDoctors: any[] = (doctorsData?.doctors ?? []).filter((d: any) => {
    const fb = fbDoctorMap.get(d.id);
    if (!fb) return fbDoctorMap.size === 0;
    return fb.isActive && fb.isApproved && !fb.isDeleted;
  });

  const toDocItem = (d: any, i: number): DoctorItem => ({
    id: d.id,
    name: d.name,
    specialty: d.specialization,
    clinicName: d.clinicName ?? "",
    accent: ["#EF4444", "#3B82F6", "#8B5CF6", "#22C55E"][i % 4],
    rating: "4.8",
    wait: d.estimatedWaitMins != null || d.waitMinutes != null || d.waitMins != null
      ? formatWait(Number(d.estimatedWaitMins ?? d.waitMinutes ?? d.waitMins))
      : "~",
    token: 1,
    exp: d.experience != null ? `${d.experience}` : "",
    patients: d.totalPatients != null ? `${d.totalPatients}+` : "",
    photo: fbDoctorMap.get(d.id)?.photo || d.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name ?? "D")}&background=4F46E5&color=fff`,
    isAvailable: d.isAvailable !== false,
  });

  const patientDistrict = patient?.district?.toLowerCase().trim() ?? "";

  const districtRaw = patientDistrict
    ? rawDoctors.filter((d: any) => {
        const docDistrict = d.district?.toLowerCase().trim();
        if (docDistrict === patientDistrict) return true;
        if (Array.isArray(d.clinics)) {
          return d.clinics.some((c: any) =>
            c.district?.toLowerCase().trim() === patientDistrict && c.active !== false
          );
        }
        return false;
      })
    : [];

  const isDistrictMatch = districtRaw.length > 0;

  const doctors: DoctorItem[] = isDistrictMatch
    ? districtRaw.map(toDocItem)
    : rawDoctors.map(toDocItem);

  const [fbSpecList, setFbSpecList] = useState<string[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appConfig", "specializations"), (snap) => {
      const data = snap.data();
      if (data && Array.isArray(data.list)) {
        setFbSpecList(data.list.filter((s: string) => s !== "Other"));
      }
    });
    return unsub;
  }, []);

  const specialties = useMemo(() => {
    const list = fbSpecList.length > 0 ? fbSpecList.slice(0, 8) : [];
    return list.map((s, i) => {
      const key = s.toLowerCase();
      const meta = SPEC_META[key];
      const color = meta?.color ?? SPEC_COLOR_POOL[i % SPEC_COLOR_POOL.length];
      const icon: React.ComponentProps<typeof Feather>["name"] = meta?.icon ?? "plus-circle";
      return { icon, label: s, color };
    });
  }, [fbSpecList]);

  const VALID_STATUSES = new Set<TokenItem["status"]>(["waiting", "in_consult", "done", "cancelled", "upcoming"]);
  const activeTokens: TokenItem[] = (tokenData?.tokens ?? [])
    .filter((t) => t.status === "waiting" || t.status === "in_consult")
    .map((t) => {
      const matchedDoc = (doctorsData?.doctors ?? []).find((d) => d.id === t.doctorId);
      return {
        id: t.id,
        doctorId: t.doctorId,
        tokenNumber: t.tokenNumber,
        specialty: matchedDoc?.specialization,
        status: VALID_STATUSES.has(t.status as TokenItem["status"])
          ? (t.status as TokenItem["status"])
          : "waiting",
      };
    });
  const activeToken = activeTokens[0];
  const activeDoctor = activeToken
    ? (doctorsData?.doctors ?? []).find((d: any) => d.id === activeToken.doctorId)
    : null;
  const activeDoctorName: string = activeDoctor?.name ?? "";

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
          <Text style={styles.name}>Hello, {firstName}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.bellBtn} onPress={() => router.push("/notifications")}>
            <Feather name="bell" size={18} color="rgba(255,255,255,0.85)" />
            {unreadCount > 0 && <View style={styles.notifDot} />}
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
            { icon: "list" as const, label: "My Queue", color: "#06B6D4", glow: "rgba(6,182,212,0.3)", onPress: () => activeToken?.id ? router.push(`/queue/${activeToken.id}` as any) : router.push("/(tabs)/bookings") },
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
          <LiveQueueCard token={activeToken} doctorName={activeDoctorName} />
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
            <Text style={styles.sectionTitle}>
              {isDistrictMatch && patient?.district
                ? `Doctors in ${patient.district}`
                : "Recommended for You"}
            </Text>
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
            {specialties.length > 0 ? specialties.map(({ icon, label, color }) => (
              <Pressable key={label} style={styles.specItem} onPress={() => router.push({ pathname: "/find-doctors", params: { specialty: label } })}>
                <View style={[styles.specIcon, { backgroundColor: color + "1A" }]}>
                  <Feather name={icon} size={17} color={color} />
                </View>
                <Text style={styles.specItemLabel}>{label}</Text>
              </Pressable>
            )) : (
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", width: "100%", paddingVertical: 16 }}>Loading specialties…</Text>
            )}
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
  bellBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(79,70,229,0.18)", borderWidth: 1, borderColor: "rgba(99,102,241,0.35)", alignItems: "center", justifyContent: "center" },
  bellIcon: { fontSize: 18 },
  notifDot: { position: "absolute", top: 7, right: 7, width: 9, height: 9, borderRadius: 4.5, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#0A0E1A" },
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
  photoBadgeWrap: { position: "absolute", top: 6, right: 14, zIndex: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  docName: { flex: 1, fontSize: 13, fontWeight: "800", color: "#FFF" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "rgba(10,14,26,0.58)", borderRadius: 999, paddingHorizontal: 4, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(6,182,212,0.16)" },
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
  unavailRow: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", borderRadius: 10, padding: 7, marginBottom: 10 },
  unavailTxt: { fontSize: 10, fontWeight: "700", color: "#F87171", flex: 1 },
  unavailOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(10,14,26,0.72)", borderBottomLeftRadius: 14, borderBottomRightRadius: 14, paddingVertical: 4, alignItems: "center" },
  unavailOverlayTxt: { fontSize: 9, fontWeight: "700", color: "#F87171", textTransform: "uppercase", letterSpacing: 0.8 },
  bookBtn: { borderRadius: 12, paddingVertical: 9, alignItems: "center", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  bookBtnTxt: { fontSize: 12, fontWeight: "700", color: "#FFF" },

  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  specItem: { width: "22%", alignItems: "center", gap: 7, padding: 13, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  specIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  specItemLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.55)", textAlign: "center" },
});
