import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import type { Href } from "expo-router";
import React, { useState } from "react";
import {
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

const FAMILY_MEMBERS = [
  { id: "wife", name: "Priya Sharma", relation: "Wife", age: 29, blood: "A+", phone: "+91 9876543211", avatar: "https://randomuser.me/api/portraits/women/26.jpg", color: "#EC4899" },
  { id: "mother", name: "Sunita Sharma", relation: "Mother", age: 58, blood: "O+", phone: "+91 9876543212", avatar: "https://randomuser.me/api/portraits/women/55.jpg", color: "#F59E0B" },
  { id: "father", name: "Ramesh Sharma", relation: "Father", age: 62, blood: "B+", phone: "+91 9876543213", avatar: "https://randomuser.me/api/portraits/men/58.jpg", color: "#10B981" },
];

type MenuItem = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  sub: string;
  color: string;
  route: string | null;
  badge: string | null;
  liveIndicator: boolean;
  danger: boolean;
};

type MenuSection = { title: string; items: MenuItem[] };

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Bookings & Activity",
    items: [
      { icon: "calendar",  label: "My Bookings",   sub: "Tokens, visits & history",        color: "#6366F1", route: "/(tabs)/bookings", badge: null,    liveIndicator: false, danger: false },
      { icon: "activity",  label: "Live Queue",     sub: "Track active token in real-time", color: "#22C55E", route: null,               badge: null,    liveIndicator: true,  danger: false },
      { icon: "clock",     label: "Visit History",  sub: "Past consultations & summaries",  color: "#06B6D4", route: null,               badge: null,    liveIndicator: false, danger: false },
    ],
  },
  {
    title: "Family Management",
    items: [
      { icon: "users",     label: "Manage Family",  sub: "Spouse, parents, children",       color: "#EC4899", route: null,               badge: null,    liveIndicator: false, danger: false },
      { icon: "user-plus", label: "Add Member",     sub: "Add a new family member",          color: "#10B981", route: null,               badge: null,    liveIndicator: false, danger: false },
    ],
  },
  {
    title: "💳 Payments & Transactions",
    items: [
      { icon: "credit-card", label: "Payment History", sub: "Receipts & transaction records", color: "#67E8F9", route: null,             badge: null,    liveIndicator: false, danger: false },
      { icon: "file-text",   label: "Fee Structure",   sub: "Platform & consultation fees",   color: "#F59E0B", route: null,             badge: null,    liveIndicator: false, danger: false },
    ],
  },
  {
    title: "Settings & Preferences",
    items: [
      { icon: "bell",     label: "Notifications",    sub: "Token alerts & appointment reminders", color: "#F59E0B", route: null,          badge: "3",     liveIndicator: false, danger: false },
      { icon: "sliders",  label: "Preferences",      sub: "Language, queue alerts, SMS options",   color: "#A5B4FC", route: null,          badge: null,    liveIndicator: false, danger: false },
    ],
  },
  {
    title: "App & Support",
    items: [
      { icon: "help-circle",    label: "Help & FAQ",       sub: "How queues, tokens & payments work", color: "#22C55E", route: null,       badge: null,    liveIndicator: false, danger: false },
      { icon: "message-circle", label: "Contact Support",  sub: "Chat or raise a ticket",              color: "#06B6D4", route: null,       badge: null,    liveIndicator: false, danger: false },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: "log-out", label: "Sign Out",        sub: "Log out of your account",              color: "#F59E0B", route: null,             badge: null,    liveIndicator: false, danger: false },
      { icon: "trash-2", label: "Delete Account",  sub: "Permanently remove all data",           color: "#EF4444", route: null,             badge: null,    liveIndicator: false, danger: true  },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { patient, logout } = useAuth();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 64;
  const [showFamily, setShowFamily] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  const name = patient?.name ?? "Rahul Sharma";
  const phone = patient?.phone ?? "+91 98765 43210";
  const joined = "Member since Jan 2025";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const stats = [
    { label: "Bookings", value: "14", color: "#A5B4FC" },
    { label: "Active", value: "1", color: "#4ADE80" },
    { label: "Family", value: "4", color: "#67E8F9" },
    { label: "Pending", value: "2", color: "#F59E0B" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable style={styles.headerIconBtn}>
            <Feather name="edit-3" size={16} color="rgba(255,255,255,0.6)" />
          </Pressable>
          <Pressable style={styles.headerIconBtn}>
            <Feather name="bell" size={16} color="rgba(255,255,255,0.6)" />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCardWrap}>
          <LinearGradient
            colors={["rgba(99,102,241,0.45)", "rgba(6,182,212,0.22)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userCard}
          >
            <View style={styles.cardGlowOrb} />
            <View style={styles.userCardRow}>
              <View style={{ position: "relative" }}>
                {avatarError ? (
                  <View style={[styles.userAvatarPhoto, styles.userAvatarInitials]}>
                    <Text style={styles.initialsText}>{initials}</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: patient?.profilePhoto ?? `https://randomuser.me/api/portraits/men/1.jpg` }}
                    style={styles.userAvatarPhoto}
                    contentFit="cover"
                    onError={() => setAvatarError(true)}
                  />
                )}
                <Pressable style={styles.cameraBtn}>
                  <Feather name="camera" size={11} color="#FFF" />
                </Pressable>
                <View style={styles.onlineIndicator} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{name}</Text>
                <View style={styles.phoneRow}>
                  <Feather name="phone" size={11} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.phoneText}>{phone}</Text>
                </View>
                <View style={styles.memberSince}>
                  <Feather name="shield" size={10} color="#4ADE80" />
                  <Text style={styles.memberSinceTxt}>{joined}</Text>
                </View>
              </View>
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={12} color="#4F46E5" />
                <Text style={styles.verifiedTxt}>Verified</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {stats.map((s, i) => (
                <View key={s.label} style={[styles.statPill, i < stats.length - 1 && styles.statPillDivider]}>
                  <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLbl}>{s.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Family Members */}
        <View style={styles.familySection}>
          <Pressable style={styles.familyHeader} onPress={() => setShowFamily(p => !p)}>
            <Feather name="users" size={14} color="#818CF8" />
            <Text style={styles.familyTitle}>Family Members</Text>
            <View style={styles.familyBadge}>
              <Text style={styles.familyBadgeTxt}>{FAMILY_MEMBERS.length + 1}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Pressable style={styles.addMemberBtn}>
              <Feather name="plus" size={12} color="#22C55E" />
              <Text style={styles.addMemberTxt}>Add</Text>
            </Pressable>
            <Feather name={showFamily ? "chevron-up" : "chevron-down"} size={15} color="rgba(255,255,255,0.35)" />
          </Pressable>

          {showFamily && (
            <View style={styles.familyList}>
              {/* Self */}
              <View style={styles.familyCard}>
                <LinearGradient
                  colors={["#4F46E5", "#06B6D4"]}
                  style={styles.familyCardAvatar}
                >
                  <Text style={styles.familyAvatarTxt}>{initials}</Text>
                </LinearGradient>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.familyCardName}>{name}</Text>
                    <View style={styles.selfBadge}><Text style={styles.selfBadgeTxt}>Self</Text></View>
                  </View>
                  <Text style={styles.familyCardSub}>32 yrs · O+ · {phone}</Text>
                </View>
                <Feather name="edit-3" size={13} color="rgba(255,255,255,0.3)" />
              </View>
              {FAMILY_MEMBERS.map(m => (
                <View key={m.id} style={styles.familyCard}>
                  <Image source={{ uri: m.avatar }} style={[styles.familyCardImgAvatar, { borderColor: m.color + "50" }]} contentFit="cover" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={styles.familyCardName}>{m.name}</Text>
                      <View style={[styles.relationBadge, { backgroundColor: m.color + "18" }]}>
                        <Text style={[styles.relationBadgeTxt, { color: m.color }]}>{m.relation}</Text>
                      </View>
                    </View>
                    <Text style={styles.familyCardSub}>{m.age} yrs · {m.blood} · {m.phone}</Text>
                  </View>
                  <Pressable>
                    <Feather name="trash-2" size={13} color="rgba(239,68,68,0.5)" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={[styles.menuCard, section.title === "Danger Zone" && styles.dangerCard]}>
              {section.items.map((item, i) => {
                const isDanger = item.danger;
                return (
                  <Pressable
                    key={item.label}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                      i < section.items.length - 1 && styles.menuItemBorder,
                    ]}
                    onPress={() => {
                      if (item.label === "Sign Out") { logout(); return; }
                      if (item.route) router.push(item.route as Href);
                    }}
                  >
                    <View style={[styles.menuIconBubble, { backgroundColor: item.color + "18", borderColor: item.color + "30" }]}>
                      <Feather name={item.icon} size={16} color={item.color} />
                    </View>
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text style={[styles.menuLabel, isDanger && { color: item.color }]}>{item.label}</Text>
                      <Text style={styles.menuSub}>{item.sub}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {item.liveIndicator && (
                        <View style={styles.livePip}>
                          <View style={styles.livePipDot} />
                          <Text style={styles.livePipTxt}>LIVE</Text>
                        </View>
                      )}
                      {item.badge && (
                        <View style={[styles.menuBadge, { backgroundColor: item.color + "25" }]}>
                          <Text style={[styles.menuBadgeTxt, { color: item.color }]}>{item.badge}</Text>
                        </View>
                      )}
                      {!isDanger && (
                        <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.2)" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Feather name="shield" size={11} color="rgba(255,255,255,0.18)" />
          <Text style={styles.footerTxt}>LINESETU v2.0 · Your health, your queue</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.2)" },
  orb2: { position: "absolute", top: 300, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(6,182,212,0.1)" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  headerIconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: 6, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#0A0E1A" },

  userCardWrap: { paddingHorizontal: 20, marginBottom: 20 },
  userCard: { borderRadius: 24, padding: 18, borderWidth: 1.5, borderColor: "rgba(99,102,241,0.35)", overflow: "hidden" },
  cardGlowOrb: { position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.05)" },
  userCardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  userAvatar: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  userAvatarTxt: { fontSize: 20, fontWeight: "800", color: "#FFF" },
  userAvatarPhoto: { width: 64, height: 64, borderRadius: 20, borderWidth: 2, borderColor: "rgba(99,102,241,0.45)" },
  userAvatarInitials: { backgroundColor: "rgba(79,70,229,0.35)", alignItems: "center", justifyContent: "center" },
  initialsText: { fontSize: 22, fontWeight: "700", color: "#A5B4FC", letterSpacing: 1 },
  cameraBtn: { position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: 8, backgroundColor: "#4F46E5", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#0A0E1A" },
  onlineIndicator: { position: "absolute", top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: "#22C55E", borderWidth: 2, borderColor: "#0A0E1A", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  userName: { fontSize: 18, fontWeight: "900", color: "#FFF", letterSpacing: -0.3 },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  phoneText: { fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: "600" },
  memberSince: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  memberSinceTxt: { fontSize: 10, color: "#4ADE80", fontWeight: "600" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, backgroundColor: "rgba(79,70,229,0.3)", borderWidth: 1, borderColor: "rgba(99,102,241,0.5)" },
  verifiedTxt: { fontSize: 9, fontWeight: "700", color: "#A5B4FC" },
  statsRow: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  statPill: { flex: 1, alignItems: "center", paddingVertical: 10 },
  statPillDivider: { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.07)" },
  statVal: { fontSize: 18, fontWeight: "900", lineHeight: 22 },
  statLbl: { fontSize: 9, fontWeight: "600", color: "rgba(255,255,255,0.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },

  familySection: { paddingHorizontal: 20, marginBottom: 20 },
  familyHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  familyTitle: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  familyBadge: { backgroundColor: "rgba(129,140,248,0.25)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  familyBadgeTxt: { fontSize: 11, fontWeight: "800", color: "#818CF8" },
  addMemberBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(34,197,94,0.12)", borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  addMemberTxt: { fontSize: 11, fontWeight: "700", color: "#22C55E" },
  familyList: { gap: 6 },
  familyCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  familyCardAvatar: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  familyAvatarTxt: { fontSize: 14, fontWeight: "800", color: "#FFF" },
  familyCardImgAvatar: { width: 38, height: 38, borderRadius: 12, borderWidth: 2 },
  familyCardName: { fontSize: 13, fontWeight: "800", color: "#FFF" },
  selfBadge: { backgroundColor: "rgba(99,102,241,0.2)", borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  selfBadgeTxt: { fontSize: 8, fontWeight: "700", color: "#818CF8" },
  familyCardSub: { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  relationBadge: { borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  relationBadgeTxt: { fontSize: 8, fontWeight: "700" },

  menuSection: { paddingHorizontal: 20, marginBottom: 16 },
  menuSectionTitle: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  menuCard: { borderRadius: 20, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)" },
  dangerCard: { borderColor: "rgba(239,68,68,0.2)" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, paddingHorizontal: 16 },
  menuItemPressed: { backgroundColor: "rgba(255,255,255,0.04)" },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  menuIconBubble: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  menuLabel: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  menuSub: { fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: "500" },
  livePip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(34,197,94,0.15)", borderWidth: 1, borderColor: "rgba(34,197,94,0.35)" },
  livePipDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#22C55E", shadowColor: "#22C55E", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 3 },
  livePipTxt: { fontSize: 8, fontWeight: "800", color: "#4ADE80", letterSpacing: 0.8 },
  menuBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  menuBadgeTxt: { fontSize: 10, fontWeight: "800" },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 10, paddingTop: 6 },
  footerTxt: { fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: "500" },
});
