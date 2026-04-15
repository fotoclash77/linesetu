import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated, Alert,
} from 'react-native';
import { FeatherIcon as Feather } from "../components/FeatherIcon";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BG, TEAL, TEAL_LT } from '../constants/theme';
import { useDoctor } from '../contexts/DoctorContext';

const STATUS_ICONS = [0.4, 0.65, 0.9, 1];

function StatusBar() {
  return (
    <View style={styles.statusBar}>
      <Text style={styles.statusTime}>9:41</Text>
      <View style={styles.statusRight}>
        {STATUS_ICONS.map((op, i) => (
          <View key={i} style={[styles.signalBar, { height: 6 + i * 2, opacity: op }]} />
        ))}
        <View style={{ width: 6 }} />
        <View style={styles.batteryOuter}>
          <View style={styles.batteryInner} />
        </View>
      </View>
    </View>
  );
}

function TrustBadge({ label }: { label: string }) {
  return (
    <View style={styles.trustBadge}>
      <Text style={styles.trustDot}>✦</Text>
      <Text style={styles.trustLabel}>{label}</Text>
    </View>
  );
}

function OtpBox({ value, focused }: { value: string; focused: boolean }) {
  return (
    <View style={[
      styles.otpBox,
      value ? styles.otpBoxFilled : {},
      focused ? styles.otpBoxFocused : {},
    ]}>
      <Text style={styles.otpDigit}>{value || ''}</Text>
    </View>
  );
}

