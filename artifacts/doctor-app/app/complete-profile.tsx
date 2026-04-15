import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, BackHandler, Platform, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BG, TEAL, TEAL_LT } from '../constants/theme';
import { useDoctor } from '../contexts/DoctorContext';

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic Surgeon',
  'Gynecologist', 'Pediatrician', 'ENT Specialist', 'Neurologist',
  'Ophthalmologist', 'Dentist', 'Psychiatrist', 'Other',
];

const STEPS = ['Basic Info', 'About You'];

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <View style={[s.dot, active && s.dotActive, done && s.dotDone]}>
      {done && <Feather name="check" size={10} color="#FFF" />}
    </View>
  );
}

export default function CompleteProfile() {
  const { doctor, updateDoctor } = useDoctor();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [customSpec, setCustomSpec] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const finalSpec = specialization === 'Other' ? customSpec : specialization;

  const validateStep1 = () => {
    const errs: Record<string, boolean> = {};
    if (!name.trim()) errs.name = true;
    if (!finalSpec.trim()) errs.specialization = true;
    if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(1);
  };

  const handleSave = async () => {
    const errs: Record<string, boolean> = {};
    if (!qualifications.trim()) errs.qualifications = true;
    if (!experience.trim()) errs.experience = true;
    if (!bio.trim()) errs.bio = true;
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      await updateDoctor({
        name: name.trim(),
        specialization: finalSpec.trim(),
        qualifications: qualifications.trim(),
        experience: experience.trim(),
        bio: bio.trim(),
        profileCompleted: true,
      } as any);
      router.replace('/(tabs)');
    } catch {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={s.header}>
            <Text style={s.brand}>LINESETU</Text>
            <Text style={s.tagline}>Smart Queue · Token Management</Text>
          </View>

          {/* Step indicator */}
          <View style={s.stepRow}>
            {STEPS.map((label, i) => (
              <React.Fragment key={i}>
                <View style={s.stepItem}>
                  <StepDot active={step === i} done={step > i} />
                  <Text style={[s.stepLabel, step === i && s.stepLabelActive]}>{label}</Text>
                </View>
                {i < STEPS.length - 1 && <View style={[s.stepLine, step > i && s.stepLineDone]} />}
              </React.Fragment>
            ))}
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>
              {step === 0 ? 'Welcome, Doctor!' : 'Tell us more'}
            </Text>
            <Text style={s.cardSub}>
              {step === 0
                ? "Let's set up your profile so patients can find and book with you."
                : 'Your credentials help patients trust you.'}
            </Text>

            {step === 0 ? (
              <>
                {/* Name */}
                <Text style={s.label}>Full Name <Text style={s.required}>*</Text></Text>
                <TextInput
                  style={[s.input, errors.name && s.inputError]}
                  placeholder="e.g. Dr. Priya Sharma"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={name}
                  onChangeText={v => { setName(v); setErrors(e => ({ ...e, name: false })); }}
                />
                {errors.name && <Text style={s.errText}>Name is required</Text>}

                {/* Specialization */}
                <Text style={[s.label, { marginTop: 18 }]}>Specialization <Text style={s.required}>*</Text></Text>
                <View style={s.chipWrap}>
                  {SPECIALIZATIONS.map(spec => (
                    <TouchableOpacity
                      key={spec}
                      style={[s.chip, specialization === spec && s.chipActive]}
                      onPress={() => { setSpecialization(spec); setErrors(e => ({ ...e, specialization: false })); }}
                    >
                      <Text style={[s.chipTxt, specialization === spec && s.chipTxtActive]}>{spec}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {specialization === 'Other' && (
                  <TextInput
                    style={[s.input, { marginTop: 10 }, errors.specialization && s.inputError]}
                    placeholder="Type your specialization"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={customSpec}
                    onChangeText={v => { setCustomSpec(v); setErrors(e => ({ ...e, specialization: false })); }}
                  />
                )}
                {errors.specialization && <Text style={s.errText}>Specialization is required</Text>}
              </>
            ) : (
              <>
                {/* Qualifications */}
                <Text style={s.label}>Qualifications <Text style={s.required}>*</Text></Text>
                <TextInput
                  style={[s.input, errors.qualifications && s.inputError]}
                  placeholder="e.g. MBBS, MD (Cardiology)"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={qualifications}
                  onChangeText={v => { setQualifications(v); setErrors(e => ({ ...e, qualifications: false })); }}
                />
                {errors.qualifications && <Text style={s.errText}>Qualifications are required</Text>}

                {/* Experience */}
                <Text style={[s.label, { marginTop: 18 }]}>Years of Experience <Text style={s.required}>*</Text></Text>
                <TextInput
                  style={[s.input, errors.experience && s.inputError]}
                  placeholder="e.g. 12 years"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={experience}
                  onChangeText={v => { setExperience(v); setErrors(e => ({ ...e, experience: false })); }}
                  keyboardType="default"
                />
                {errors.experience && <Text style={s.errText}>Experience is required</Text>}

                {/* Bio */}
                <Text style={[s.label, { marginTop: 18 }]}>Short Bio <Text style={s.required}>*</Text></Text>
                <TextInput
                  style={[s.input, s.textArea, errors.bio && s.inputError]}
                  placeholder="Briefly describe your expertise and practice..."
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={bio}
                  onChangeText={v => { setBio(v); setErrors(e => ({ ...e, bio: false })); }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.bio && <Text style={s.errText}>Bio is required</Text>}
              </>
            )}
          </View>

          {/* Action button */}
          {step === 0 ? (
            <TouchableOpacity style={s.btn} onPress={handleNext} activeOpacity={0.85}>
              <Text style={s.btnTxt}>Continue →</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.btnRow}>
              <TouchableOpacity style={s.btnBack} onPress={() => { setStep(0); setErrors({}); }} activeOpacity={0.8}>
                <Text style={s.btnBackTxt}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, s.btnFlex, saving && s.btnDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving
                  ? <ActivityIndicator color="#000" size="small" />
                  : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Feather name="arrow-right" size={14} color="#000" /><Text style={s.btnTxt}>Get Started</Text></View>}
              </TouchableOpacity>
            </View>
          )}

          <Text style={s.footer}>You can update these anytime from Settings</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 22, paddingBottom: 40, paddingTop: 12 },
  header: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  brand: { fontSize: 26, fontWeight: '800', color: TEAL_LT, letterSpacing: 3 },
  tagline: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, letterSpacing: 0.5 },

  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  stepItem: { alignItems: 'center', gap: 6 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  dotActive: { borderColor: TEAL_LT, backgroundColor: 'rgba(45,212,191,0.12)' },
  dotDone: { borderColor: TEAL, backgroundColor: TEAL },
  dotCheck: { fontSize: 12, color: '#000', fontWeight: '800' },
  stepLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
  stepLabelActive: { color: TEAL_LT },
  stepLine: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8, marginBottom: 18 },
  stepLineDone: { backgroundColor: TEAL },

  card: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 6 },
  cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 18 },

  label: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  required: { color: '#F87171' },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: '#FFF', fontWeight: '500' },
  inputError: { borderColor: 'rgba(239,68,68,0.6)', backgroundColor: 'rgba(239,68,68,0.06)' },
  textArea: { minHeight: 90, paddingTop: 12 },
  errText: { fontSize: 10, color: '#F87171', fontWeight: '600', marginTop: 5 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.04)' },
  chipActive: { borderColor: TEAL_LT, backgroundColor: 'rgba(45,212,191,0.15)' },
  chipTxt: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  chipTxtActive: { color: TEAL_LT },

  btn: { backgroundColor: TEAL_LT, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { fontSize: 15, fontWeight: '800', color: '#0A0F1E', letterSpacing: 0.3 },
  btnFlex: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnBack: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  btnBackTxt: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },

  footer: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 16 },
});
