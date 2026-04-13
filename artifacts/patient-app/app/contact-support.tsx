import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";

const CONTACT_CHANNELS: Array<{
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  sub: string;
  detail: string;
  color: string;
  bg: string;
  border: string;
  onPress: () => void;
}> = [
  {
    icon: "message-circle",
    label: "WhatsApp",
    sub: "Chat with our support team",
    detail: "Typically replies within a few minutes",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.25)",
    onPress: () =>
      Linking.openURL(
        "https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20LINESETU"
      ),
  },
  {
    icon: "mail",
    label: "Email Support",
    sub: "support@linesetu.com",
    detail: "We respond within 24 hours",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.25)",
    onPress: () =>
      Linking.openURL(
        "mailto:support@linesetu.com?subject=LINESETU%20Support%20Request"
      ),
  },
  {
    icon: "phone",
    label: "Call Us",
    sub: "+91 98765 43210",
    detail: "Mon–Sat · 9:00 AM – 7:00 PM",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    onPress: () => Linking.openURL("tel:+919876543210"),
  },
];

export default function ContactSupportScreen() {
  const insets = useSafeAreaInsets();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Contact Support</Text>
          <Text style={styles.headerSub}>We're here to help · Mon–Sat 9am–7pm</Text>
        </View>
      </View>

      {/* Hero note */}
      <View style={styles.heroBanner}>
        <Feather name="headphones" size={22} color="#818CF8" />
        <Text style={styles.heroTxt}>
          Our support team is ready to assist you with any issue — bookings, payments, queues, or account help.
        </Text>
      </View>

      {/* Channel cards */}
      <View style={styles.channelsWrap}>
        <Text style={styles.sectionLabel}>CHOOSE HOW TO REACH US</Text>
        {CONTACT_CHANNELS.map((ch) => (
          <Pressable
            key={ch.label}
            style={({ pressed }) => [
              styles.channelCard,
              { backgroundColor: ch.bg, borderColor: ch.border },
              pressed && { opacity: 0.75 },
            ]}
            onPress={ch.onPress}
          >
            <View style={[styles.channelIcon, { backgroundColor: ch.color + "25" }]}>
              <Feather name={ch.icon} size={22} color={ch.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.channelLabel}>{ch.label}</Text>
              <Text style={[styles.channelSub, { color: ch.color }]}>{ch.sub}</Text>
              <Text style={styles.channelDetail}>{ch.detail}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.25)" />
          </Pressable>
        ))}
      </View>

      {/* Footer note */}
      <Text style={styles.footer}>
        LINESETU Support · support@linesetu.com
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#0A0E1A" },
  orb1:         { position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.18)" },
  orb2:         { position: "absolute", bottom: 60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.08)" },

  header:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  backBtn:      { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerTitle:  { fontSize: 22, fontWeight: "800", color: "#FFF", letterSpacing: -0.4 },
  headerSub:    { fontSize: 12, color: "#818CF8", fontWeight: "600", marginTop: 1 },

  heroBanner:   { flexDirection: "row", alignItems: "flex-start", gap: 12, marginHorizontal: 16, marginBottom: 28, backgroundColor: "rgba(79,70,229,0.1)", borderWidth: 1, borderColor: "rgba(79,70,229,0.25)", borderRadius: 16, padding: 16 },
  heroTxt:      { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 20 },

  channelsWrap: { paddingHorizontal: 16, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.3)", letterSpacing: 0.9, textTransform: "uppercase", marginBottom: 4 },

  channelCard:  { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, borderWidth: 1, padding: 16 },
  channelIcon:  { width: 50, height: 50, borderRadius: 15, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  channelLabel: { fontSize: 16, fontWeight: "800", color: "#FFF", marginBottom: 2 },
  channelSub:   { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  channelDetail:{ fontSize: 11, color: "rgba(255,255,255,0.35)" },

  footer:       { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 32, paddingHorizontal: 16 },
});