export default function LoginScreen() {
  const { loginWithOtp } = useDoctor();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpFocus, setOtpFocus] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const otpInputRef = useRef<TextInput>(null);
  const domain = process.env.EXPO_PUBLIC_DOMAIN;

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const phoneValid = phone.length === 10;
  const otpDigits = otp.split('').concat(Array(6).fill('')).slice(0, 6);
  const otpFilled = otp.length === 6;

  const handleSendOtp = async () => {
    if (!phoneValid || sending) return;
    setError('');
    setSending(true);
    try {
      const res = await fetch(`https://${domain}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      const data = await res.json();
      setStep('otp');
      setTimer(30);
      if (data.devOtp) {
        setOtp(String(data.devOtp));
        setOtpFocus(5);
      }
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (e: any) {
      setError(e.message || 'Could not send OTP. Try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!otpFilled || sending) return;
    setError('');
    setSending(true);
    try {
      await loginWithOtp(`+91${phone}`, otp);
    } catch (e: any) {
      setError(e.message || 'Verification failed. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <StatusBar />

        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Branding */}
            <View style={styles.brand}>
              <Text style={styles.brandName}>LINESETU</Text>
              <View style={styles.brandDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.brandSub}>DOCTOR PORTAL</Text>
                <View style={styles.dividerLine} />
              </View>
              <View style={styles.trustRow}>
                <TrustBadge label="Secure Login" />
                <TrustBadge label="Clinic Verified" />
                <TrustBadge label="MCI Registered" />
              </View>
            </View>

            {/* Card */}
            <View style={styles.card}>
              {/* Step indicator */}
              <View style={styles.stepRow}>
                {step === 'otp' && (
                  <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); }} style={styles.backBtn}>
                    <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {step === 'phone' ? 'Welcome, Doctor' : 'Verify OTP'}
                  </Text>
                  <Text style={styles.cardSub}>
                    {step === 'phone'
                      ? 'Enter your registered mobile number'
                      : `6-digit OTP sent to +91 ${phone}`}
                  </Text>
                </View>
                <View style={styles.stepDots}>
                  {[0, 1].map(i => (
                    <View key={i} style={[
                      styles.stepDot,
                      (step === 'phone' ? i === 0 : i === 1) && styles.stepDotActive,
                    ]} />
                  ))}
                </View>
              </View>

              {step === 'phone' && (
                <>
                  <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>
                  <View style={[styles.phoneInput, phoneValid && styles.phoneInputValid]}>
                    <View style={styles.countryCode}>
                      <Text style={styles.flag}>🇮🇳</Text>
                      <Text style={styles.countryNum}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneField}
                      placeholder="Enter 10 digit mobile no."
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                    />
                    {phoneValid && <View style={styles.phoneDot} />}
                  </View>
                  {phone.length > 0 && phone.length < 10 && (
                    <Text style={styles.phoneHint}>{10 - phone.length} more digits needed</Text>
                  )}

                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      OTP will be sent to your clinic-registered number. For doctor access only.
                    </Text>
                  </View>

                  {!!error && <Text style={styles.errorText}>{error}</Text>}
                  <TouchableOpacity
                    style={[styles.ctaBtn, !phoneValid && styles.ctaBtnDisabled]}
                    onPress={handleSendOtp}
                    disabled={!phoneValid || sending}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.ctaBtnText}>{sending ? 'Sending OTP…' : 'Send OTP'}</Text>
                      {!sending && <Feather name="arrow-right" size={15} color="#FFF" />}
                    </View>
                  </TouchableOpacity>
                </>
              )}

              {step === 'otp' && (
                <>
                  <TextInput
                    ref={otpInputRef}
                    style={styles.hiddenInput}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={t => {
                      const v = t.replace(/\D/g, '').slice(0, 6);
                      setOtp(v);
                      setOtpFocus(Math.min(v.length, 5));
                    }}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => otpInputRef.current?.focus()}>
                    <View style={styles.otpRow}>
                      {otpDigits.map((d, i) => (
                        <OtpBox key={i} value={d} focused={otpFocus === i && !otpFilled} />
                      ))}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.resendRow}>
                    {timer > 0 ? (
                      <Text style={styles.resendText}>
                        Resend OTP in <Text style={{ color: TEAL_LT }}>{timer}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={() => setTimer(30)}>
                        <Text style={styles.resendLink}>↻  Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {!!error && <Text style={styles.errorText}>{error}</Text>}
                  <TouchableOpacity
                    style={[styles.ctaBtn, (!otpFilled || sending) && styles.ctaBtnDisabled]}
                    onPress={handleVerify}
                    disabled={!otpFilled || sending}
                  >
                    {otpFilled && !sending
                      ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Feather name="check" size={14} color="#FFF" />
                          <Text style={styles.ctaBtnText}>Verify & Enter Dashboard</Text>
                        </View>
                      : <Text style={styles.ctaBtnText}>
                          {sending ? 'Verifying…' : 'Enter 6-digit OTP'}
                        </Text>
                    }
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>LINESETU · Smart Queue Management</Text>
              <Text style={styles.footerSub}>Authorised clinicians only · v1.0.4</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  statusBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 14, paddingBottom: 4,
  },
  statusTime: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  statusRight: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  signalBar: { width: 3, backgroundColor: '#FFF', borderRadius: 2 },
  batteryOuter: { width: 24, height: 12, borderRadius: 3.5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', marginLeft: 4, justifyContent: 'center', paddingHorizontal: 1 },
  batteryInner: { width: 14, height: 8, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 2 },
  glowTop: {
    position: 'absolute', top: -100, left: '10%', width: 340, height: 340, borderRadius: 170,
    backgroundColor: 'rgba(13,148,136,0.28)', transform: [{ scaleX: 1 }],
    opacity: 0.7,
  },
  glowBottom: {
    position: 'absolute', bottom: 60, right: -60, width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(6,182,212,0.14)',
    opacity: 0.6,
  },
  brand: { alignItems: 'center', paddingTop: 30, paddingBottom: 20 },
  brandName: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  brandDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 16 },
  dividerLine: { width: 28, height: 1, backgroundColor: 'rgba(45,212,191,0.5)' },
  brandSub: { fontSize: 11, fontWeight: '800', color: TEAL_LT, letterSpacing: 3 },
  trustRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  trustBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  trustDot: { fontSize: 10, color: TEAL_LT },
  trustLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  card: {
    marginHorizontal: 20, borderRadius: 28, padding: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22, gap: 8 },
  backBtn: {
    width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  cardSub: { fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2, fontWeight: '500' },
  stepDots: { flexDirection: 'row', gap: 5, alignItems: 'center', flexShrink: 0 },
  stepDot: { width: 6, height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
  stepDotActive: { width: 20, backgroundColor: TEAL_LT },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1.2, marginBottom: 8 },
  phoneInput: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  phoneInputValid: { borderColor: 'rgba(45,212,191,0.5)' },
  countryCode: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 54, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)' },
  flag: { fontSize: 18 },
  countryNum: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  phoneField: { flex: 1, paddingHorizontal: 14, fontSize: 18, fontWeight: '700', color: '#FFF', height: 54 },
  phoneDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: TEAL_LT, marginRight: 14 },
  phoneHint: { fontSize: 10, color: 'rgba(245,158,11,0.8)', fontWeight: '600', marginBottom: 8, paddingLeft: 4 },
  infoBox: {
    backgroundColor: 'rgba(13,148,136,0.1)', borderWidth: 1, borderColor: 'rgba(13,148,136,0.2)',
    borderRadius: 12, padding: 12, marginBottom: 20,
  },
  infoText: { fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 16.5, fontWeight: '500' },
  ctaBtn: {
    height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: TEAL,
  },
  ctaBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.07)' },
  ctaBtnText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  otpBox: {
    width: 48, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)',
  },
  otpBoxFilled: { backgroundColor: 'rgba(45,212,191,0.12)', borderColor: 'rgba(45,212,191,0.4)' },
  otpBoxFocused: { borderColor: TEAL_LT },
  otpDigit: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  resendRow: { alignItems: 'center', marginBottom: 20 },
  resendText: { fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
  resendLink: { fontSize: 12, fontWeight: '700', color: TEAL_LT },
  errorText: { fontSize: 12, color: '#F87171', fontWeight: '600', textAlign: 'center', marginBottom: 10, paddingHorizontal: 4 },
  footer: { alignItems: 'center', paddingTop: 24, paddingBottom: 4 },
  footerText: { fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: '600' },
  footerSub: { fontSize: 10, color: 'rgba(255,255,255,0.12)', marginTop: 4 },
});
