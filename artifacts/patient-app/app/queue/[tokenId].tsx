import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  getGetTokenQueryOptions,
  getGetQueuePositionQueryOptions,
  useCancelToken,
} from "@workspace/api-client-react";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const isWeb = Platform.OS === "web";

export default function QueueTrackerScreen() {
  const { tokenId } = useLocalSearchParams<{ tokenId: string }>();
  const insets = useSafeAreaInsets();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const { data: token, isLoading: tokenLoading } = useQuery({
    ...getGetTokenQueryOptions(tokenId ?? ""),
    enabled: !!tokenId,
    refetchInterval: 10_000,
  });

  const { data: position, isLoading: posLoading } = useQuery({
    ...getGetQueuePositionQueryOptions(token?.doctorId ?? "", tokenId ?? ""),
    enabled: !!token?.doctorId && !!tokenId,
    refetchInterval: 10_000,
  });

  const { mutateAsync: cancel, isPending: cancelling } = useCancelToken();

  const handleCancel = () => {
    if (isWeb) {
      doCancel();
    } else {
      Alert.alert(
        "Cancel Token",
        "Are you sure you want to cancel this token? A refund will be processed.",
        [
          { text: "Keep", style: "cancel" },
          { text: "Cancel Token", style: "destructive", onPress: doCancel },
        ]
      );
    }
  };

  const doCancel = async () => {
    try {
      await cancel({ tokenId: tokenId ?? "" });
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/bookings");
    } catch {
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  if (tokenLoading || posLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#818CF8" size="large" />
        <Text style={styles.loadingTxt}>Tracking your token…</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: "#FFF" }}>Token not found</Text>
      </View>
    );
  }

  const myToken      = token.tokenNumber ?? 0;
  const currentToken = position?.currentToken ?? 0;
  const pos          = position?.position ?? Math.max(0, myToken - currentToken);
  const waitMins     = position?.estimatedWaitMins ?? pos * 7;
  const totalWaiting = position?.totalWaiting ?? 0;
  const isDone       = token.status === "done";
  const isCancelled  = token.status === "cancelled";
  const isInConsult  = token.status === "in_consult";

  const progressPct = myToken > 0 ? Math.min(100, (currentToken / myToken) * 100) : 0;

  const statusColor = isDone ? "#22C55E" : isInConsult ? "#22C55E" : isCancelled ? "#EF4444" : "#FCD34D";
  const statusLabel = isDone ? "Consultation Done" : isInConsult ? "You're Next!" : isCancelled ? "Token Cancelled" : `${pos} ahead of you`;

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.push("/(tabs)/bookings")}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <Text style={styles.navTitle}>Live Queue Tracker</Text>
        <Pressable style={styles.refreshBtn}>
          <Feather name="refresh-cw" size={16} color="#818CF8" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 80 }}>

        {/* Live indicator */}
        <View style={styles.liveBanner}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTxt}>Auto-refreshing every 10 seconds</Text>
        </View>

        {/* Main token card */}
        <View style={styles.sectionPad}>
          <LinearGradient
            colors={["rgba(79,70,229,0.22)", "rgba(6,182,212,0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            {/* Three stats */}
            <View style={styles.statsRow}>
              {/* My Token */}
              <View style={[styles.statBox, { backgroundColor: "rgba(79,70,229,0.2)", borderColor: "rgba(99,102,241,0.4)" }]}>
                <View style={styles.statLabelRow}>
                  <Feather name="hash" size={9} color="#818CF8" />
                  <Text style={styles.statLblTxt}>My Token</Text>
                </View>
                <Text style={[styles.statNum, { color: "#A5B4FC" }]}>{myToken}</Text>
                <Text style={styles.statSubTxt}>Your number</Text>
              </View>

              {/* Current */}
              <View style={[styles.statBox, { backgroundColor: "rgba(6,182,212,0.12)", borderColor: "rgba(6,182,212,0.3)" }]}>
                <View style={styles.statLabelRow}>
                  <Feather name="radio" size={9} color="#06B6D4" />
                  <Text style={styles.statLblTxt}>Current</Text>
                </View>
                <Text style={[styles.statNum, { color: "#67E8F9" }]}>{currentToken}</Text>
                <Text style={styles.statSubTxt}>Being served</Text>
              </View>

              {/* Wait */}
              <View style={[styles.statBox, { backgroundColor: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.25)" }]}>
                <View style={styles.statLabelRow}>
                  <Feather name="clock" size={9} color="#22C55E" />
                  <Text style={styles.statLblTxt}>Est. Wait</Text>
                </View>
                <Text style={[styles.statNum, { color: "#4ADE80", fontSize: 26 }]}>~{waitMins}</Text>
                <Text style={styles.statSubTxt}>minutes</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{statusLabel}</Text>
                <Text style={[styles.progressLabel, { color: "#818CF8" }]}>{totalWaiting} waiting</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Status card */}
        <View style={styles.sectionPad}>
          <View style={[styles.statusCard, { borderColor: statusColor + "40" }]}>
            <View style={[styles.statusIconBox, { backgroundColor: statusColor + "18" }]}>
              <Feather name={isDone ? "check-circle" : isInConsult ? "user-check" : isCancelled ? "x-circle" : "clock"} size={22} color={statusColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: statusColor }]}>
                {isDone ? "Consultation Complete" : isInConsult ? "Your Turn Now!" : isCancelled ? "Token Cancelled" : "In Queue"}
              </Text>
              <Text style={styles.statusBody}>
                {isDone
                  ? "Your consultation has been completed."
                  : isInConsult
                  ? "Please proceed to the doctor's cabin."
                  : isCancelled
                  ? "Your token has been cancelled. Refund in 3-5 days."
                  : `You are ${pos} patient${pos !== 1 ? "s" : ""} away.`}
              </Text>
            </View>
          </View>
        </View>

        {/* Token details */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Token Details</Text>
          <View style={styles.detailsCard}>
            {[
              { label: "Token Number",  val: `#${myToken}` },
              { label: "Date",          val: token.date ?? "—" },
              { label: "Shift",         val: token.shift === "morning" ? "Morning" : "Evening" },
              { label: "Type",          val: token.type === "emergency" ? "⚡ Emergency" : "Normal" },
              { label: "Payment",       val: `₹${token.patientPaid} — ${token.paymentStatus === "paid" ? "Paid" : "Pending"}` },
            ].map(({ label, val }, i) => (
              <View key={label} style={[styles.detailRow, i > 0 && styles.detailRowBorder]}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailVal}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        {!isDone && !isCancelled && (
          <View style={styles.sectionPad}>
            <View style={styles.tipsCard}>
              <Feather name="info" size={14} color="#818CF8" />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipsTitle}>While you wait</Text>
                <Text style={styles.tipsTxt}>Stay near the clinic when your position is under 5. We'll update your position every 10 seconds.</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action bar */}
      {!isDone && !isCancelled && (
        <View style={[styles.actionBar, { paddingBottom: bottomPad + 8 }]}>
          <Pressable style={styles.cancelBtn} onPress={handleCancel} disabled={cancelling}>
            {cancelling
              ? <ActivityIndicator color="#EF4444" size="small" />
              : <Text style={styles.cancelBtnTxt}>Cancel Token</Text>}
          </Pressable>
          <Pressable style={styles.shareBtn} onPress={() => {}}>
            <Feather name="share-2" size={16} color="#818CF8" />
            <Text style={styles.shareBtnTxt}>Share Position</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  loading: { flex: 1, backgroundColor: "#0A0E1A", alignItems: "center", justifyContent: "center", gap: 12 },
  loadingTxt: { fontSize: 14, color: "rgba(255,255,255,0.5)" },
  orb1: { position: "absolute", top: -60, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(99,102,241,0.2)" },
  orb2: { position: "absolute", bottom: 40, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.14)" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(99,102,241,0.15)", alignItems: "center", justifyContent: "center" },
  liveBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 12 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#22C55E" },
  liveTxt: { fontSize: 11, fontWeight: "600", color: "#4ADE80", letterSpacing: 0.3 },
  sectionPad: { paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#FFF", marginBottom: 10 },
  mainCard: { borderRadius: 22, padding: 16, borderWidth: 1, borderColor: "rgba(99,102,241,0.35)" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statBox: { flex: 1, borderRadius: 16, padding: 12, alignItems: "center", borderWidth: 1 },
  statLabelRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 4 },
  statLblTxt: { fontSize: 8, fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5 },
  statNum: { fontSize: 32, fontWeight: "900", color: "#A5B4FC", lineHeight: 36 },
  statSubTxt: { fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 },
  progressSection: { marginTop: 2 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: "500" },
  progressTrack: { height: 5, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: "#4F46E5" },
  statusCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderRadius: 18, padding: 16 },
  statusIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statusTitle: { fontSize: 15, fontWeight: "800", marginBottom: 3 },
  statusBody: { fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 17 },
  detailsCard: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  detailRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  detailLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
  detailVal: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.85)" },
  tipsCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "rgba(99,102,241,0.1)", borderWidth: 1, borderColor: "rgba(99,102,241,0.25)", borderRadius: 14, padding: 14 },
  tipsTitle: { fontSize: 12, fontWeight: "700", color: "#818CF8", marginBottom: 4 },
  tipsTxt: { fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 17 },
  actionBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 14, backgroundColor: "rgba(10,14,26,0.97)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
  cancelBtn: { flex: 1, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  cancelBtnTxt: { fontSize: 13, fontWeight: "700", color: "#EF4444" },
  shareBtn: { flex: 1, backgroundColor: "rgba(99,102,241,0.15)", borderWidth: 1, borderColor: "rgba(99,102,241,0.35)", borderRadius: 14, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 },
  shareBtnTxt: { fontSize: 13, fontWeight: "700", color: "#818CF8" },
  statsBlock: {},
});
