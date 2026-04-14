import { Feather } from "@expo/vector-icons";
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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";

type Category = "all" | "queues" | "tokens" | "payments" | "account";

interface FAQ {
  id: string;
  category: Exclude<Category, "all">;
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  // Queues
  {
    id: "q1", category: "queues",
    q: "How does the queue system work?",
    a: "When you book a token with a doctor, you join their digital queue. The doctor's clinic calls tokens one by one. You can track your position in real time from the Live Queue screen — no need to sit in the clinic and wait.",
  },
  {
    id: "q2", category: "queues",
    q: "How do I know when it's my turn?",
    a: "You'll get alerts at 10 tokens left, 5 tokens left, 1 token left, and finally when it's your turn. Make sure SMS and push alerts are enabled in Preferences. You can also watch the live counter on the Queue screen.",
  },
  {
    id: "q3", category: "queues",
    q: "What if the doctor's queue is paused or delayed?",
    a: "If the doctor pauses or closes the queue, your wait time estimate will update accordingly. You'll be notified of any major delays via SMS or push alert.",
  },
  {
    id: "q4", category: "queues",
    q: "Can I book for a future date?",
    a: "Yes. When booking a token you can select a date and shift (morning or evening). Your token will be reserved for that slot.",
  },
  // Tokens
  {
    id: "t1", category: "tokens",
    q: "What is a token?",
    a: "A token is your booking reference with a specific doctor. It contains your queue number, date, shift, and payment details. Think of it as a digital ticket that reserves your spot in line.",
  },
  {
    id: "t2", category: "tokens",
    q: "Can I book multiple tokens?",
    a: "Yes, you can book tokens with different doctors. However, booking multiple tokens with the same doctor on the same day is not allowed.",
  },
  {
    id: "t3", category: "tokens",
    q: "What happens if I miss my token?",
    a: "If the doctor's current token number goes past yours, your slot may be treated as a no-show. Contact the clinic directly to check if they can accommodate you as a walk-in.",
  },
  {
    id: "t4", category: "tokens",
    q: "Can I cancel my token?",
    a: "Token cancellation is currently managed at the clinic level. Contact the clinic directly to cancel. Platform fee refunds depend on the clinic's policy.",
  },
  {
    id: "t5", category: "tokens",
    q: "What is an Emergency token?",
    a: "An Emergency token (₹30 platform fee) gets you a higher priority number in the queue. It's intended for urgent cases and is subject to doctor approval.",
  },
  // Payments
  {
    id: "p1", category: "payments",
    q: "What is the platform fee?",
    a: "LINESETU charges a small platform fee (₹20 for normal, ₹30 for emergency) to reserve your spot digitally. This is separate from the doctor's consultation fee, which you pay at the clinic.",
  },
  {
    id: "p2", category: "payments",
    q: "How do I pay the platform fee?",
    a: "Platform fees are paid securely via Razorpay during booking. You can use UPI, debit/credit cards, or net banking.",
  },
  {
    id: "p3", category: "payments",
    q: "Is the platform fee refundable?",
    a: "Platform fees are generally non-refundable once a token is booked. In case of exceptional circumstances (doctor unavailability, clinic closure), contact LINESETU support for a review.",
  },
  {
    id: "p4", category: "payments",
    q: "Where can I see my payment history?",
    a: "Your booking history including payment details is visible under My Bookings in the profile tab. Each booking shows the amount paid and payment status.",
  },
  // Account
  {
    id: "a1", category: "account",
    q: "How do I update my profile details?",
    a: "Go to Profile → Edit Profile (pencil icon next to your photo). You can update your name, email, age, gender, blood group, area, and address.",
  },
  {
    id: "a2", category: "account",
    q: "How do I add family members?",
    a: "Go to Profile → scroll to Family Members → tap the + button. Fill in the member's name, relation, age, blood group, phone, area, and address.",
  },
  {
    id: "a3", category: "account",
    q: "Is my data safe?",
    a: "Yes. Your data is encrypted end-to-end and stored securely on Firebase (Google Cloud). We never share your personal information with third parties without consent.",
  },
  {
    id: "a4", category: "account",
    q: "How do I log out?",
    a: "Go to Profile → scroll to the bottom → tap Sign Out.",
  },
];

const CATEGORIES: Array<{ key: Category; label: string; icon: React.ComponentProps<typeof Feather>["name"] }> = [
  { key: "all",      label: "All",      icon: "list" },
  { key: "queues",   label: "Queues",   icon: "users" },
  { key: "tokens",   label: "Tokens",   icon: "hash" },
  { key: "payments", label: "Payments", icon: "credit-card" },
  { key: "account",  label: "Account",  icon: "user" },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable style={styles.faqCard} onPress={() => setOpen((o) => !o)}>
      <View style={styles.faqTop}>
        <Text style={styles.faqQ}>{faq.q}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color="#818CF8" />
      </View>
      {open && <Text style={styles.faqA}>{faq.a}</Text>}
    </Pressable>
  );
}

