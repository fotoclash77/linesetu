import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientNotifs } from "@/contexts/PatientNotifsContext";

const BASE = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
  return domain ? `https://${domain}` : "";
};

const isWeb = Platform.OS === "web";

type NotifCategory = "all" | "appointments" | "queue" | "offers";

interface Notification {
  id: string;
  type: "appointment" | "queue" | "offer" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: React.ComponentProps<typeof Feather>["name"];
  iconColor: string;
  iconBg: string;
}

const SAMPLE_NOTIFS: Notification[] = [
  {
    id: "1",
    type: "queue",
    title: "Your turn is near!",
    body: "Only 3 patients ahead of you at HeartCare Clinic. Head over now.",
    time: "2 min ago",
    read: false,
    icon: "alert-circle",
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.15)",
  },
  {
    id: "2",
    type: "appointment",
    title: "Appointment Confirmed",
    body: "Dr. Rajesh Sharma has confirmed your booking for today at 11:30 AM.",
    time: "15 min ago",
    read: false,
    icon: "check-circle",
    iconColor: "#22C55E",
    iconBg: "rgba(34,197,94,0.15)",
  },
  {
    id: "3",
    type: "queue",
    title: "Token #47 is now active",
    body: "Your token at Sharma Clinic is now active. You're currently being served.",
    time: "1 hr ago",
    read: false,
    icon: "hash",
    iconColor: "#4F46E5",
    iconBg: "rgba(79,70,229,0.15)",
  },
  {
    id: "4",
    type: "offer",
    title: "Book for just ₹10 today!",
    body: "Platform fee reduced to ₹10 for all online appointments booked before midnight.",
    time: "3 hrs ago",
    read: true,
    icon: "zap",
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.12)",
  },
  {
    id: "5",
    type: "appointment",
    title: "Reminder: Appointment Tomorrow",
    body: "You have an appointment with Dr. Ananya Sharma tomorrow at 10:00 AM.",
    time: "5 hrs ago",
    read: true,
    icon: "calendar",
    iconColor: "#06B6D4",
    iconBg: "rgba(6,182,212,0.15)",
  },
  {
    id: "6",
    type: "system",
    title: "Family member added",
    body: "Priya Sharma (Wife) has been added to your family list successfully.",
    time: "Yesterday",
    read: true,
    icon: "user-plus",
    iconColor: "#22C55E",
    iconBg: "rgba(34,197,94,0.12)",
  },
  {
    id: "7",
    type: "queue",
    title: "Queue Update",
    body: "Dr. Vikram Patel's queue has been reduced. Estimated wait is now 10 min.",
    time: "Yesterday",
    read: true,
    icon: "clock",
    iconColor: "#818CF8",
    iconBg: "rgba(129,140,248,0.15)",
  },
  {
    id: "8",
    type: "appointment",
    title: "Appointment Completed",
    body: "Your visit to NeuroPlus Hospital is marked complete. Rate your experience.",
    time: "2 days ago",
    read: true,
    icon: "star",
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.12)",
  },
];

