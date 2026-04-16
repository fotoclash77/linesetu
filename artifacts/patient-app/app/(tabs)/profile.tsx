import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { usePatientNotifs } from "@/contexts/PatientNotifsContext";
import type { Href } from "expo-router";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getGetPatientTokensQueryOptions } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";

const isWeb = Platform.OS === "web";

const BLOOD_GROUPS  = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "I Don't Know"];
const GENDERS       = ["Male", "Female", "Other"];
const RELATIONS     = ["Wife", "Husband", "Mother", "Father", "Son", "Daughter", "Brother", "Sister", "Other"];
const RELATION_COLORS: Record<string, string> = {
  Wife: "#EC4899", Husband: "#3B82F6", Mother: "#F59E0B", Father: "#10B981",
  Son: "#06B6D4", Daughter: "#8B5CF6", Brother: "#EF4444", Sister: "#F97316", Other: "#818CF8",
};

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: string;
  blood: string;
  phone: string;
  avatar?: string;
  address?: string;
  area?: string;
}

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
      { icon: "calendar",  label: "My Bookings",   sub: "Tokens, visits & history",        color: "#6366F1", route: "/(tabs)/bookings", badge: null, liveIndicator: false, danger: false },
      { icon: "activity",  label: "Live Queue",     sub: "Track active token in real-time", color: "#22C55E", route: null,               badge: null, liveIndicator: true,  danger: false },
    ],
  },
  {
    title: "Settings & Preferences",
    items: [
      { icon: "bell",    label: "Notifications", sub: "Token alerts & appointment reminders", color: "#F59E0B", route: "/notifications", badge: "3",  liveIndicator: false, danger: false },
    ],
  },
  {
    title: "App & Support",
    items: [
      { icon: "help-circle",    label: "Help & FAQ",           sub: "How queues, tokens & payments work", color: "#22C55E", route: "/help-faq",       badge: null, liveIndicator: false, danger: false },
      { icon: "message-circle", label: "Contact Support",      sub: "Chat or raise a ticket",             color: "#06B6D4", route: "/contact-support", badge: null, liveIndicator: false, danger: false },
      { icon: "share-2",        label: "Share LINESETU App",   sub: "Invite family & friends",            color: "#A78BFA", route: null,               badge: null, liveIndicator: false, danger: false },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: "log-out", label: "Sign Out", sub: "Log out of your account", color: "#F59E0B", route: null, badge: null, liveIndicator: false, danger: false },
    ],
  },
];

