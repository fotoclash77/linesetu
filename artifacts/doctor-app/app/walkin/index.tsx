import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import { useDoctor } from '../../contexts/DoctorContext';

const BASE = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

function relTime(bookedAt: any): string {
  let ms: number;
  if (bookedAt && typeof bookedAt === 'object' && bookedAt.seconds) {
    ms = bookedAt.seconds * 1000;
  } else if (typeof bookedAt === 'number') {
    ms = bookedAt;
  } else {
    return '';
  }
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  return `${h}h ago`;
}

interface TokenRow {
  id: string;
  tokenNumber: number;
  patientName: string;
  type: string;
  status: string;
  bookedAt: any;
}

function currentShift(): 'morning' | 'evening' {
  return new Date().getHours() < 13 ? 'morning' : 'evening';
}

export default function AddWalkinScreen() {
  const { doctor } = useDoctor();
  const [tokenType, setTokenType] = useState<'Normal' | 'Emergency'>('Normal');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedName, setBookedName] = useState('');
  const [bookedToken, setBookedToken] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');

  const [queue, setQueue]       = useState<TokenRow[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);

  useEffect(() => {
    if (!doctor?.id) return;

    const url = `${BASE()}/api/tokens/stream/${doctor.id}?date=${todayDate()}`;

    // Use SSE (EventSource) for zero-delay real-time updates
    if (typeof EventSource !== 'undefined') {
      const es = new EventSource(url);

      es.onmessage = (e) => {
        try {
          const tokens: TokenRow[] = JSON.parse(e.data);
          const sorted = [...tokens].sort((a, b) => {
            const ta = a.bookedAt?.seconds ?? 0;
            const tb = b.bookedAt?.seconds ?? 0;
            return tb - ta;
          });
          setQueue(sorted);
          setQueueLoading(false);
        } catch (_) {}
      };

      es.onerror = () => setQueueLoading(false);

      return () => es.close();
    }

    // Fallback: poll every 8s on platforms without EventSource
    const poll = async () => {
      try {
        const res  = await fetch(`${BASE()}/api/tokens?doctorId=${doctor.id}&date=${todayDate()}`);
        const data = await res.json();
        if (data.tokens) {
          const sorted = [...data.tokens].sort((a: TokenRow, b: TokenRow) => {
            const ta = a.bookedAt?.seconds ?? 0;
            const tb = b.bookedAt?.seconds ?? 0;
            return tb - ta;
          });
          setQueue(sorted);
        }
      } catch (_) {}
      setQueueLoading(false);
    };
    poll();
    const iv = setInterval(poll, 8_000);
    return () => clearInterval(iv);
  }, [doctor?.id]);

  const isEmerg = tokenType === 'Emergency';

  // Compute next token number from live queue
  const maxTokenInQueue = queue.reduce((m, t) => Math.max(m, t.tokenNumber ?? 0), 0);
  const nextTokenPreview = maxTokenInQueue + 1;

  const handleBook = async () => {
    const trimmedName    = name.trim();
    const trimmedPhone   = phone.trim();
    const trimmedAge     = age.trim();
    const trimmedAddress = address.trim();
    const trimmedArea    = area.trim();

    if (!trimmedName)    { setBookingError('Patient name is required'); return; }
    if (!trimmedAge || isNaN(Number(trimmedAge)) || Number(trimmedAge) < 1 || Number(trimmedAge) > 99) {
      setBookingError('Valid age is required (1–99)'); return;
    }
    if (!trimmedPhone || trimmedPhone.length !== 10) {
      setBookingError('10-digit phone number is required'); return;
    }
    if (!trimmedAddress) { setBookingError('Address is required'); return; }
    if (!trimmedArea)    { setBookingError('Area / city is required'); return; }
    if (!doctor?.id)     { setBookingError('Doctor not loaded'); return; }

    setBooking(true);
    setBookingError('');
    try {
      const res = await fetch(`${BASE()}/api/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientId: null,
          patientName: trimmedName,
          patientPhone: phone.trim(),
          type: tokenType.toLowerCase(),
          shift: currentShift(),
          source: 'walkin',
          age: trimmedAge,
          gender,
          address: trimmedAddress,
          area: trimmedArea,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setBookingError(err.error || 'Booking failed');
        setBooking(false);
        return;
      }
      const data = await res.json();
      setBookedName(trimmedName);
      setBookedToken(`#${data.tokenNumber}`);
      setShowSuccess(true);
    } catch (e: any) {
      setBookingError(e.message || 'Network error');
    }
    setBooking(false);
  };

  const resetForm = () => {
    setName(''); setAge(''); setPhone('');
    setAddress(''); setArea('');
    setGender('M'); setTokenType('Normal');
    setBookingError('');
    setShowSuccess(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.glowTop, { backgroundColor: isEmerg ? 'rgba(239,68,68,0.18)' : 'rgba(13,148,136,0.18)' }]} />
        <View style={styles.glowBottom} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Book Walk-in Token</Text>
              <Text style={styles.headerSub}>Register patient directly at clinic</Text>
            </View>
          </View>

          {/* Next token info — real number from live queue */}
          <View style={[styles.nextTokenCard, { backgroundColor: isEmerg ? 'rgba(239,68,68,0.13)' : 'rgba(13,148,136,0.13)', borderColor: isEmerg ? 'rgba(239,68,68,0.3)' : 'rgba(13,148,136,0.3)' }]}>
            <View style={styles.nextTokenLeft}>
              <View style={[styles.nextTokenBox, { backgroundColor: isEmerg ? 'rgba(239,68,68,0.25)' : 'rgba(13,148,136,0.25)', borderColor: isEmerg ? 'rgba(239,68,68,0.4)' : 'rgba(45,212,191,0.4)' }]}>
                <Text style={[styles.nextTokenLabel, { color: isEmerg ? '#FCA5A5' : TEAL_LT }]}>Next</Text>
                <Text style={styles.nextTokenNum}>{queueLoading ? '…' : `#${nextTokenPreview}`}</Text>
              </View>
              <View>
                <Text style={styles.nextTokenTitle}>Next Token</Text>
                <Text style={styles.nextTokenValue}>{isEmerg ? 'Emergency' : 'Normal'} {queueLoading ? '' : `#${nextTokenPreview}`}</Text>
              </View>
            </View>
          </View>

          {/* Token type toggle */}
          <Text style={styles.fieldGroupLabel}>TOKEN TYPE</Text>
          <View style={styles.tokenTypeToggle}>
            {(['Normal', 'Emergency'] as const).map(t => {
              const active = tokenType === t;
              const isE = t === 'Emergency';
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTokenType(t)}
                  style={[
                    styles.tokenTypeBtn,
                    active && (isE ? styles.tokenTypeBtnEmergencyActive : styles.tokenTypeBtnNormalActive),
                  ]}
                >
                  <Text style={{ fontSize: 18, color: active ? (isE ? '#F87171' : TEAL_LT) : 'rgba(255,255,255,0.3)' }}>
                    {isE ? '⚡' : '✓'}
                  </Text>
                  <Text style={[styles.tokenTypeBtnText, active && { color: '#FFF' }]}>{t}</Text>
                  <Text style={[styles.tokenTypeBtnFree, { color: active ? (isE ? '#FCA5A5' : TEAL_LT) : 'rgba(255,255,255,0.2)' }]}>FREE</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Patient form */}
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>PATIENT DETAILS</Text>

            {/* Name */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>👤 PATIENT NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Age + Gender row */}
            <View style={styles.rowFields}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>📅 AGE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 35"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={age}
                  onChangeText={t => setAge(t.replace(/\D/g, '').slice(0, 2))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>GENDER</Text>
                <View style={styles.genderToggle}>
                  {(['M', 'F'] as const).map(g => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    >
                      <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>
                        {g === 'M' ? '♂ Male' : '♀ Female'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>📞 PHONE NUMBER</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryPrefix}><Text style={styles.countryPrefixText}>+91</Text></View>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="98765 43210"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>📍 AREA</Text>
              <TextInput
                style={styles.input}
                placeholder="Street / Area"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            {/* Area */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>🗺 ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="Village / Colony / City / Pin Code"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={area}
                onChangeText={setArea}
              />
            </View>
          </View>

          {/* Booking error */}
          {!!bookingError && (
            <View style={{ marginBottom: 10, paddingHorizontal: 4, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }}>
              <Text style={{ color: '#FCA5A5', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>⚠ {bookingError}</Text>
            </View>
          )}

          {/* Book button */}
          <TouchableOpacity
            onPress={handleBook}
            disabled={booking}
            style={[styles.bookBtn, isEmerg ? styles.bookBtnEmergency : styles.bookBtnNormal, booking && { opacity: 0.6 }]}
          >
            {booking ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.bookBtnText}>{`✚ Book ${tokenType} Token — FREE`}</Text>
            )}
          </TouchableOpacity>

          {/* Live queue today */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentIcon}>📋</Text>
              <Text style={styles.recentTitle}>TODAY'S QUEUE (LATEST FIRST)</Text>
              {!queueLoading && (
                <View style={styles.queueCount}>
                  <Text style={styles.queueCountTxt}>{queue.length}</Text>
                </View>
              )}
            </View>

            {queueLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={TEAL_LT} />
                <Text style={styles.loadingTxt}>Loading queue…</Text>
              </View>
            ) : queue.length === 0 ? (
              <View style={styles.emptyQueue}>
                <Text style={styles.emptyQueueTxt}>No tokens booked today yet.</Text>
              </View>
            ) : (
              queue.map((t) => {
                const isE = t.type === 'emergency';
                const label = isE
                  ? `E${String(t.tokenNumber).padStart(2, '0')}`
                  : `#${t.tokenNumber}`;
                const STATUS_COLOR: Record<string, string> = {
                  waiting:    '#FCD34D',
                  in_consult: TEAL_LT,
                  done:       '#4ADE80',
                  cancelled:  '#F87171',
                };
                const statusColor = STATUS_COLOR[t.status] ?? 'rgba(255,255,255,0.3)';
                return (
                  <View key={t.id} style={styles.recentItem}>
                    <View style={[
                      styles.recentToken,
                      {
                        backgroundColor: isE ? 'rgba(239,68,68,0.2)' : 'rgba(13,148,136,0.2)',
                        borderColor:     isE ? 'rgba(239,68,68,0.35)' : 'rgba(45,212,191,0.35)',
                      },
                    ]}>
                      <Text style={styles.recentTokenText}>{label}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentName}>{t.patientName}</Text>
                      <Text style={styles.recentSub}>
                        <Text style={{ color: isE ? '#F87171' : TEAL_LT }}>
                          {isE ? 'Emergency' : 'Normal'}
                        </Text>
                        {'  ·  '}
                        <Text style={{ color: statusColor }}>{t.status.replace('_', ' ')}</Text>
                      </Text>
                    </View>
                    <Text style={styles.recentTime}>{relTime(t.bookedAt)}</Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* Success overlay */}
      {showSuccess && (
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            {/* Icon */}
            <View style={styles.successIconWrap}>
              <Text style={styles.successIcon}>✓</Text>
            </View>

            <Text style={styles.successTitle}>Token Booked!</Text>
            <Text style={styles.successSub}>
              Token <Text style={styles.successHighlight}>{bookedToken}</Text> assigned to{' '}
              <Text style={styles.successHighlight}>{bookedName}</Text>
            </Text>
            <Text style={styles.successNote}>Patient has been added to the queue.</Text>

            {/* Buttons */}
            <View style={styles.successBtns}>
              <TouchableOpacity
                style={styles.btnNewToken}
                activeOpacity={0.8}
                onPress={resetForm}
              >
                <Text style={styles.btnNewTokenTxt}>＋ Book New Token</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnHome}
                activeOpacity={0.8}
                onPress={() => { setShowSuccess(false); router.replace('/'); }}
              >
                <Text style={styles.btnHomeTxt}>Go Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG },
  glowTop: { position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: 120, opacity: 0.5 },
  glowBottom: { position: 'absolute', bottom: 100, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(99,102,241,0.1)', opacity: 0.5 },
  scroll: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
  nextTokenCard: {
    borderRadius: 16, padding: 10, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1,
  },
  nextTokenLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nextTokenBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  nextTokenLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  nextTokenNum: { fontSize: 14, fontWeight: '900', color: '#FFF' },
  nextTokenTitle: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.6 },
  nextTokenValue: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  waitingCount: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.45)' },
  freeBadge: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  fieldGroupLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 },
  tokenTypeToggle: {
    flexDirection: 'row', gap: 5, padding: 4, borderRadius: 16, marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  tokenTypeBtn: { flex: 1, height: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tokenTypeBtnNormalActive: { backgroundColor: 'rgba(13,148,136,0.28)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.5)' },
  tokenTypeBtnEmergencyActive: { backgroundColor: 'rgba(239,68,68,0.25)', borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.5)' },
  tokenTypeBtnText: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.38)' },
  tokenTypeBtnFree: { fontSize: 9, fontWeight: '700' },
  formCard: {
    borderRadius: 20, padding: 16, marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  formCardTitle: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  fieldWrap: { marginBottom: 10 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 5 },
  input: {
    width: '100%', height: 46, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)', color: '#FFF', fontSize: 13, fontWeight: '500',
    paddingHorizontal: 14,
  },
  rowFields: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  genderToggle: { flexDirection: 'row', gap: 5, height: 46 },
  genderBtn: { flex: 1, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  genderBtnActive: { backgroundColor: 'rgba(99,102,241,0.28)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.5)' },
  genderBtnText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.38)' },
  genderBtnTextActive: { color: '#A5B4FC' },
  phoneRow: { flexDirection: 'row', gap: 6 },
  countryPrefix: { width: 50, height: 46, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  countryPrefixText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  bookBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  bookBtnNormal: { backgroundColor: TEAL },
  bookBtnEmergency: { backgroundColor: '#DC2626' },
  bookBtnBooked: { backgroundColor: '#16A34A' },
  bookBtnText: { fontSize: 14, fontWeight: '900', color: '#FFF' },
  recentSection: {},
  recentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  recentIcon: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  recentTitle: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 9, borderRadius: 14, marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  recentToken: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1 },
  recentTokenText: { fontSize: 11, fontWeight: '900', color: '#FFF', letterSpacing: -0.3 },
  recentName: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  recentSub: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
  recentTime: { fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: '600' },
  queueCount: { marginLeft: 'auto', backgroundColor: 'rgba(45,212,191,0.15)', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)' },
  queueCountTxt: { fontSize: 10, fontWeight: '800', color: TEAL_LT },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, justifyContent: 'center' },
  loadingTxt: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.3)' },
  emptyQueue: { padding: 20, alignItems: 'center' },
  emptyQueueTxt: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.25)', textAlign: 'center' },

  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,14,26,0.85)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successCard: {
    width: '100%', borderRadius: 24, padding: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.3)',
    alignItems: 'center', gap: 6,
  },
  successIconWrap: {
    width: 64, height: 64, borderRadius: 20, marginBottom: 6,
    backgroundColor: 'rgba(13,148,136,0.25)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  successIcon:      { fontSize: 28, color: TEAL_LT, fontWeight: '900' },
  successTitle:     { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, marginBottom: 2 },
  successSub:       { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20 },
  successHighlight: { fontWeight: '800', color: TEAL_LT },
  successNote:      { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.3)', marginTop: 2, marginBottom: 10 },
  successBtns:      { flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 },
  btnNewToken: {
    height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: TEAL, borderWidth: 0,
  },
  btnNewTokenTxt:   { fontSize: 13, fontWeight: '900', color: '#FFF' },
  btnHome: {
    height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)',
  },
  btnHomeTxt:       { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
});
