import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getGetPatientTokensQueryOptions } from "@workspace/api-client-react";
import React from "react";
import {
  ActivityIndicator,
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

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  waiting:    { color: "#FCD34D", bg: "rgba(252,211,77,0.15)",  label: "Waiting"    },
  in_consult: { color: "#22C55E", bg: "rgba(34,197,94,0.15)",  label: "In Consult" },
  done:       { color: "#818CF8", bg: "rgba(129,140,248,0.15)", label: "Done"       },
  cancelled:  { color: "#EF4444", bg: "rgba(239,68,68,0.15)",  label: "Cancelled"  },
};

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { patient } = useAuth();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 64;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    ...getGetPatientTokensQueryOptions(patient?.id ?? ""),
    enabled: !!patient?.id,
  });

  const tokens = data?.tokens ?? [];
  const active = tokens.filter((t: any) => t.status === "waiting" || t.status === "in_consult");
  const past   = tokens.filter((t: any) => t.status === "done" || t.status === "cancelled");

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/(tabs)")}
        >
          <Feather name="plus" size={18} color="#818CF8" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#818CF8" />
        }
      >
        {isLoading ? (
          <ActivityIndicator color="#818CF8" style={{ marginTop: 40 }} />
        ) : tokens.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="calendar" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyBody}>Book your first token to skip the queue</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.push("/(tabs)")}>
              <Text style={styles.emptyBtnTxt}>Find Doctors</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <Text style={styles.groupLabel}>Active Tokens</Text>
                {active.map((t: any) => <TokenCard key={t.id} token={t} />)}
              </>
            )}
            {past.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { marginTop: 20 }]}>Past Bookings</Text>
                {past.map((t: any) => <TokenCard key={t.id} token={t} />)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function TokenCard({ token }: { token: any }) {
  const meta = STATUS_META[token.status] ?? STATUS_META.waiting;
  const isActive = token.status === "waiting" || token.status === "in_consult";

  return (
    <Pressable
      style={[styles.tokenCard, isActive && { borderColor: "rgba(99,102,241,0.4)" }]}
      onPress={() => isActive && router.push(`/queue/${token.id}`)}
    >
      {/* Token number badge */}
      <View style={styles.tokenBadge}>
        <Text style={styles.tokenBadgeLabel}>TOKEN</Text>
        <Text style={styles.tokenBadgeNum}>#{token.tokenNumber}</Text>
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.tokenDate}>
          {token.date} · {token.shift === "morning" ? "Morning" : "Evening"}
        </Text>
        <Text style={styles.tokenType}>
          {token.type === "emergency" ? "⚡ Emergency" : "Normal"} Token
        </Text>
        <View style={styles.feeRow}>
          <Feather name="credit-card" size={10} color="rgba(255,255,255,0.4)" />
          <Text style={styles.feeTxt}>₹{token.patientPaid} paid</Text>
        </View>
      </View>

      <View style={{ alignItems: "flex-end", gap: 8 }}>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusTxt, { color: meta.color }]}>{meta.label}</Text>
        </View>
        {isActive && (
          <View style={styles.trackBtn}>
            <Text style={styles.trackBtnTxt}>Track →</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: {
    position: "absolute", top: -60, right: -40, width: 200, height: 200,
    borderRadius: 100, backgroundColor: "rgba(99,102,241,0.18)",
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(99,102,241,0.15)",
    borderWidth: 1, borderColor: "rgba(99,102,241,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  groupLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 },
  tokenCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18, padding: 14, marginBottom: 10,
  },
  tokenBadge: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: "rgba(99,102,241,0.2)",
    borderWidth: 1.5, borderColor: "rgba(99,102,241,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  tokenBadgeLabel: { fontSize: 8, fontWeight: "700", color: "#818CF8", letterSpacing: 0.5 },
  tokenBadgeNum: { fontSize: 18, fontWeight: "900", color: "#A5B4FC" },
  tokenDate: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  tokenType: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  feeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  feeTxt: { fontSize: 10, color: "rgba(255,255,255,0.4)" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusTxt: { fontSize: 10, fontWeight: "700" },
  trackBtn: {
    backgroundColor: "rgba(99,102,241,0.2)",
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  trackBtnTxt: { fontSize: 11, fontWeight: "700", color: "#818CF8" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  emptyBody: { fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" },
  emptyBtn: {
    marginTop: 8, backgroundColor: "rgba(99,102,241,0.2)",
    borderWidth: 1, borderColor: "rgba(99,102,241,0.4)",
    borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
  },
  emptyBtnTxt: { fontSize: 14, fontWeight: "700", color: "#818CF8" },
});
