import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';

const RECENT = [
  { token: '#50', name: 'Arvind Kumar', age: 41, gender: 'M', type: 'Normal',    time: '2m ago' },
  { token: '#48', name: 'Rajan Gupta',  age: 28, gender: 'M', type: 'Normal',    time: '15m ago' },
  { token: 'E01', name: 'Deepak Joshi', age: 58, gender: 'M', type: 'Emergency', time: '22m ago' },
];

export default function AddWalkinScreen() {
  const [tokenType, setTokenType] = useState<'Normal' | 'Emergency'>('Normal');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [booked, setBooked] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const isEmerg = tokenType === 'Emergency';

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => setBooked(false), 2000);
  };

  const inputStyle = [styles.input];

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

          {/* Next token info */}
          <View style={[styles.nextTokenCard, { backgroundColor: isEmerg ? 'rgba(239,68,68,0.13)' : 'rgba(13,148,136,0.13)', borderColor: isEmerg ? 'rgba(239,68,68,0.3)' : 'rgba(13,148,136,0.3)' }]}>
            <View style={styles.nextTokenLeft}>
              <View style={[styles.nextTokenBox, { backgroundColor: isEmerg ? 'rgba(239,68,68,0.25)' : 'rgba(13,148,136,0.25)', borderColor: isEmerg ? 'rgba(239,68,68,0.4)' : 'rgba(45,212,191,0.4)' }]}>
                <Text style={[styles.nextTokenLabel, { color: isEmerg ? '#FCA5A5' : TEAL_LT }]}>Next</Text>
                <Text style={styles.nextTokenNum}>{isEmerg ? 'E03' : '#52'}</Text>
              </View>
              <View>
                <Text style={styles.nextTokenTitle}>Next Token</Text>
                <Text style={styles.nextTokenValue}>{isEmerg ? 'Emergency E03' : 'Normal #52'}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.waitingCount}>⏱ 4 waiting</Text>
              <Text style={[styles.freeBadge, { color: isEmerg ? '#FCA5A5' : TEAL_LT }]}>FREE</Text>
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
                  value={age}
                  onChangeText={setAge}
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
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>📍 ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="Area / locality"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          {/* Book button */}
          <TouchableOpacity
            onPress={handleBook}
            style={[
              styles.bookBtn,
              booked ? styles.bookBtnBooked : isEmerg ? styles.bookBtnEmergency : styles.bookBtnNormal,
            ]}
          >
            <Text style={styles.bookBtnText}>
              {booked
                ? '✓ Token Booked!'
                : `✚ Book ${tokenType} Token — FREE`}
            </Text>
          </TouchableOpacity>

          {/* Recent walk-ins */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentIcon}>🚶</Text>
              <Text style={styles.recentTitle}>RECENT WALK-INS TODAY</Text>
            </View>
            {RECENT.map((r, i) => {
              const isE = r.type === 'Emergency';
              return (
                <View key={i} style={styles.recentItem}>
                  <View style={[styles.recentToken, { backgroundColor: isE ? 'rgba(239,68,68,0.2)' : 'rgba(13,148,136,0.2)', borderColor: isE ? 'rgba(239,68,68,0.35)' : 'rgba(45,212,191,0.35)' }]}>
                    <Text style={styles.recentTokenText}>{r.token}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentName}>{r.name}</Text>
                    <Text style={styles.recentSub}>
                      {r.age}{r.gender} · <Text style={{ color: isE ? '#F87171' : TEAL_LT }}>{r.type}</Text>
                    </Text>
                  </View>
                  <Text style={styles.recentTime}>{r.time}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
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
  tokenTypeBtn: { flex: 1, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 3 },
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
});
