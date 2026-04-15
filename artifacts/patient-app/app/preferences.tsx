import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";
const PREFS_KEY = "linesetu_preferences";

interface Preferences {
  smsAlerts: boolean;
  pushAlerts: boolean;
  alertAt10: boolean;
  alertAt5: boolean;
  alertAt1: boolean;
  alertAtTurn: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showEstimatedTime: boolean;
  darkMode: boolean;
}

const DEFAULT_PREFS: Preferences = {
  smsAlerts: true,
  pushAlerts: true,
  alertAt10: true,
  alertAt5: true,
  alertAt1: true,
  alertAtTurn: true,
  soundEnabled: true,
  vibrationEnabled: true,
  showEstimatedTime: true,
  darkMode: true,
};

function SectionLabel({ label, icon }: { label: string; icon: React.ComponentProps<typeof Feather>["name"] }) {
  return (
    <View style={styles.sectionRow}>
      <Feather name={icon} size={13} color="rgba(255,255,255,0.45)" />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
  color = "#4F46E5",
  last = false,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "rgba(255,255,255,0.1)", true: color + "55" }}
        thumbColor={value ? color : "rgba(255,255,255,0.3)"}
        ios_backgroundColor="rgba(255,255,255,0.1)"
      />
    </View>
  );
}

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 16 + 64;

  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (raw) {
        try {
          setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
        } catch {}
      }
    });
  }, []);

  const update = async (key: keyof Preferences, value: boolean | string) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  const saveAndClose = async () => {
    setSaving(true);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaving(false);
    router.back();
  };

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
          <Text style={styles.headerTitle}>Preferences</Text>
          <Text style={styles.headerSub}>SMS, alerts & display</Text>
        </View>
        <Pressable
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={saveAndClose}
          disabled={saving}
        >
          <Text style={styles.saveBtnTxt}>{saving ? "Saving…" : "Save"}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Queue Alerts ── */}
        <SectionLabel label="Queue Alerts" icon="bell" />
        <View style={styles.card}>
          <ToggleRow
            label="10 Tokens Left"
            sub="Alert when 10 patients are ahead of you"
            value={prefs.alertAt10}
            onChange={(v) => update("alertAt10", v)}
            color="#818CF8"
          />
          <ToggleRow
            label="5 Tokens Left"
            sub="Alert when 5 patients are ahead of you"
            value={prefs.alertAt5}
            onChange={(v) => update("alertAt5", v)}
            color="#F59E0B"
          />
          <ToggleRow
            label="1 Token Left"
            sub="Alert when you're almost next"
            value={prefs.alertAt1}
            onChange={(v) => update("alertAt1", v)}
            color="#EF4444"
          />
          <ToggleRow
            label="Your Turn"
            sub="Alert when the doctor calls your token"
            value={prefs.alertAtTurn}
            onChange={(v) => update("alertAtTurn", v)}
            color="#22C55E"
            last
          />
        </View>

        {/* ── SMS & Push ── */}
        <SectionLabel label="SMS & Push Notifications" icon="smartphone" />
        <View style={styles.card}>
          <ToggleRow
            label="SMS Alerts"
            sub="Receive queue updates via SMS"
            value={prefs.smsAlerts}
            onChange={(v) => update("smsAlerts", v)}
            color="#06B6D4"
          />
          <ToggleRow
            label="Push Notifications"
            sub="In-app push alerts for queue activity"
            value={prefs.pushAlerts}
            onChange={(v) => update("pushAlerts", v)}
            color="#4F46E5"
            last
          />
        </View>

        {/* ── Sound & Vibration ── */}
        <SectionLabel label="Sound & Vibration" icon="volume-2" />
        <View style={styles.card}>
          <ToggleRow
            label="Alert Sound"
            sub="Play a sound when queue alerts fire"
            value={prefs.soundEnabled}
            onChange={(v) => update("soundEnabled", v)}
            color="#F59E0B"
          />
          <ToggleRow
            label="Vibration"
            sub="Vibrate on alerts"
            value={prefs.vibrationEnabled}
            onChange={(v) => update("vibrationEnabled", v)}
            color="#A5B4FC"
            last
          />
        </View>

        {/* ── Display ── */}
        <SectionLabel label="Display" icon="monitor" />
        <View style={styles.card}>
          <ToggleRow
            label="Show Estimated Wait Time"
            sub="Display wait time countdown on queue screen"
            value={prefs.showEstimatedTime}
            onChange={(v) => update("showEstimatedTime", v)}
            color="#22C55E"
            last
          />
        </View>

        {/* Reset */}
        <Pressable
          style={styles.resetBtn}
          onPress={() => {
            Alert.alert(
              "Reset Preferences",
              "This will restore all settings to their defaults.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: async () => {
                    setPrefs(DEFAULT_PREFS);
                    await AsyncStorage.setItem(
                      PREFS_KEY,
                      JSON.stringify(DEFAULT_PREFS)
                    );
                  },
                },
              ]
            );
          }}
        >
          <Feather name="refresh-ccw" size={14} color="#EF4444" />
          <Text style={styles.resetTxt}>Reset to Defaults</Text>
        </Pressable>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.18)" },
  orb2: { position: "absolute", top: 350, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.1)" },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: "#818CF8", fontWeight: "600", marginTop: 1 },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(79,70,229,0.25)", borderWidth: 1, borderColor: "rgba(79,70,229,0.5)" },
  saveBtnTxt: { fontSize: 13, fontWeight: "700", color: "#A5B4FC" },

  sectionRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, marginTop: 20, marginBottom: 8 },
  sectionEmoji: { fontSize: 15 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8 },

  card: { marginHorizontal: 16, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden" },

  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  rowLabel: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  rowSub: { fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 },

  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28, marginBottom: 8, paddingVertical: 14, marginHorizontal: 16, borderRadius: 14, backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  resetTxt: { fontSize: 13, fontWeight: "700", color: "#EF4444" },

});
