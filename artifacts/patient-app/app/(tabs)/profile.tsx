import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { patient, logout } = useAuth();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 64;

  const handleLogout = () => {
    if (Platform.OS === "web") {
      logout().then(() => router.replace("/login"));
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => logout().then(() => router.replace("/login")) },
      ]);
    }
  };

  const sections = [
    {
      title: "Account",
      items: [
        { icon: "user" as const, label: "Edit Profile", arrow: true },
        { icon: "users" as const, label: "Family Members", arrow: true },
        { icon: "file-text" as const, label: "Health Records", arrow: true },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: "bell" as const, label: "Notifications", arrow: true },
        { icon: "map-pin" as const, label: "Saved Locations", arrow: true },
        { icon: "shield" as const, label: "Privacy & Security", arrow: true },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "help-circle" as const, label: "Help Centre", arrow: true },
        { icon: "star" as const, label: "Rate LINESETU", arrow: true },
        { icon: "info" as const, label: "About", arrow: true },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* Avatar section */}
        <View style={[styles.avatarSection, { paddingTop: topPad + 20 }]}>
          <LinearGradient colors={["#4F46E5", "#06B6D4"]} style={styles.avatarLarge}>
            <Text style={styles.avatarLargeTxt}>{(patient?.name?.[0] ?? "P").toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.profileName}>{patient?.name ?? "Patient"}</Text>
          <Text style={styles.profilePhone}>{patient?.phone ?? ""}</Text>
          <View style={styles.memberBadge}>
            <Feather name="star" size={10} color="#F59E0B" />
            <Text style={styles.memberBadgeTxt}>Premium Member</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: "Tokens", value: "12" },
            { label: "Doctors", value: "4" },
            { label: "Saved", value: "₹480" },
          ].map(({ label, value }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={styles.statDiv} />}
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{value}</Text>
                <Text style={styles.statLbl}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Menu sections */}
        <View style={{ paddingHorizontal: 20, gap: 20, marginTop: 8 }}>
          {sections.map((section) => (
            <View key={section.title}>
              <Text style={styles.sectionLabel}>{section.title}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, idx) => (
                  <Pressable
                    key={item.label}
                    style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                  >
                    <View style={styles.menuIconBox}>
                      <Feather name={item.icon} size={16} color="#818CF8" />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.25)" />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* Logout */}
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={16} color="#EF4444" />
            <Text style={styles.logoutTxt}>Log Out</Text>
          </Pressable>

          <Text style={styles.version}>LINESETU v1.0.0 · Made with ❤️ in India</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: {
    position: "absolute", top: -40, right: -60, width: 220, height: 220,
    borderRadius: 110, backgroundColor: "rgba(6,182,212,0.16)",
  },
  avatarSection: { alignItems: "center", paddingBottom: 20, paddingHorizontal: 20 },
  avatarLarge: {
    width: 88, height: 88, borderRadius: 26,
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  avatarLargeTxt: { fontSize: 36, fontWeight: "800", color: "#FFF" },
  profileName: { fontSize: 22, fontWeight: "800", color: "#FFF", marginBottom: 4 },
  profilePhone: { fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 10 },
  memberBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(245,158,11,0.15)",
    borderWidth: 1, borderColor: "rgba(245,158,11,0.3)",
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  memberBadgeTxt: { fontSize: 11, fontWeight: "700", color: "#FCD34D" },
  statsRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18, paddingVertical: 14,
  },
  statDiv: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.08)" },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statVal: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: "500" },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 },
  menuCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18, overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(99,102,241,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.85)" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1, borderColor: "rgba(239,68,68,0.25)",
    borderRadius: 16, paddingVertical: 14,
  },
  logoutTxt: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  version: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", paddingBottom: 8 },
});
