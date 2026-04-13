import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
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

type TicketCategory = "booking" | "payment" | "queue" | "account" | "other";

const TICKET_CATEGORIES: Array<{ key: TicketCategory; label: string; icon: React.ComponentProps<typeof Feather>["name"]; color: string }> = [
  { key: "booking",  label: "Booking Issue",  icon: "calendar",     color: "#818CF8" },
  { key: "payment",  label: "Payment Issue",  icon: "credit-card",  color: "#F59E0B" },
  { key: "queue",    label: "Queue Problem",  icon: "users",        color: "#06B6D4" },
  { key: "account",  label: "Account Help",   icon: "user",         color: "#22C55E" },
  { key: "other",    label: "Other",          icon: "more-horizontal", color: "#A5B4FC" },
];

const CONTACT_CHANNELS = [
  {
    icon: "message-circle" as const,
    label: "WhatsApp",
    sub: "Typically replies in a few minutes",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.25)",
    onPress: () => Linking.openURL("https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20LINESETU"),
  },
  {
    icon: "mail" as const,
    label: "Email Support",
    sub: "support@linesetu.com · 24hr response",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.25)",
    onPress: () => Linking.openURL("mailto:support@linesetu.com?subject=LINESETU%20Support%20Request"),
  },
  {
    icon: "phone" as const,
    label: "Call Us",
    sub: "+91 98765 43210 · Mon–Sat 9am–7pm",
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

  const [ticketCategory, setTicketCategory] = useState<TicketCategory | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitTicket = async () => {
    if (!ticketCategory) { Alert.alert("Select Category", "Please select a category for your issue."); return; }
    if (!subject.trim()) { Alert.alert("Subject Required", "Please enter a subject for your ticket."); return; }
    if (message.trim().length < 20) { Alert.alert("More Detail Needed", "Please describe your issue in at least 20 characters."); return; }

    setSubmitting(true);
    // Save ticket locally (in production this would POST to an API)
    const ticket = {
      id: Date.now().toString(),
      category: ticketCategory,
      subject: subject.trim(),
      message: message.trim(),
      status: "open",
      createdAt: new Date().toISOString(),
    };
    const existing = await AsyncStorage.getItem("linesetu_tickets");
    const tickets = existing ? JSON.parse(existing) : [];
    tickets.unshift(ticket);
    await AsyncStorage.setItem("linesetu_tickets", JSON.stringify(tickets));

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.orb1} />
        <View style={[styles.successWrap, { paddingTop: topPad + 40 }]}>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={48} color="#22C55E" />
          </View>
          <Text style={styles.successTitle}>Ticket Submitted!</Text>
          <Text style={styles.successSub}>
            We've received your request and will get back to you within 24 hours. Check your email for updates.
          </Text>
          <Text style={styles.ticketId}>Ticket #{Date.now().toString().slice(-6)}</Text>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnTxt}>Back to Profile</Text>
          </Pressable>
          <Pressable style={styles.newTicketBtn} onPress={() => { setSubmitted(false); setTicketCategory(null); setSubject(""); setMessage(""); }}>
            <Text style={styles.newTicketTxt}>Submit Another Ticket</Text>
          </Pressable>
        </View>
      </View>
    );
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
          <Text style={styles.headerTitle}>Contact Support</Text>
          <Text style={styles.headerSub}>We're here to help · Mon–Sat 9am–7pm</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick contact channels */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>REACH US DIRECTLY</Text>
          {CONTACT_CHANNELS.map((ch) => (
            <Pressable
              key={ch.label}
              style={[styles.channelCard, { backgroundColor: ch.bg, borderColor: ch.border }]}
              onPress={ch.onPress}
            >
              <View style={[styles.channelIcon, { backgroundColor: ch.color + "22" }]}>
                <Feather name={ch.icon} size={20} color={ch.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelLabel}>{ch.label}</Text>
                <Text style={styles.channelSub}>{ch.sub}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" />
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerTxt}>or raise a ticket</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Ticket form */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>SUBMIT A SUPPORT TICKET</Text>

          {/* Category */}
          <Text style={styles.fieldLabel}>Issue Category <Text style={styles.req}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
            {TICKET_CATEGORIES.map(({ key, label, icon, color }) => {
              const active = ticketCategory === key;
              return (
                <Pressable
                  key={key}
                  style={[styles.catChip, active && { backgroundColor: color + "22", borderColor: color + "66" }]}
                  onPress={() => setTicketCategory(key)}
                >
                  <Feather name={icon} size={13} color={active ? color : "rgba(255,255,255,0.4)"} />
                  <Text style={[styles.catChipTxt, active && { color }]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Subject */}
          <Text style={styles.fieldLabel}>Subject <Text style={styles.req}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief description of your issue"
            placeholderTextColor="rgba(255,255,255,0.25)"
            maxLength={100}
          />

          {/* Message */}
          <Text style={styles.fieldLabel}>Describe your issue <Text style={styles.req}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Please provide as much detail as possible — booking ID, doctor name, date, what went wrong…"
            placeholderTextColor="rgba(255,255,255,0.25)"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>{message.length}/1000</Text>

          <Pressable
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={submitTicket}
            disabled={submitting}
          >
            <Feather name="send" size={16} color="#FFF" />
            <Text style={styles.submitBtnTxt}>{submitting ? "Submitting…" : "Submit Ticket"}</Text>
          </Pressable>

          <Text style={styles.responseNote}>
            <Feather name="clock" size={11} color="rgba(255,255,255,0.3)" /> Expected response within 24 hours
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.18)" },
  orb2: { position: "absolute", top: 380, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(6,182,212,0.08)" },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: "#818CF8", fontWeight: "600", marginTop: 1 },

  sectionPad: { paddingHorizontal: 16, marginBottom: 4 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.3)", letterSpacing: 0.9, textTransform: "uppercase", marginBottom: 12 },

  channelCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  channelIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  channelLabel: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  channelSub: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  dividerTxt: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.8 },

  fieldLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  req: { fontSize: 13, color: "#EF4444", fontWeight: "900" },

  catChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  catChipTxt: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.45)" },

  input: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#FFF", fontWeight: "500", marginBottom: 18 },
  textarea: { minHeight: 120, textAlignVertical: "top" },
  charCount: { fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "right", marginTop: -14, marginBottom: 18 },

  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#4F46E5", borderRadius: 14, paddingVertical: 14 },
  submitBtnTxt: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  responseNote: { fontSize: 11, color: "rgba(255,255,255,0.28)", textAlign: "center", marginTop: 12, gap: 4 },

  // Success state
  successWrap: { flex: 1, alignItems: "center", paddingHorizontal: 32 },
  successIcon: { width: 100, height: 100, borderRadius: 28, backgroundColor: "rgba(34,197,94,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 24, borderWidth: 1, borderColor: "rgba(34,197,94,0.3)" },
  successTitle: { fontSize: 26, fontWeight: "800", color: "#FFF", letterSpacing: -0.5, marginBottom: 12 },
  successSub: { fontSize: 14, color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  ticketId: { fontSize: 13, fontWeight: "700", color: "#818CF8", backgroundColor: "rgba(79,70,229,0.15)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(79,70,229,0.3)", marginBottom: 32 },
  doneBtn: { width: "100%", backgroundColor: "#4F46E5", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  doneBtnTxt: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  newTicketBtn: { paddingVertical: 10 },
  newTicketTxt: { fontSize: 13, fontWeight: "700", color: "#818CF8" },
});
