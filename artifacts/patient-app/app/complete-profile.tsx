import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "I Don't Know"];

const isWeb = Platform.OS === "web";

function getApiBase() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "http://localhost:8080";
}

export default function CompleteProfile() {
  const insets = useSafeAreaInsets();
  const { patient, updatePatient } = useAuth();

  const [name, setName] = useState(patient?.name ?? "");
  const [gender, setGender] = useState(patient?.gender ?? "");
  const [age, setAge] = useState(patient?.age ?? "");
  const [blood, setBlood] = useState(patient?.blood ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const topPad = isWeb ? 56 : insets.top;
  const bottomPad = isWeb ? 28 : insets.bottom + 16;

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  const validate = () => {
    const errs: Record<string, boolean> = {};
    if (!name.trim()) errs.name = true;
    if (!gender) errs.gender = true;
    if (!age.trim()) errs.age = true;
    if (!blood) errs.blood = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!patient) return;
    setSaving(true);
    try {
      await updatePatient({
        name: name.trim(),
        gender,
        age: age.trim(),
        blood,
        profileCompleted: true,
      });
    } catch {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={["#0A0E1A", "#0F1629", "#0A0E1A"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Brand */}
          <View style={s.header}>
            <View style={s.logoRing}>
              <Feather name="activity" size={28} color="#67E8F9" />
            </View>
            <Text style={s.brand}>LINESETU</Text>
            <Text style={s.tagline}>Smart Queue · Token Management</Text>
          </View>

          {/* Headline */}
          <Text style={s.title}>Almost there!</Text>
          <Text style={s.sub}>Complete your profile so doctors can serve you better.</Text>

          {/* Card */}
          <View style={s.card}>

            {/* Name */}
            <Text style={s.label}>Your Full Name <Text style={s.req}>*</Text></Text>
            <TextInput
              style={[s.input, errors.name && s.inputErr]}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={name}
              onChangeText={v => { setName(v); setErrors(e => ({ ...e, name: false })); }}
              autoCapitalize="words"
            />
            {errors.name && <Text style={s.errTxt}>Name is required</Text>}

            {/* Gender */}
            <Text style={[s.label, { marginTop: 18 }]}>Gender <Text style={s.req}>*</Text></Text>
            <View style={s.chipRow}>
              {GENDERS.map(g => (
                <Pressable
                  key={g}
                  style={[s.chip, gender === g && s.chipActive]}
                  onPress={() => { setGender(g); setErrors(e => ({ ...e, gender: false })); }}
                >
                  <Text style={[s.chipTxt, gender === g && s.chipTxtActive]}>{g}</Text>
                </Pressable>
              ))}
            </View>
            {errors.gender && <Text style={s.errTxt}>Please select your gender</Text>}

            {/* Age */}
            <Text style={[s.label, { marginTop: 18 }]}>Age <Text style={s.req}>*</Text></Text>
            <TextInput
              style={[s.input, s.inputHalf, errors.age && s.inputErr]}
              placeholder="e.g. 28"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={age}
              onChangeText={v => { setAge(v.replace(/\D/g, "")); setErrors(e => ({ ...e, age: false })); }}
              keyboardType="numeric"
              maxLength={3}
            />
            {errors.age && <Text style={s.errTxt}>Age is required</Text>}

            {/* Blood Group */}
            <Text style={[s.label, { marginTop: 18 }]}>Blood Group <Text style={s.req}>*</Text></Text>
            <View style={s.chipWrap}>
              {BLOOD_GROUPS.map(bg => (
                <Pressable
                  key={bg}
                  style={[s.chip, s.chipBlood, blood === bg && s.chipActive]}
                  onPress={() => { setBlood(bg); setErrors(e => ({ ...e, blood: false })); }}
                >
                  <Text style={[s.chipTxt, blood === bg && s.chipTxtActive]}>{bg}</Text>
                </Pressable>
              ))}
            </View>
            {errors.blood && <Text style={s.errTxt}>Please select your blood group</Text>}

          </View>

          {/* Continue button */}
          <Pressable
            style={[s.btn, saving && s.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#0A0E1A" size="small" />
              : <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={s.btnTxt}>Continue to App</Text>
                  <Feather name="arrow-right" size={16} color="#0A0E1A" />
                </View>}
          </Pressable>

          <Text style={s.footer}>You can update these anytime from your profile</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const TEAL = "#06B6D4";
const TEAL_LT = "#67E8F9";

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 22 },

  header: { alignItems: "center", marginBottom: 24 },
  logoRing: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(6,182,212,0.15)", borderWidth: 1.5, borderColor: "rgba(6,182,212,0.3)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  brand: { fontSize: 22, fontWeight: "800", color: TEAL_LT, letterSpacing: 3 },
  tagline: { fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3, letterSpacing: 0.5 },

  title: { fontSize: 24, fontWeight: "800", color: "#FFF", textAlign: "center", marginBottom: 6 },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: 24, lineHeight: 20 },

  card: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 20, marginBottom: 20 },

  label: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.65)", marginBottom: 8 },
  req: { color: "#F87171" },
  input: { backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#FFF", fontWeight: "500" },
  inputHalf: { width: 120 },
  inputErr: { borderColor: "rgba(239,68,68,0.6)", backgroundColor: "rgba(239,68,68,0.06)" },
  errTxt: { fontSize: 10, color: "#F87171", fontWeight: "600", marginTop: 5 },

  chipRow: { flexDirection: "row", gap: 10 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.2, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)" },
  chipBlood: { paddingHorizontal: 12, paddingVertical: 7 },
  chipActive: { borderColor: TEAL_LT, backgroundColor: "rgba(103,232,249,0.15)" },
  chipTxt: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.55)" },
  chipTxtActive: { color: TEAL_LT },

  btn: { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 16, alignItems: "center", shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { fontSize: 16, fontWeight: "800", color: "#0A0E1A", letterSpacing: 0.3 },

  footer: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 16 },
});