const FILTERS: Array<{ key: NotifCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "appointments", label: "Appointments" },
  { key: "queue", label: "Queue" },
  { key: "offers", label: "Offers" },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const { patient } = useAuth();
  const { refresh: refreshBell, markAllRead: markAllReadContext } = usePatientNotifs();

  const [filter, setFilter] = useState<NotifCategory>("all");
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFS);
  const [loading, setLoading] = useState(false);

  // Fetch real notifications on mount
  useEffect(() => {
    if (!patient?.id) return;
    setLoading(true);
    fetch(`${BASE()}/api/notifications/patient/${patient.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.notifications?.length) {
          const mapped: Notification[] = data.notifications.map((n: any) => ({
            id: n.id,
            type: n.type === "token_confirmed" ? "appointment" as const
                : n.type === "token_cancelled" ? "appointment" as const
                : "queue" as const,
            title: n.title,
            body: n.body,
            time: relativeTime(n.createdAt),
            read: n.read,
            icon: n.type === "token_confirmed" ? "check-circle" as const
                : n.type === "token_cancelled" ? "x-circle" as const
                : "hash" as const,
            iconColor: n.type === "token_confirmed" ? "#22C55E"
                     : n.type === "token_cancelled" ? "#EF4444"
                     : "#F59E0B",
            iconBg: n.type === "token_confirmed" ? "rgba(34,197,94,0.15)"
                  : n.type === "token_cancelled" ? "rgba(239,68,68,0.15)"
                  : "rgba(245,158,11,0.15)",
          }));
          setNotifications(mapped);
        } else {
          setNotifications(SAMPLE_NOTIFS);
        }
      })
      .catch(() => setNotifications(SAMPLE_NOTIFS))
      .finally(() => setLoading(false));
  }, [patient?.id]);

  function relativeTime(ms: number): string {
    const diff = Date.now() - ms;
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "appointments") return n.type === "appointment";
    if (filter === "queue") return n.type === "queue";
    if (filter === "offers") return n.type === "offer";
    return true;
  });

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllReadContext();
    refreshBell();
  }

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`${BASE()}/api/notifications/${id}/read`, { method: "PATCH" });
      refreshBell();
    } catch {}
  }

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Pressable style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllTxt}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(key)}
            >
              <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Notifications List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color="#4F46E5" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="bell-off" size={32} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyBody}>You're all caught up!</Text>
          </View>
        ) : (
          filtered.map((notif, idx) => {
            const isFirst = idx === 0 || filtered[idx - 1].read !== notif.read;
            const showUnreadHeader = !notif.read && isFirst && filter === "all";
            const showReadHeader =
              notif.read &&
              isFirst &&
              filter === "all" &&
              notifications.some((n) => !n.read);

            return (
              <React.Fragment key={notif.id}>
                {showUnreadHeader && (
                  <Text style={styles.groupLabel}>New</Text>
                )}
                {showReadHeader && (
                  <Text style={styles.groupLabel}>Earlier</Text>
                )}
                <Pressable
                  style={[styles.card, notif.read && styles.cardRead]}
                  onPress={() => markRead(notif.id)}
                >
                  {!notif.read && <View style={styles.unreadBar} />}
                  <View style={[styles.iconWrap, { backgroundColor: notif.iconBg }]}>
                    <Feather name={notif.icon} size={18} color={notif.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTop}>
                      <Text
                        style={[styles.cardTitle, notif.read && styles.cardTitleRead]}
                        numberOfLines={1}
                      >
                        {notif.title}
                      </Text>
                      <Text style={styles.cardTime}>{notif.time}</Text>
                    </View>
                    <Text
                      style={[styles.cardBody, notif.read && styles.cardBodyRead]}
                      numberOfLines={2}
                    >
                      {notif.body}
                    </Text>
                  </View>
                </Pressable>
              </React.Fragment>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.18)" },
  orb2: { position: "absolute", top: 300, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.1)" },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: "#818CF8", fontWeight: "600", marginTop: 1 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: "rgba(79,70,229,0.15)", borderWidth: 1, borderColor: "rgba(79,70,229,0.3)" },
  markAllTxt: { fontSize: 12, fontWeight: "700", color: "#818CF8" },

  filterBar: { flexGrow: 0, flexShrink: 0, maxHeight: 48 },
  filterBarContent: { paddingHorizontal: 20, paddingBottom: 10, gap: 8, flexDirection: "row", alignItems: "center" },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
  chipActive: { backgroundColor: "rgba(79,70,229,0.25)", borderColor: "rgba(79,70,229,0.55)" },
  chipTxt: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.5)" },
  chipTxtActive: { color: "#A5B4FC" },

  list: { paddingHorizontal: 16, paddingTop: 4 },
  groupLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.3)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginTop: 12, paddingLeft: 4 },

  card: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 18, padding: 14, marginBottom: 8, overflow: "hidden",
  },
  cardRead: { backgroundColor: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.05)" },
  unreadBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3, backgroundColor: "#4F46E5", borderRadius: 3 },

  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },

  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#FFF", flex: 1, marginRight: 8 },
  cardTitleRead: { color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  cardTime: { fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: "500", flexShrink: 0 },
  cardBody: { fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 18 },
  cardBodyRead: { color: "rgba(255,255,255,0.38)" },

  emptyState: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.5)", marginBottom: 6 },
  emptyBody: { fontSize: 14, color: "rgba(255,255,255,0.25)" },
});