function ChipSelector({ options, value, onChange, color = "#818CF8" }: {
  options: string[]; value: string; onChange: (v: string) => void; color?: string;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={[
            styles.chip,
            value === opt && { backgroundColor: color + "30", borderColor: color },
          ]}
        >
          <Text style={[styles.chipTxt, value === opt && { color }]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function FieldBlock({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View style={styles.fieldBlock}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 8 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && <Text style={styles.fieldRequired}>*</Text>}
      </View>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { patient, logout, updatePatient } = useAuth();
  const { unreadCount } = usePatientNotifs();

  const { data: tokenData } = useQuery({
    ...getGetPatientTokensQueryOptions(patient?.id ?? ""),
    enabled: !!patient?.id,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const activeToken = (tokenData?.tokens ?? []).find(
    (t) => t.status === "waiting" || t.status === "in_consult"
  );

  const topPad    = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 + 84 : insets.bottom + 64;

  const name     = patient?.name      ?? "";
  const phone    = patient?.phone     ?? "";
  const initials = name ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const [showSignOut, setShowSignOut] = useState(false);

  // ── Family members — live from Firestore ─────────────────
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showFamily, setShowFamily] = useState(true);

  useEffect(() => {
    if (!patient?.id) return;
    const ref = doc(db, "patients", patient.id);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as any;
      const members: FamilyMember[] = Array.isArray(data?.familyMembers)
        ? data.familyMembers.map((f: any, i: number) => ({
            id:       f.id       ?? `fam-${i}`,
            name:     f.name     ?? "",
            relation: f.relation ?? "Other",
            age:      f.age      ?? "",
            blood:    f.blood    ?? "",
            phone:    f.phone    ?? "",
            avatar:   f.avatar   ?? f.photo ?? "",
            address:  f.address  ?? "",
            area:     f.area     ?? "",
          }))
        : [];
      setFamilyMembers(members);
    });
    return () => unsub();
  }, [patient?.id]);

  const persistFamily = async (members: FamilyMember[]) => {
    if (!patient?.id) return;
    const write = () => setDoc(doc(db, "patients", patient.id), { familyMembers: members }, { merge: true });
    try { await write(); } catch {
      try { await write(); } catch {
        Alert.alert("Sync Warning", "Could not sync to cloud. Please try again.");
      }
    }
  };

  const deleteMember = (id: string) => {
    Alert.alert("Remove member", "Are you sure you want to remove this family member?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => persistFamily(familyMembers.filter(m => m.id !== id)) },
    ]);
  };

  // ── Edit Profile Modal ───────────────────────────────────
  const [editVisible, setEditVisible] = useState(false);
  const [eName,    setEName]    = useState("");
  const [eAge,     setEAge]     = useState("");
  const [eBlood,   setEBlood]   = useState("");
  const [eGender,  setEGender]  = useState("");
  const [eEmail,   setEEmail]   = useState("");
  const [eAddress, setEAddress] = useState("");
  const [eArea,    setEArea]    = useState("");
  const [saving,   setSaving]   = useState(false);

  const openEditProfile = () => {
    setEName(patient?.name ?? "");
    setEAge(patient?.age ?? "");
    setEBlood(patient?.blood ?? "");
    setEGender(patient?.gender ?? "");
    setEEmail(patient?.email ?? "");
    setEAddress(patient?.address ?? "");
    setEArea(patient?.area ?? "");
    setEditVisible(true);
  };

  const saveProfile = async () => {
    if (!eName.trim())    { Alert.alert("Name required",        "Please enter your full name.");       return; }
    if (!eEmail.trim())   { Alert.alert("Email required",       "Please enter your email address.");   return; }
    if (!eAge.trim())     { Alert.alert("Age required",         "Please enter your age.");              return; }
    if (!eGender)         { Alert.alert("Gender required",      "Please select your gender.");          return; }
    if (!eBlood)          { Alert.alert("Blood group required", "Please select your blood group.");     return; }
    if (!eArea.trim())    { Alert.alert("Area required",        "Please enter your area / locality."); return; }
    if (!eAddress.trim()) { Alert.alert("Address required",     "Please enter your complete address."); return; }
    setSaving(true);
    await updatePatient({ name: eName.trim(), age: eAge, blood: eBlood, gender: eGender, email: eEmail, address: eAddress, area: eArea });
    setSaving(false);
    setEditVisible(false);
  };

  // ── Family Member Modal ──────────────────────────────────
  const [famVisible,    setFamVisible]   = useState(false);
  const [editingMem,    setEditingMem]   = useState<FamilyMember | null>(null);
  const [mName,    setMName]    = useState("");
  const [mRelation,setMRelation]= useState("Wife");
  const [mAge,     setMAge]     = useState("");
  const [mBlood,   setMBlood]   = useState("");
  const [mPhone,   setMPhone]   = useState("");
  const [mArea,    setMArea]    = useState("");
  const [mAddress, setMAddress] = useState("");
  const [mSaving,  setMSaving]  = useState(false);

  const openAddMember = () => {
    setEditingMem(null);
    setMName(""); setMRelation("Wife");
    setMAge(""); setMBlood(""); setMPhone(""); setMArea(""); setMAddress("");
    setFamVisible(true);
  };

  const openEditMember = (m: FamilyMember) => {
    setEditingMem(m);
    setMName(m.name); setMRelation(m.relation);
    setMAge(m.age); setMBlood(m.blood); setMPhone(m.phone);
    setMArea(m.area ?? ""); setMAddress(m.address ?? "");
    setFamVisible(true);
  };

  const saveMember = async () => {
    if (!mName.trim())    { Alert.alert("Name required",        "Please enter the member's full name.");     return; }
    if (!mRelation)       { Alert.alert("Relation required",    "Please select the relation.");               return; }
    if (!mAge.trim())     { Alert.alert("Age required",         "Please enter the member's age.");            return; }
    if (!mBlood)          { Alert.alert("Blood group required", "Please select the blood group.");            return; }
    const phoneDigits = mPhone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) { Alert.alert("Phone required", "Please enter a valid 10-digit phone number."); return; }
    if (!mArea.trim())    { Alert.alert("Area required",        "Please enter the member's area.");           return; }
    if (!mAddress.trim()) { Alert.alert("Address required",     "Please enter the member's complete address."); return; }
    setMSaving(true);
    const member: FamilyMember = {
      id:       editingMem?.id ?? Date.now().toString(),
      name:     mName.trim(),
      relation: mRelation,
      age:      mAge,
      blood:    mBlood,
      phone:    phoneDigits,
      area:     mArea.trim(),
      address:  mAddress.trim(),
    };
    const updated = editingMem
      ? familyMembers.map(m => m.id === editingMem.id ? member : m)
      : [...familyMembers, member];
    await persistFamily(updated);
    setMSaving(false);
    setFamVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable style={styles.headerIconBtn} onPress={openEditProfile}>
            <Feather name="edit-3" size={16} color="rgba(255,255,255,0.6)" />
          </Pressable>
          <Pressable style={[styles.headerIconBtn, { backgroundColor: "rgba(79,70,229,0.18)", borderColor: "rgba(99,102,241,0.35)" }]} onPress={() => router.push("/notifications")}>
            <Feather name="bell" size={16} color="rgba(255,255,255,0.7)" />
            {unreadCount > 0 && <View style={styles.notifDot} />}
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>

        {/* User Card */}
        <View style={styles.userCardWrap}>
          <LinearGradient colors={["rgba(99,102,241,0.45)", "rgba(6,182,212,0.22)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.userCard}>
            <View style={styles.cardGlowOrb} />
            <View style={styles.userCardRow}>
              <View style={{ position: "relative" }}>
                {patient?.profilePhoto ? (
                  <Image source={{ uri: patient.profilePhoto }} style={styles.userAvatarPhoto} contentFit="cover" />
                ) : (
                  <View style={[styles.userAvatarPhoto, styles.userAvatarInitials]}>
                    <Text style={styles.initialsText}>{initials}</Text>
                  </View>
                )}
                <View style={styles.onlineIndicator} />
              </View>
              <View style={{ flex: 1 }}>
                {name ? (
                  <Text style={styles.userName}>{name}</Text>
                ) : (
                  <Pressable onPress={openEditProfile}>
                    <Text style={styles.userNameHint}>Enter your full name</Text>
                  </Pressable>
                )}
                {phone ? (
                  <View style={styles.phoneRow}>
                    <Feather name="phone" size={11} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.phoneText}>{phone}</Text>
                  </View>
                ) : null}
                {patient?.email ? (
                  <View style={styles.memberSince}>
                    <Feather name="mail" size={10} color="#818CF8" />
                    <Text style={[styles.memberSinceTxt, { color: "#A5B4FC" }]}>{patient.email}</Text>
                  </View>
                ) : null}
                {(patient?.blood || patient?.age) ? (
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                    {patient?.blood ? <View style={styles.infoBadge}><Text style={styles.infoBadgeTxt}>{patient.blood}</Text></View> : null}
                    {patient?.age  ? <View style={styles.infoBadge}><Text style={styles.infoBadgeTxt}>{patient.age} yrs</Text></View>  : null}
                    {patient?.gender ? <View style={styles.infoBadge}><Text style={styles.infoBadgeTxt}>{patient.gender}</Text></View> : null}
                  </View>
                ) : null}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Family Members */}
        <View style={styles.familySection}>
          <Pressable style={styles.familyHeader} onPress={() => setShowFamily(p => !p)}>
            <Feather name="users" size={14} color="#818CF8" />
            <Text style={styles.familyTitle}>Family Members</Text>
            <View style={styles.familyBadge}>
              <Text style={styles.familyBadgeTxt}>{familyMembers.length + 1}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Pressable style={styles.addMemberBtn} onPress={openAddMember}>
              <Feather name="plus" size={12} color="#22C55E" />
              <Text style={styles.addMemberTxt}>Add</Text>
            </Pressable>
            <Feather name={showFamily ? "chevron-up" : "chevron-down"} size={15} color="rgba(255,255,255,0.35)" />
          </Pressable>

          {showFamily && (
            <View style={styles.familyList}>
              {/* Self */}
              <View style={styles.familyCard}>
                <LinearGradient colors={["#4F46E5", "#06B6D4"]} style={styles.familyCardAvatar}>
                  <Text style={styles.familyAvatarTxt}>{initials}</Text>
                </LinearGradient>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {name ? (
                      <Text style={styles.familyCardName}>{name}</Text>
                    ) : (
                      <Text style={styles.familyCardNameHint}>Enter your full name</Text>
                    )}
                    <View style={styles.selfBadge}><Text style={styles.selfBadgeTxt}>Self</Text></View>
                  </View>
                  <Text style={styles.familyCardSub}>
                    {[patient?.age ? `${patient.age} yrs` : null, patient?.blood, phone].filter(Boolean).join(" · ")}
                  </Text>
                </View>
              </View>

              {familyMembers.length === 0 && (
                <View style={styles.emptyFamilyHint}>
                  <Feather name="users" size={16} color="rgba(129,140,248,0.4)" />
                  <Text style={styles.emptyFamilyTxt}>No family members added yet</Text>
                </View>
              )}

              {familyMembers.map(m => {
                const color = RELATION_COLORS[m.relation] ?? "#818CF8";
                return (
                  <Pressable key={m.id} style={styles.familyCard} onPress={() => openEditMember(m)}>
                    {m.avatar ? (
                      <Image source={{ uri: m.avatar }} style={[styles.familyCardImgAvatar, { borderColor: color + "50" }]} contentFit="cover" />
                    ) : (
                      <View style={[styles.familyCardAvatar, { backgroundColor: color + "30" }]}>
                        <Text style={[styles.familyAvatarTxt, { color }]}>{m.name.slice(0, 2).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={styles.familyCardName}>{m.name}</Text>
                        <View style={[styles.relationBadge, { backgroundColor: color + "18" }]}>
                          <Text style={[styles.relationBadgeTxt, { color }]}>{m.relation}</Text>
                        </View>
                      </View>
                      <Text style={styles.familyCardSub}>{[m.age ? `${m.age} yrs` : null, m.blood, m.phone].filter(Boolean).join(" · ")}</Text>
                    </View>
                    <Pressable onPress={() => deleteMember(m.id)}>
                      <Feather name="trash-2" size={13} color="rgba(239,68,68,0.5)" />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed, i < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => {
                    if (item.label === "Share LINESETU App") {
                      Share.share({
                        title: "LINESETU — Smart Queue & Token Management",
                        message:
                          "Skip the clinic wait! Book your doctor token online with LINESETU and track the live queue from your phone.\n\n📲 Download now: https://linesetu.com/app\n\nShare with your family and save their time too!",
                        url: "https://linesetu.com/app",
                      }).catch(() => {});
                      return;
                    }
                    if (item.label === "Sign Out") {
                      setShowSignOut(true);
                      return;
                    }
                    if (item.label === "Live Queue") {
                      router.push(`/queue/${activeToken?.id ?? "demo"}` as Href);
                      return;
                    }
                    if (item.route) router.push(item.route as Href);
                  }}
                >
                  <View style={[styles.menuIconBubble, { backgroundColor: item.color + "18", borderColor: item.color + "30" }]}>
                    <Feather name={item.icon} size={16} color={item.color} />
                  </View>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={[styles.menuLabel, item.danger && { color: item.color }]}>{item.label}</Text>
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
                    {!item.danger && <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.2)" />}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Feather name="shield" size={11} color="rgba(255,255,255,0.18)" />
          <Text style={styles.footerTxt}>LINESETU v2.0 · Your health, your queue</Text>
        </View>
      </ScrollView>

      {/* ── Edit Profile Modal ─────────────────────────────── */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable style={styles.modalOverlay} onPress={() => setEditVisible(false)}>
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Pressable onPress={() => setEditVisible(false)}>
                  <Feather name="x" size={20} color="rgba(255,255,255,0.5)" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                <FieldBlock label="Full Name" required>
                  <TextInput style={styles.textInput} value={eName} onChangeText={setEName} placeholder="Enter your name" placeholderTextColor="rgba(255,255,255,0.25)" />
                </FieldBlock>

                <FieldBlock label="Phone (read-only)">
                  <View style={[styles.textInput, { opacity: 0.5 }]}>
                    <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{phone}</Text>
                  </View>
                </FieldBlock>

                <FieldBlock label="Email" required>
                  <TextInput style={styles.textInput} value={eEmail} onChangeText={setEEmail} placeholder="Enter email address" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="email-address" autoCapitalize="none" />
                </FieldBlock>

                <FieldBlock label="Age" required>
                  <TextInput style={styles.textInput} value={eAge} onChangeText={setEAge} placeholder="e.g. 32" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="numeric" />
                </FieldBlock>

                <FieldBlock label="Gender" required>
                  <ChipSelector options={GENDERS} value={eGender} onChange={setEGender} color="#818CF8" />
                </FieldBlock>

                <FieldBlock label="Blood Group" required>
                  <ChipSelector options={BLOOD_GROUPS} value={eBlood} onChange={setEBlood} color="#EF4444" />
                </FieldBlock>

                <FieldBlock label="Area / Locality" required>
                  <TextInput style={styles.textInput} value={eArea} onChangeText={setEArea} placeholder="e.g. Andheri West, Bandra" placeholderTextColor="rgba(255,255,255,0.25)" />
                </FieldBlock>

                <FieldBlock label="Complete Address" required>
                  <TextInput
                    style={[styles.textInput, { minHeight: 80, textAlignVertical: "top" }]}
                    value={eAddress}
                    onChangeText={setEAddress}
                    placeholder="House/Flat no., Street, Landmark, City, PIN"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    multiline
                    numberOfLines={3}
                  />
                </FieldBlock>

                <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={saveProfile} disabled={saving}>
                  <Text style={styles.saveBtnTxt}>{saving ? "Saving…" : "Save Profile"}</Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Family Member Modal ────────────────────────────── */}
      <Modal visible={famVisible} transparent animationType="slide" onRequestClose={() => setFamVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable style={styles.modalOverlay} onPress={() => setFamVisible(false)}>
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingMem ? "Edit Member" : "Add Family Member"}</Text>
                <Pressable onPress={() => setFamVisible(false)}>
                  <Feather name="x" size={20} color="rgba(255,255,255,0.5)" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                <FieldBlock label="Full Name" required>
                  <TextInput style={styles.textInput} value={mName} onChangeText={setMName} placeholder="Member's name" placeholderTextColor="rgba(255,255,255,0.25)" />
                </FieldBlock>

                <FieldBlock label="Relation" required>
                  <ChipSelector options={RELATIONS} value={mRelation} onChange={setMRelation} color={RELATION_COLORS[mRelation] ?? "#818CF8"} />
                </FieldBlock>

                <FieldBlock label="Age" required>
                  <TextInput style={styles.textInput} value={mAge} onChangeText={setMAge} placeholder="e.g. 28" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="numeric" />
                </FieldBlock>

                <FieldBlock label="Blood Group" required>
                  <ChipSelector options={BLOOD_GROUPS} value={mBlood} onChange={setMBlood} color="#EF4444" />
                </FieldBlock>

                <FieldBlock label="Phone Number" required>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={[styles.textInput, { width: 54, alignItems: "center", justifyContent: "center", paddingHorizontal: 0 }]}>
                      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" }}>+91</Text>
                    </View>
                    <View style={{ flex: 1, position: "relative" }}>
                      <TextInput
                        style={[styles.textInput, { paddingRight: 52 }]}
                        value={mPhone}
                        onChangeText={(t) => setMPhone(t.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit number"
                        placeholderTextColor="rgba(255,255,255,0.25)"
                        keyboardType="number-pad"
                        maxLength={10}
                      />
                      <View style={{ position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" }}>
                        <Text style={{ fontSize: 11, color: mPhone.length === 10 ? "#4ADE80" : "rgba(255,255,255,0.35)", fontWeight: "600" }}>
                          {mPhone.length}/10
                        </Text>
                      </View>
                    </View>
                  </View>
                  {mPhone.length > 0 && mPhone.length < 10 && (
                    <Text style={{ fontSize: 11, color: "#EF4444", marginTop: 4, marginLeft: 2 }}>
                      Must be exactly 10 digits
                    </Text>
                  )}
                </FieldBlock>

                <FieldBlock label="Area / Locality" required>
                  <TextInput style={styles.textInput} value={mArea} onChangeText={setMArea} placeholder="e.g. Andheri West, Bandra" placeholderTextColor="rgba(255,255,255,0.25)" />
                </FieldBlock>

                <FieldBlock label="Complete Address" required>
                  <TextInput
                    style={[styles.textInput, { minHeight: 80, textAlignVertical: "top" }]}
                    value={mAddress}
                    onChangeText={setMAddress}
                    placeholder="House/Flat no., Street, Landmark, City, PIN"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    multiline
                    numberOfLines={3}
                  />
                </FieldBlock>

                <Pressable style={[styles.saveBtn, mSaving && { opacity: 0.6 }]} onPress={saveMember} disabled={mSaving}>
                  <Text style={styles.saveBtnTxt}>{mSaving ? "Saving…" : editingMem ? "Update Member" : "Add Member"}</Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Sign Out Confirmation Modal ─────────────────────── */}
      <Modal visible={showSignOut} transparent animationType="fade" onRequestClose={() => setShowSignOut(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center", padding: 32 }} onPress={() => setShowSignOut(false)}>
          <Pressable style={{ width: "100%", backgroundColor: "#111827", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }} onPress={() => {}}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 1, borderColor: "rgba(239,68,68,0.35)", alignItems: "center", justifyContent: "center", marginBottom: 16, alignSelf: "center" }}>
              <Feather name="log-out" size={22} color="#EF4444" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#FFF", textAlign: "center", marginBottom: 8 }}>Sign Out?</Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 20, marginBottom: 24 }}>You'll need to sign in again to access your account.</Text>
            <Pressable
              style={{ height: 48, borderRadius: 14, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center", marginBottom: 10 }}
              onPress={() => { setShowSignOut(false); logout(); }}
            >
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFF" }}>Yes, Sign Out</Text>
            </Pressable>
            <Pressable
              style={{ height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}
              onPress={() => setShowSignOut(false)}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.6)" }}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#0A0E1A" },
  orb1:       { position: "absolute", top: -60,  left: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.2)"  },
  orb2:       { position: "absolute", top: 300, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(6,182,212,0.1)"    },

  header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle:   { fontSize: 22, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  headerIconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  notifDot:      { position: "absolute", top: 6, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#0A0E1A" },

  userCardWrap:       { paddingHorizontal: 20, marginBottom: 20 },
  userCard:           { borderRadius: 24, padding: 18, borderWidth: 1.5, borderColor: "rgba(99,102,241,0.35)", overflow: "hidden" },
  cardGlowOrb:        { position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.05)" },
  userCardRow:        { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  userAvatarPhoto:    { width: 64, height: 64, borderRadius: 16, borderWidth: 2, borderColor: "rgba(99,102,241,0.45)" },
  userAvatarInitials: { backgroundColor: "rgba(79,70,229,0.35)", alignItems: "center", justifyContent: "center" },
  initialsText:       { fontSize: 22, fontWeight: "700", color: "#A5B4FC", letterSpacing: 1 },
  onlineIndicator:    { position: "absolute", top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: "#22C55E", borderWidth: 2, borderColor: "#0A0E1A" },
  userName:           { fontSize: 18, fontWeight: "900", color: "#FFF", letterSpacing: -0.3 },
  userNameHint:       { fontSize: 15, fontWeight: "600", color: "rgba(255,255,255,0.3)", fontStyle: "italic", letterSpacing: 0 },
  phoneRow:           { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  phoneText:          { fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: "600" },
  memberSince:        { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  memberSinceTxt:     { fontSize: 10, color: "#4ADE80", fontWeight: "600" },
  infoBadge:          { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  infoBadgeTxt:       { fontSize: 9, fontWeight: "700", color: "rgba(255,255,255,0.55)" },
  verifiedBadge:      { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, backgroundColor: "rgba(79,70,229,0.3)", borderWidth: 1, borderColor: "rgba(99,102,241,0.5)" },
  verifiedTxt:        { fontSize: 9, fontWeight: "700", color: "#A5B4FC" },
  statsRow:           { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  statPill:           { flex: 1, alignItems: "center", paddingVertical: 10 },
  statPillDivider:    { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.07)" },
  statVal:            { fontSize: 18, fontWeight: "900", lineHeight: 22 },
  statLbl:            { fontSize: 9, fontWeight: "600", color: "rgba(255,255,255,0.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },

  familySection:       { paddingHorizontal: 20, marginBottom: 20 },
  familyHeader:        { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  familyTitle:         { fontSize: 14, fontWeight: "700", color: "#FFF" },
  familyBadge:         { backgroundColor: "rgba(129,140,248,0.25)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  familyBadgeTxt:      { fontSize: 11, fontWeight: "800", color: "#818CF8" },
  addMemberBtn:        { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(34,197,94,0.12)", borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  addMemberTxt:        { fontSize: 11, fontWeight: "700", color: "#22C55E" },
  familyList:          { gap: 6 },
  familyCard:          { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  familyCardAvatar:    { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  familyAvatarTxt:     { fontSize: 14, fontWeight: "800", color: "#FFF" },
  familyCardImgAvatar: { width: 38, height: 38, borderRadius: 10, borderWidth: 2 },
  familyCardName:      { fontSize: 13, fontWeight: "800", color: "#FFF" },
  familyCardNameHint:  { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.3)", fontStyle: "italic" },
  selfBadge:           { backgroundColor: "rgba(99,102,241,0.2)", borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  selfBadgeTxt:        { fontSize: 8, fontWeight: "700", color: "#818CF8" },
  familyCardSub:       { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  relationBadge:       { borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  relationBadgeTxt:    { fontSize: 8, fontWeight: "700" },
  emptyFamilyHint:     { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 14, backgroundColor: "rgba(129,140,248,0.06)", borderWidth: 1, borderColor: "rgba(129,140,248,0.14)", borderStyle: "dashed" },
  emptyFamilyTxt:      { fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: "600" },

  menuSection:      { paddingHorizontal: 20, marginBottom: 16 },
  menuSectionTitle: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  menuCard:         { borderRadius: 20, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)" },
  menuItem:         { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, paddingHorizontal: 16 },
  menuItemPressed:  { backgroundColor: "rgba(255,255,255,0.04)" },
  menuItemBorder:   { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  menuIconBubble:   { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  menuLabel:        { fontSize: 14, fontWeight: "700", color: "#FFF" },
  menuSub:          { fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: "500" },
  livePip:          { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(34,197,94,0.15)", borderWidth: 1, borderColor: "rgba(34,197,94,0.35)" },
  livePipDot:       { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#22C55E" },
  livePipTxt:       { fontSize: 8, fontWeight: "800", color: "#4ADE80", letterSpacing: 0.8 },
  menuBadge:        { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  menuBadgeTxt:     { fontSize: 10, fontWeight: "800" },

  footer:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 10, paddingTop: 6 },
  footerTxt: { fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: "500" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet:   { backgroundColor: "#111827", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, maxHeight: "90%", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: 16 },
  modalHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: "900", color: "#FFF" },

  fieldBlock:    { marginBottom: 18 },
  fieldLabel:    { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8 },
  fieldRequired: { fontSize: 13, fontWeight: "900", color: "#EF4444", lineHeight: 16 },
  textInput:     { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#FFF", fontWeight: "600" },

  chip:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  chipTxt: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.45)" },

  saveBtn:    { marginTop: 8, backgroundColor: "#4F46E5", borderRadius: 16, paddingVertical: 15, alignItems: "center" },
  saveBtnTxt: { fontSize: 15, fontWeight: "800", color: "#FFF", letterSpacing: 0.3 },
});
