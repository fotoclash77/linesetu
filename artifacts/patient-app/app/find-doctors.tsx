import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { INDIA_STATES } from "@/constants/indiaLocations";
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
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  photo: string | null;
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
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 },
  locBtn: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  locBtnActive: { backgroundColor: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.45)" },
  locBtnTxt: { flex: 1, fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.5)" },
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
      {doc.photo ? (
        <Image
          source={{ uri: doc.photo }}
          style={[styles.listPhoto, { borderColor: doc.accent + "55", opacity: available ? 1 : 0.55 }]}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.listPhoto, { borderColor: doc.accent + "66", backgroundColor: doc.accent + "18", opacity: available ? 1 : 0.55, alignItems: "center", justifyContent: "center" }]}>
          <InitialsAvatar name={doc.name} size={44} color={doc.accent} />
        </View>
      )}
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
            {available ? "Get Token" : "N/A"}
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
  const [filterState, setFilterState] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [showLocPicker, setShowLocPicker] = useState<"state" | "district" | null>(null);
  const [locSearch, setLocSearch] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: doctorsData, isLoading } = useQuery({
    ...getListDoctorsQueryOptions(),
    refetchInterval: 5_000,
    staleTime: 0,
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
    photo: fbDoctorMap.get(d.id)?.photo || d.profilePhoto || null,
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
    const fs = filterState.toLowerCase().trim();
    const fd = filterDistrict.toLowerCase().trim();
    const list = allDoctors.filter((d) => {
      const matchSpec = selectedSpec === "All" || d.specialty.toLowerCase() === selectedSpec.toLowerCase();
      const matchSearch = !search.trim() ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase()) ||
        d.clinicName.toLowerCase().includes(search.toLowerCase());
      const matchState = !fs || d.locations?.some(l => l.state.toLowerCase().trim() === fs);
      const matchDistrict = !fd || d.locations?.some(l => l.district.toLowerCase().trim() === fd);
      return matchSpec && matchSearch && matchState && matchDistrict;
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
  }, [allDoctors, selectedSpec, search, sortKey, filterState, filterDistrict]);

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
        <Pressable
          style={[styles.filterBtn, (sortKey !== "default" || filterState || filterDistrict) && { borderColor: "rgba(99,102,241,0.7)", backgroundColor: "rgba(99,102,241,0.22)" }]}
          onPress={openSort}
        >
          <Feather name="sliders" size={17} color={(sortKey !== "default" || filterState || filterDistrict) ? "#A5B4FC" : "#818CF8"} />
          {(filterState || filterDistrict) && (
            <View style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#818CF8" }} />
          )}
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
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <View style={sortStyles.handle} />
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={sortStyles.title}>Sort & Filter</Text>
                    {(filterState || filterDistrict) && (
                      <TouchableOpacity
                        onPress={() => { setFilterState(""); setFilterDistrict(""); }}
                        style={{ backgroundColor: "rgba(239,68,68,0.12)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" }}
                      >
                        <Text style={{ color: "#F87171", fontSize: 11, fontWeight: "700" }}>Clear Filters</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={sortStyles.subtitle}>Sort and filter doctors</Text>

                  {/* Location Filter */}
                  <Text style={[sortStyles.sectionLabel, { marginTop: 16 }]}>Filter by Location</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                    {/* State picker */}
                    <TouchableOpacity
                      style={[sortStyles.locBtn, filterState && sortStyles.locBtnActive]}
                      onPress={() => { setLocSearch(""); setShowLocPicker("state"); }}
                    >
                      <Feather name="map-pin" size={12} color={filterState ? "#A5B4FC" : "rgba(255,255,255,0.4)"} />
                      <Text style={[sortStyles.locBtnTxt, filterState && { color: "#A5B4FC" }]} numberOfLines={1}>
                        {filterState || "State"}
                      </Text>
                      <Feather name="chevron-down" size={11} color={filterState ? "#A5B4FC" : "rgba(255,255,255,0.3)"} />
                    </TouchableOpacity>
                    {/* District picker */}
                    <TouchableOpacity
                      style={[sortStyles.locBtn, filterDistrict && sortStyles.locBtnActive, !filterState && { opacity: 0.45 }]}
                      onPress={() => { if (!filterState) return; setLocSearch(""); setShowLocPicker("district"); }}
                    >
                      <Feather name="navigation" size={12} color={filterDistrict ? "#A5B4FC" : "rgba(255,255,255,0.4)"} />
                      <Text style={[sortStyles.locBtnTxt, filterDistrict && { color: "#A5B4FC" }]} numberOfLines={1}>
                        {filterDistrict || (filterState ? "District" : "State first")}
                      </Text>
                      <Feather name="chevron-down" size={11} color={filterDistrict ? "#A5B4FC" : "rgba(255,255,255,0.3)"} />
                    </TouchableOpacity>
                  </View>

                  {/* Sort options */}
                  <Text style={sortStyles.sectionLabel}>Sort by</Text>
                  <View style={{ gap: 6, marginTop: 8 }}>
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
                </ScrollView>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      )}

      {/* Location Picker Sub-Modal */}
      {showLocPicker && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setShowLocPicker(null)}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" }}
            activeOpacity={1}
            onPress={() => setShowLocPicker(null)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ backgroundColor: "#0D1321", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", width: 310, maxHeight: 500, overflow: "hidden" }}
            >
              <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: "#818CF8", fontWeight: "900", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {showLocPicker === "state" ? "Select State / UT" : `Districts — ${filterState}`}
                </Text>
                <TouchableOpacity onPress={() => setShowLocPicker(null)}>
                  <Feather name="x" size={16} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
                <TextInput
                  style={{ height: 36, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 10, paddingHorizontal: 12, color: "#FFF", fontSize: 13, fontWeight: "500" }}
                  placeholder={showLocPicker === "state" ? "Search state..." : "Search district..."}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={locSearch}
                  onChangeText={setLocSearch}
                  autoFocus
                />
              </View>
              <FlatList
                data={(() => {
                  if (showLocPicker === "state") {
                    const list = INDIA_STATES.map(s => s.name);
                    return locSearch ? list.filter(n => n.toLowerCase().includes(locSearch.toLowerCase())) : list;
                  } else {
                    const districts = INDIA_STATES.find(s => s.name === filterState)?.districts ?? [];
                    return locSearch ? districts.filter(d => d.toLowerCase().includes(locSearch.toLowerCase())) : districts;
                  }
                })()}
                keyExtractor={item => item}
                renderItem={({ item }) => {
                  const isSelected = showLocPicker === "state" ? item === filterState : item === filterDistrict;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (showLocPicker === "state") {
                          setFilterState(item);
                          setFilterDistrict("");
                        } else {
                          setFilterDistrict(item);
                        }
                        setShowLocPicker(null);
                        setLocSearch("");
                      }}
                      style={{ paddingHorizontal: 16, paddingVertical: 13, backgroundColor: isSelected ? "rgba(99,102,241,0.15)" : "transparent", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" }}
                    >
                      <Text style={{ color: isSelected ? "#A5B4FC" : "rgba(255,255,255,0.75)", fontWeight: isSelected ? "800" : "500", fontSize: 14 }}>{item}</Text>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={<Text style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 20, fontSize: 13 }}>No results</Text>}
                keyboardShouldPersistTaps="handled"
              />
            </TouchableOpacity>
          </TouchableOpacity>
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
