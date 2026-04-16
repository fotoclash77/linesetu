import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getListDoctorsQueryOptions } from "@workspace/api-client-react";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";

const ACCENT_COLORS = ["#EF4444", "#3B82F6", "#8B5CF6", "#22C55E", "#F97316", "#EC4899", "#06B6D4", "#F59E0B"];

interface DoctorItem {
  id: string;
  name: string;
  specialty: string;
  clinicName: string;
  rating: string;
  wait: string;
  token: number;
  exp: string;
  patients: string;
  photo: string;
  accent: string;
  isAvailable?: boolean;
  locations?: { district: string; state: string }[];
}


const sortStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#141826", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12, maxHeight: "80%" },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "800", color: "#FFF", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: "500", marginTop: 2 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  optionActive: { backgroundColor: "rgba(99,102,241,0.18)", borderColor: "rgba(99,102,241,0.5)" },
  optionIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.12)", alignItems: "center", justifyContent: "center" },
  optionIconActive: { backgroundColor: "#4F46E5" },
  optionLabel: { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  optionDesc: { fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#4F46E5", alignItems: "center", justifyContent: "center" },
});

function DoctorListCard({ doc }: { doc: DoctorItem }) {
  const available = doc.isAvailable !== false;
  const navToDoctor = () => router.push({
    pathname: `/doctor/${doc.id}` as any,
    params: { hint_name: doc.name, hint_photo: doc.photo, hint_spec: doc.specialty, hint_clinic: doc.clinicName },
  });
  return (
    <Pressable
      style={({ pressed }) => [styles.listCard, { opacity: pressed ? 0.88 : 1 }]}
      onPress={navToDoctor}
    >
      <Image
        source={{ uri: doc.photo }}
        style={[styles.listPhoto, { borderColor: doc.accent + "55", opacity: available ? 1 : 0.55 }]}
        contentFit="cover"
      />
      <View style={styles.listInfo}>
        <View style={styles.listNameRow}>
          <Text style={styles.listName} numberOfLines={1}>{doc.name.startsWith("Dr") ? doc.name : `Dr. ${doc.name}`}</Text>
          {available ? (
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={11} color="#06B6D4" />
              <Text style={styles.verifiedTxt}>Verified</Text>
            </View>
          ) : (
            <View style={styles.unavailBadge}>
              <Feather name="slash" size={9} color="#EF4444" />
              <Text style={styles.unavailBadgeTxt}>Unavailable</Text>
            </View>
          )}
        </View>

        <View style={[styles.specChip, { backgroundColor: doc.accent + "18" }]}>
          <Text style={[styles.specChipTxt, { color: doc.accent }]}>{doc.specialty}</Text>
        </View>

        {!!(doc.locations?.length) && (
          <View style={{ gap: 2, marginBottom: 2 }}>
            {doc.locations.map((loc, i) => (
              <View key={i} style={styles.locationRow}>
                <Feather name="map-pin" size={9} color="rgba(255,255,255,0.3)" />
                <Text style={styles.locationTxt} numberOfLines={1}>
                  {[loc.district, loc.state].filter(Boolean).join(", ")}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.listStats}>
          <View style={styles.listStat}>
            <Feather name="briefcase" size={10} color="rgba(255,255,255,0.4)" />
            <Text style={styles.listStatTxt}>{doc.exp}</Text>
          </View>
          <View style={styles.listStatDot} />
          <View style={styles.listStat}>
            <Feather name="users" size={10} color="rgba(255,255,255,0.4)" />
            <Text style={styles.listStatTxt}>{doc.patients}</Text>
          </View>
        </View>
      </View>

      <View style={styles.listRight}>
        {available ? (
          <View style={{ height: 28 }} />
        ) : (
          <View style={styles.unavailWaitBadge}>
            <Text style={styles.unavailWaitTxt}>Offline</Text>
          </View>
        )}
        <Pressable
          disabled={!available}
          style={[styles.getTokenBtn, { backgroundColor: available ? doc.accent : "rgba(255,255,255,0.07)" }]}
          onPress={() => available && navToDoctor()}
        >
          <Text style={[styles.getTokenTxt, !available && { color: "rgba(255,255,255,0.3)" }]}>
            {available ? "Book" : "N/A"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function FindDoctorsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ specialty?: string }>();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 20 + 64;

  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState(params.specialty ?? "All");

  type SortKey = "default" | "name_az" | "name_za" | "wait" | "experience" | "patients" | "available";
  const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ComponentProps<typeof Feather>["name"]; desc: string }[] = [
    { key: "default", label: "Recommended", icon: "trending-up", desc: "Best match for you" },
    { key: "name_az", label: "Name (A → Z)", icon: "arrow-down", desc: "Alphabetical order" },
    { key: "name_za", label: "Name (Z → A)", icon: "arrow-up", desc: "Reverse alphabetical" },
    { key: "wait", label: "Shortest Wait", icon: "clock", desc: "Least wait time first" },
    { key: "experience", label: "Most Experienced", icon: "award", desc: "Years of experience" },
    { key: "patients", label: "Most Patients", icon: "users", desc: "Patient count" },
    { key: "available", label: "Available First", icon: "check-circle", desc: "Online doctors first" },
  ];
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [showSortModal, setShowSortModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: doctorsData, isLoading } = useQuery(getListDoctorsQueryOptions());

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

  const apiDoctors: DoctorItem[] = (doctorsData?.doctors ?? [])
    .filter((d: any) => {
      const fb = fbDoctorMap.get(d.id);
      if (!fb) return fbDoctorMap.size === 0;
      return fb.isActive && fb.isApproved && !fb.isDeleted;
    })
    .map((d: any, i: number) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialization,
    clinicName: d.clinicName ?? "Clinic",
    accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
    rating: "4.8",
    wait: d.estimatedWaitMins != null || d.waitMinutes != null || d.waitMins != null
      ? formatWait(Number(d.estimatedWaitMins ?? d.waitMinutes ?? d.waitMins))
      : "—",
    token: Math.floor(Math.random() * 50) + 1,
    exp: d.experience != null ? `${d.experience} yrs` : "—",
    patients: d.totalPatients != null ? `${d.totalPatients}+` : "—",
    locations: (() => { const cs = (d as any).clinics; if (!Array.isArray(cs)) return []; const actives = cs.filter((c: any) => c.active && c.name?.trim() && (c.state || c.district)); return actives.length ? actives.map((c: any) => ({ district: c.district || '', state: c.state || '' })) : (cs[0] && (cs[0].state || cs[0].district) ? [{ district: cs[0].district || '', state: cs[0].state || '' }] : []); })(),
    photo: fbDoctorMap.get(d.id)?.photo || d.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name ?? "D")}&background=4F46E5&color=fff`,
    isAvailable: d.isAvailable !== false,
  }));

  const allDoctors = apiDoctors;

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

  const specialtyChips = useMemo(() => {
    const chips: { label: string; color: string }[] = [{ label: "All", color: "#818CF8" }];
    fbSpecList.forEach((s, i) => {
      chips.push({ label: s, color: ACCENT_COLORS[i % ACCENT_COLORS.length] });
    });
    return chips;
  }, [fbSpecList]);

  const filtered = useMemo(() => {
    const list = allDoctors.filter((d) => {
      const matchSpec = selectedSpec === "All" || d.specialty.toLowerCase() === selectedSpec.toLowerCase();
      const matchSearch = !search.trim() ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase()) ||
        d.clinicName.toLowerCase().includes(search.toLowerCase());
      return matchSpec && matchSearch;
    });

    const parseNum = (v: string) => {
      const n = parseFloat(v.replace(/[^0-9.]/g, ""));
      return isNaN(n) ? 0 : n;
    };

    switch (sortKey) {
      case "name_az":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case "name_za":
        return [...list].sort((a, b) => b.name.localeCompare(a.name));
      case "wait":
        return [...list].sort((a, b) => parseNum(a.wait) - parseNum(b.wait));
      case "experience":
        return [...list].sort((a, b) => parseNum(b.exp) - parseNum(a.exp));
      case "patients":
        return [...list].sort((a, b) => parseNum(b.patients) - parseNum(a.patients));
      case "available":
        return [...list].sort((a, b) => (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0));
      default:
        return list;
    }
  }, [allDoctors, selectedSpec, search, sortKey]);

  const currentSortOption = SORT_OPTIONS.find(o => o.key === sortKey) ?? SORT_OPTIONS[0];

  const openSort = () => {
    setShowSortModal(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };
  const closeSort = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setShowSortModal(false);
    });
  };
  const pickSort = (key: SortKey) => {
    setSortKey(key);
    closeSort();
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color="#FFF" />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Find Doctors</Text>
          <Text style={styles.headerSub}>{filtered.length} available near you</Text>
        </View>
        <Pressable style={[styles.filterBtn, sortKey !== "default" && { borderColor: "rgba(99,102,241,0.7)", backgroundColor: "rgba(99,102,241,0.22)" }]} onPress={openSort}>
          <Feather name="sliders" size={17} color={sortKey !== "default" ? "#A5B4FC" : "#818CF8"} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#818CF8" style={{ marginLeft: 14 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, clinics, specialties…"
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")} style={{ paddingRight: 14 }}>
              <Feather name="x" size={15} color="rgba(255,255,255,0.4)" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Specialty Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        {specialtyChips.map(({ label, color }) => {
          const isActive = selectedSpec === label;
          return (
            <Pressable
              key={label}
              style={[
                styles.chip,
                isActive && { backgroundColor: color + "22", borderColor: color + "66" },
              ]}
              onPress={() => setSelectedSpec(label)}
            >
              {isActive && (
                <View style={[styles.chipDot, { backgroundColor: color }]} />
              )}
              <Text style={[styles.chipTxt, isActive && { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.listContainer, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section label */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {search ? "Search Results" : "Recommended for You"}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#818CF8" size="large" />
            <Text style={styles.loadingTxt}>Finding doctors near you…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Feather name="user-x" size={28} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={styles.emptyTitle}>No doctors found</Text>
            <Text style={styles.emptySub}>Try a different search or specialty</Text>
          </View>
        ) : (
          filtered.map((doc) => <DoctorListCard key={doc.id} doc={doc} />)
        )}
      </ScrollView>

      {showSortModal && (
        <Modal transparent visible animationType="none" onRequestClose={closeSort}>
          <Pressable style={sortStyles.overlay} onPress={closeSort}>
            <Animated.View style={[sortStyles.sheet, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View style={sortStyles.handle} />
                <Text style={sortStyles.title}>Sort Doctors</Text>
                <Text style={sortStyles.subtitle}>Choose how to order the list</Text>
                <View style={{ gap: 6, marginTop: 16 }}>
                  {SORT_OPTIONS.map(opt => {
                    const isActive = sortKey === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        style={[sortStyles.option, isActive && sortStyles.optionActive]}
                        onPress={() => pickSort(opt.key)}
                      >
                        <View style={[sortStyles.optionIcon, isActive && sortStyles.optionIconActive]}>
                          <Feather name={opt.icon} size={15} color={isActive ? "#FFF" : "#818CF8"} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[sortStyles.optionLabel, isActive && { color: "#FFF" }]}>{opt.label}</Text>
                          <Text style={sortStyles.optionDesc}>{opt.desc}</Text>
                        </View>
                        {isActive && (
                          <View style={sortStyles.checkCircle}>
                            <Feather name="check" size={12} color="#FFF" />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.18)" },
  orb2: { position: "absolute", top: 300, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.12)" },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", alignItems: "center", justifyContent: "center" },
  headerTitleWrap: { flex: 1, paddingHorizontal: 14 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFF", letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.38)", fontWeight: "500", marginTop: 1 },
  filterBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.12)", borderWidth: 1, borderColor: "rgba(99,102,241,0.3)", alignItems: "center", justifyContent: "center" },

  searchWrap: { paddingHorizontal: 16, marginBottom: 14 },
  searchBar: { flexDirection: "row", alignItems: "center", height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1.5, borderColor: "rgba(99,102,241,0.3)" },
  searchInput: { flex: 1, fontSize: 14, color: "#FFF", paddingHorizontal: 10, fontWeight: "500" },

  chipsScroll: { flexGrow: 0, marginBottom: 16 },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipTxt: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.5)" },

  resultsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  resultsTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortTxt: { fontSize: 12, fontWeight: "600", color: "#818CF8" },

  listContainer: { paddingHorizontal: 16 },

  listCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20, padding: 14, marginBottom: 12,
  },
  listPhoto: { width: 70, height: 70, borderRadius: 14, borderWidth: 2, marginRight: 12 },
  listInfo: { flex: 1 },
  listNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  listName: { fontSize: 14, fontWeight: "800", color: "#FFF", flexShrink: 1 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(6,182,212,0.12)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedTxt: { fontSize: 9, fontWeight: "700", color: "#06B6D4" },
  specChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 5 },
  specChipTxt: { fontSize: 10, fontWeight: "600" },
  listClinicRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  listClinicTxt: { fontSize: 11, color: "rgba(255,255,255,0.38)", flex: 1 },
  listStats: { flexDirection: "row", alignItems: "center", gap: 6 },
  listStat: { flexDirection: "row", alignItems: "center", gap: 3 },
  listStatTxt: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.55)" },
  listStatDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.15)" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  locationTxt: { fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: "500", flexShrink: 1 },

  listRight: { alignItems: "center", gap: 10, marginLeft: 10 },
  liveWaitBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(34,197,94,0.1)", borderWidth: 1, borderColor: "rgba(34,197,94,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  greenPulse: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#22C55E" },
  liveWaitTxt: { fontSize: 10, fontWeight: "700", color: "#4ADE80" },
  unavailWaitBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  unavailWaitTxt: { fontSize: 10, fontWeight: "700", color: "#F87171" },
  unavailBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(239,68,68,0.12)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  unavailBadgeTxt: { fontSize: 9, fontWeight: "700", color: "#F87171" },
  getTokenBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  getTokenTxt: { fontSize: 12, fontWeight: "700", color: "#FFF" },

  loadingWrap: { alignItems: "center", paddingTop: 60, gap: 14 },
  loadingTxt: { fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: "500" },

  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.5)" },
  emptySub: { fontSize: 13, color: "rgba(255,255,255,0.25)", fontWeight: "500" },
});