export default function HelpFaqScreen() {
  const insets = useSafeAreaInsets();
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 16 + 64;
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter((f) => {
    const matchCat = category === "all" || f.category === category;
    const matchSearch = search.trim() === "" || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
          <Text style={styles.headerTitle}>Help & FAQ</Text>
          <Text style={styles.headerSub}>How queues, tokens & payments work</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map(({ key, label, icon }) => {
          const active = category === key;
          return (
            <Pressable
              key={key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setCategory(key)}
            >
              <Feather name={icon} size={12} color={active ? "#A5B4FC" : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ count */}
        <Text style={styles.resultCount}>{filtered.length} question{filtered.length !== 1 ? "s" : ""}</Text>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="search" size={32} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTxt}>No results found</Text>
          </View>
        ) : (
          filtered.map((faq) => <FAQItem key={faq.id} faq={faq} />)
        )}

        {/* Contact Support Card */}
        <View style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <View style={styles.supportIconWrap}>
              <Feather name="headphones" size={20} color="#22C55E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Still need help?</Text>
              <Text style={styles.supportSub}>Our support team is here Mon–Sat, 9am–7pm</Text>
            </View>
          </View>
          <View style={styles.supportBtns}>
            <Pressable
              style={[styles.supportBtn, { borderColor: "rgba(6,182,212,0.35)", backgroundColor: "rgba(6,182,212,0.08)" }]}
              onPress={() => Linking.openURL("mailto:support@linesetu.com")}
            >
              <Feather name="mail" size={15} color="#06B6D4" />
              <Text style={[styles.supportBtnTxt, { color: "#06B6D4" }]}>Email Us</Text>
            </Pressable>
            <Pressable
              style={[styles.supportBtn, { borderColor: "rgba(34,197,94,0.35)", backgroundColor: "rgba(34,197,94,0.08)" }]}
              onPress={() => Linking.openURL("https://wa.me/919876543210")}
            >
              <Feather name="message-circle" size={15} color="#22C55E" />
              <Text style={[styles.supportBtnTxt, { color: "#22C55E" }]}>WhatsApp</Text>
            </Pressable>
            <Pressable
              style={[styles.supportBtn, { borderColor: "rgba(245,158,11,0.35)", backgroundColor: "rgba(245,158,11,0.08)" }]}
              onPress={() => Alert.alert("Call Support", "Call us at +91 98765 43210\nMon–Sat, 9am–7pm", [{ text: "OK" }])}
            >
              <Feather name="phone" size={15} color="#F59E0B" />
              <Text style={[styles.supportBtnTxt, { color: "#F59E0B" }]}>Call</Text>
            </Pressable>
          </View>
        </View>

        {/* App version */}
        <Text style={styles.version}>LINESETU v1.0.0 · Smart Queue System</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  orb1: { position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.18)" },
  orb2: { position: "absolute", top: 380, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(34,197,94,0.08)" },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: "#818CF8", fontWeight: "600", marginTop: 1 },

  filterBar: { flexGrow: 0, flexShrink: 0, maxHeight: 50 },
  filterContent: { paddingHorizontal: 16, gap: 8, flexDirection: "row", alignItems: "center", paddingBottom: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
  chipActive: { backgroundColor: "rgba(79,70,229,0.2)", borderColor: "rgba(79,70,229,0.5)" },
  chipTxt: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.45)" },
  chipTxtActive: { color: "#A5B4FC" },

  resultCount: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },

  faqCard: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, marginBottom: 8 },
  faqTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  faqQ: { flex: 1, fontSize: 14, fontWeight: "700", color: "#FFF", lineHeight: 20 },
  faqA: { fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },

  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTxt: { fontSize: 15, color: "rgba(255,255,255,0.25)", fontWeight: "600" },

  supportCard: { marginTop: 24, backgroundColor: "rgba(34,197,94,0.07)", borderWidth: 1, borderColor: "rgba(34,197,94,0.2)", borderRadius: 20, padding: 18 },
  supportHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  supportIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(34,197,94,0.15)", alignItems: "center", justifyContent: "center" },
  supportTitle: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  supportSub: { fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 },
  supportBtns: { flexDirection: "row", gap: 8 },
  supportBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  supportBtnTxt: { fontSize: 12, fontWeight: "700" },

  version: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 24, marginBottom: 8 },
});
